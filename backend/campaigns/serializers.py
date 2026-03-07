from django.utils import timezone
from rest_framework import serializers
from campaigns.models import Campaign, Vaccine


class VaccineSerializer(serializers.ModelSerializer):
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    class Meta:
        model = Vaccine
        fields =  [
            'vaccine_id', 'campaign', 'campaign_title', 'name', 
            'dose_interval', 'total_doses', 'stock_quantity', 'manufacturer'
        ]
        read_only_fields = ['vaccine_id']

    def validate_dose_interval(self, value):
        if value < 0:
            raise serializers.ValidationError("Dose interval must be a non-negative integer.")
        return value
    def validate_total_doses(self, value):
        if value < 1:
            raise serializers.ValidationError("Total doses must be at least 1.")
        return value
    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity must be a non-negative integer.")
        return value

class VaccineCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccine
        fields =  [
            'campaign', 'name', 
            'dose_interval', 'total_doses', 'stock_quantity', 'manufacturer'
        ]
    def validate_dose_interval(self, value):
        if value < 0:
            raise serializers.ValidationError("Dose interval cannot be negative.")
        return value

    def validate_total_doses(self, value):
        if value < 1:
            raise serializers.ValidationError("Total doses must be at least 1.")
        return value



class CampaignSerializer(serializers.ModelSerializer):
    vaccines = VaccineSerializer(many=True, read_only=True)
    vaccine_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    assigned_doctors_list = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'campaign_id', 'title', 'description', 'start_date', 'end_date', 
            'is_active', 'visibility', 'created_by', 'created_by_name', 
            'created_at', 'vaccines', 'vaccine_count', 'assigned_doctors_list'
        ]
        read_only_fields = ['campaign_id', 'created_by', 'created_at']

    def get_vaccine_count(self, obj):
        return obj.vaccines.count()
    
    def get_created_by_name(self, obj):
        if obj.created_by and hasattr(obj.created_by, 'profile'):
            profile = obj.created_by.profile
            return f"Dr. {profile.first_name} {profile.last_name}"
        return "Unknown"

    def get_assigned_doctors_list(self, obj):
        doctors = obj.assigned_doctors.all()
        result = []
        for d in doctors:
            name = d.email
            if hasattr(d, 'profile'):
                p = d.profile
                name = f"Dr. {p.first_name} {p.last_name}"
            result.append({'id': d.pk, 'name': name, 'email': d.email})
        return result

    def validate(self, attrs):
        if attrs.get('start_date') and attrs.get('end_date'):
            if attrs['start_date'] > attrs['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        return attrs
        
class CampaignCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ['title', 'description', 'start_date', 'end_date', 'is_active', 'visibility']
    
    def validate(self, attrs):
        if attrs['start_date'] > attrs['end_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })
        
        if attrs['start_date'] < timezone.now().date():
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be in the past.'
            })
        
        return attrs
    

class CampaignListSerializer(serializers.ModelSerializer):
    vaccine_count = serializers.SerializerMethodField()
    assigned_doctor_count = serializers.SerializerMethodField()
    assigned_doctors_list = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'campaign_id', 'title', 'description', 'start_date', 
            'end_date', 'is_active', 'visibility', 'vaccine_count', 'assigned_doctor_count',
            'assigned_doctors_list'
        ]
    
    def get_vaccine_count(self, obj):
        return obj.vaccines.count()

    def get_assigned_doctor_count(self, obj):
        return obj.assigned_doctors.count()

    def get_assigned_doctors_list(self, obj):
        doctors = obj.assigned_doctors.all()
        result = []
        for d in doctors:
            name = d.email
            if hasattr(d, 'profile'):
                p = d.profile
                name = f"Dr. {p.first_name} {p.last_name}"
            result.append({'id': d.pk, 'name': name, 'email': d.email})
        return result

