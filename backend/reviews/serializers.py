# reviews/serializers.py
from rest_framework import serializers
from .models import CampaignReview
from operations.models import Booking


class CampaignReviewSerializer(serializers.ModelSerializer):
    """Campaign review serializer"""
    patient_name = serializers.SerializerMethodField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    
    class Meta:
        model = CampaignReview
        fields = [
            'review_id', 'campaign', 'campaign_title', 
            'patient', 'patient_name', 'rating', 
            'comment', 'created_at'
        ]
        read_only_fields = ['review_id', 'patient', 'created_at']
    
    def get_patient_name(self, obj):
        if hasattr(obj.patient, 'profile'):
            profile = obj.patient.profile
            return f"{profile.first_name} {profile.last_name}"
        return obj.patient.email
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate(self, attrs):
        # Check if user has booked a service for this campaign
        patient = self.context['request'].user
        campaign = attrs.get('campaign')
        
        # Check if patient has any booking for vaccines in this campaign
        has_booking = Booking.objects.filter(
            patient=patient,
            vaccine__campaign=campaign
        ).exists()
        
        if not has_booking:
            raise serializers.ValidationError({
                'campaign': 'You can only review campaigns you have booked services for.'
            })
        
        return attrs


class CampaignReviewCreateSerializer(serializers.ModelSerializer):
    """Campaign review creation serializer"""
    
    class Meta:
        model = CampaignReview
        fields = ['campaign', 'rating', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate(self, attrs):
        patient = self.context['request'].user
        campaign = attrs.get('campaign')
        
        # Check if user has booked a service for this campaign
        has_booking = Booking.objects.filter(
            patient=patient,
            vaccine__campaign=campaign
        ).exists()
        
        if not has_booking:
            raise serializers.ValidationError({
                'campaign': 'You can only review campaigns you have booked services for.'
            })
        
        # Check if user has already reviewed this campaign
        if CampaignReview.objects.filter(patient=patient, campaign=campaign).exists():
            raise serializers.ValidationError({
                'campaign': 'You have already reviewed this campaign.'
            })
        
        return attrs