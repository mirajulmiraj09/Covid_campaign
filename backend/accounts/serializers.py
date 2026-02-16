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