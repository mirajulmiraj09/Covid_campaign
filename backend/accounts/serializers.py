# serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Profile, Role, UserRole
from datetime import datetime

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'nid', 'dob', 
                  'gender', 'phone', 'address', 'medical_history']
    
    def validate_nid(self, value):
        if Profile.objects.filter(nid=value).exists():
            raise serializers.ValidationError("A user with this NID already exists.")
        return value
    
    def validate_dob(self, value):
        if value > datetime.now().date():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        
        age = (datetime.now().date() - value).days / 365.25
        if age < 1:
            raise serializers.ValidationError("User must be at least 1 year old.")
        
        return value


class RegistrationSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        role_type = self.context.get('role_type', 'patient')
        
        # Pop the entire profile object
        profile_data = validated_data.pop('profile')
        validated_data.pop('confirm_password')
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Create profile
        Profile.objects.create(user=user, **profile_data)
        
        # Assign role
        role_name = Role.DOCTOR if role_type == 'doctor' else Role.PATIENT
        role, _ = Role.objects.get_or_create(role_name=role_name)
        UserRole.objects.create(user=user, role=role)
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    class Meta:
        model = User 
        fields = ['user_id', 'email', 'is_active', 'created_at', 'role']
    
    def get_role(self, obj):   
        user_role = obj.userrole_set.first()
        return user_role.role.role_name if user_role else None


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Password fields didn't match."
            })
        
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from old password."
            })
        
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
