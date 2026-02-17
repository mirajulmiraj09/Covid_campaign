from rest_framework import serializers
from .models import Booking, VaccinationRecord
from campaigns.models import Vaccine, Campaign
from datetime import timedelta


class BookingSerializer(serializers.ModelSerializer):
    """Used for listing/retrieving bookings (read-only display)"""
    patient_name = serializers.SerializerMethodField()
    vaccine_name = serializers.CharField(source='vaccine.name', read_only=True)
    campaign_title = serializers.CharField(source='vaccine.campaign.title', read_only=True)
    campaign_start_date = serializers.DateField(source='vaccine.campaign.start_date', read_only=True)
    campaign_end_date = serializers.DateField(source='vaccine.campaign.end_date', read_only=True)
    campaign_is_active = serializers.BooleanField(source='vaccine.campaign.is_active', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'booking_id', 'patient', 'patient_name', 'vaccine',
            'vaccine_name', 'campaign_title', 'dose_number',
            'scheduled_date', 'status', 'created_at',
            'campaign_start_date', 'campaign_end_date', 'campaign_is_active'
        ]
        read_only_fields = ['booking_id', 'patient', 'created_at']

    def get_patient_name(self, obj):
        if hasattr(obj.patient, 'profile'):
            profile = obj.patient.profile
            return f"{profile.first_name} {profile.last_name}"
        return obj.patient.email


class BookingCreateSerializer(serializers.Serializer):
    """Used for creating a booking — only writable fields the patient submits"""
    campaign = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.all(),
        required=False,
        allow_null=True
    )
    vaccine_id = serializers.PrimaryKeyRelatedField(
        queryset=Vaccine.objects.all(),
        source='vaccine'
    )
    scheduled_date = serializers.DateField(required=True)

    def validate(self, attrs):
        vaccine = attrs.get('vaccine')
        campaign_obj = attrs.get('campaign')

        # If campaign was provided, make sure the vaccine belongs to it
        if campaign_obj and vaccine.campaign_id != campaign_obj.campaign_id:
            raise serializers.ValidationError(
                {'vaccine_id': 'Selected vaccine does not belong to the chosen campaign.'}
            )

        # Check stock
        if vaccine.stock_quantity <= 0:
            raise serializers.ValidationError(
                {'vaccine_id': 'This vaccine is out of stock.'}
            )

        self._vaccine = vaccine
        return attrs

    def validate_scheduled_date(self, value):
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("Scheduled date cannot be in the past.")
        return value

    def create(self, validated_data):
        vaccine = validated_data.pop('vaccine')
        validated_data.pop('campaign', None)  # campaign is not stored on Booking
        patient = self.context['request'].user
        scheduled_date = validated_data['scheduled_date']

        # Create dose 1
        booking_dose_1 = Booking.objects.create(
            patient=patient,
            vaccine=vaccine,
            dose_number=1,
            scheduled_date=scheduled_date,
            status='Pending'
        )

        # Auto-create dose 2 if vaccine requires it
        if vaccine.total_doses > 1:
            Booking.objects.create(
                patient=patient,
                vaccine=vaccine,
                dose_number=2,
                scheduled_date=scheduled_date + timedelta(days=vaccine.dose_interval),
                status='Pending'
            )

        # Decrease stock by 1 per patient booking (not per dose)
        vaccine.stock_quantity -= 1
        vaccine.save()

        return booking_dose_1


class CampaignVaccinesSerializer(serializers.ModelSerializer):
    """Used by CampaignVaccinesView to return vaccine options for a campaign"""
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Vaccine
        fields = [
            'vaccine_id', 'name', 'total_doses',
            'dose_interval', 'stock_quantity', 'in_stock'
        ]

    def get_in_stock(self, obj):
        return obj.stock_quantity > 0



class VaccinationRecordSerializer(serializers.ModelSerializer):
    """Vaccination record serializer"""
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    vaccine_name = serializers.CharField(source='booking.vaccine.name', read_only=True)
    
    class Meta:
        model = VaccinationRecord
        fields = [
            'record_id', 'booking', 'doctor', 'doctor_name',
            'patient_name', 'vaccine_name', 'administered_at',
            'batch_number', 'remarks'
        ]
        read_only_fields = ['record_id', 'administered_at']
    
    def get_patient_name(self, obj):
        if hasattr(obj.booking.patient, 'profile'):
            profile = obj.booking.patient.profile
            return f"{profile.first_name} {profile.last_name}"
        return obj.booking.patient.email
    
    def get_doctor_name(self, obj):
        if obj.doctor and hasattr(obj.doctor, 'profile'):
            profile = obj.doctor.profile
            return f"Dr. {profile.first_name} {profile.last_name}"
        return "Unknown"


class VaccinateSerializer(serializers.Serializer):
    """Serializer for recording vaccination"""
    booking_id = serializers.IntegerField(required=True)
    batch_number = serializers.CharField(required=True, max_length=50)
    remarks = serializers.CharField(required=False, allow_blank=True)
    
    def validate_booking_id(self, value):
        try:
            booking = Booking.objects.get(booking_id=value)
            if booking.status != 'Pending':
                raise serializers.ValidationError("This booking is not pending.")
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found.")
        return value
    
    def create(self, validated_data):
        booking = Booking.objects.get(booking_id=validated_data['booking_id'])
        doctor = self.context['request'].user
        
        # Create vaccination record
        record = VaccinationRecord.objects.create(
            booking=booking,
            doctor=doctor,
            batch_number=validated_data['batch_number'],
            remarks=validated_data.get('remarks', '')
        )
        
        # Update booking status
        booking.status = 'Completed'
        booking.save()
        
        return record