# campaigns/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from campaigns.models import Campaign, Vaccine
from campaigns.serializers import (
    CampaignSerializer, 
    CampaignCreateSerializer,
    CampaignListSerializer,
    VaccineSerializer,
    VaccineCreateSerializer
)
from campaigns.permissions import IsDoctor, IsSuperuserOrStaff
from accounts.models import Role

User = get_user_model()


class CampaignListCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CampaignCreateSerializer
        return CampaignListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSuperuserOrStaff()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Campaign.objects.all()
        
        # Filter by is_active
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            campaign = serializer.save(created_by=request.user)
            
            response_serializer = CampaignSerializer(campaign)
            
            return Response({
                'status': 'success',
                'message': 'Campaign created successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Campaign creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CampaignVaccinesView(generics.ListAPIView):
    serializer_class = VaccineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.kwargs['campaign_id']
        return Vaccine.objects.filter(campaign_id=campaign_id)
    
    def list(self, request, *args, **kwargs):
        campaign_id = self.kwargs['campaign_id']
        
        # Check if campaign exists
        campaign = get_object_or_404(Campaign, campaign_id=campaign_id)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'campaign': {
                'id': campaign.campaign_id,
                'title': campaign.title
            },
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class VaccineCreateView(generics.CreateAPIView):
    queryset = Vaccine.objects.all()
    serializer_class = VaccineCreateSerializer
    permission_classes = [IsDoctor]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            campaign = serializer.validated_data['campaign']
            if not campaign.assigned_doctors.filter(pk=request.user.pk).exists():
                return Response(
                    {'status': 'error', 'message': 'You are not assigned to this campaign.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            vaccine = serializer.save()
            
            response_serializer = VaccineSerializer(vaccine)
            
            return Response({
                'status': 'success',
                'message': 'Vaccine added successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Vaccine creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VaccineUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [IsDoctor]
    lookup_field = 'vaccine_id'
    
    def check_campaign_assignment(self, instance):
        if not instance.campaign.assigned_doctors.filter(pk=self.request.user.pk).exists():
            return Response(
                {'status': 'error', 'message': 'You are not assigned to this campaign.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        denied = self.check_campaign_assignment(instance)
        if denied:
            return denied
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            
            return Response({
                'status': 'success',
                'message': 'Vaccine updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Vaccine update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        denied = self.check_campaign_assignment(instance)
        if denied:
            return denied
        
        # Soft delete: set stock_quantity to 0
        instance.stock_quantity = 0
        instance.save()
        
        return Response({
            'status': 'success',
            'message': 'Vaccine removed successfully (soft delete)'
        }, status=status.HTTP_200_OK)


class AssignDoctorsView(APIView):
    """POST: Assign doctors to a campaign (staff/superuser only)"""
    permission_classes = [IsSuperuserOrStaff]

    def post(self, request, campaign_id):
        campaign = get_object_or_404(Campaign, campaign_id=campaign_id)
        doctor_ids = request.data.get('doctor_ids', [])

        if not isinstance(doctor_ids, list):
            return Response(
                {'status': 'error', 'message': 'doctor_ids must be a list.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doctors = User.objects.filter(pk__in=doctor_ids)
        valid_doctors = [
            d for d in doctors
            if d.is_superuser or d.roles.filter(role_name=Role.DOCTOR).exists()
        ]

        campaign.assigned_doctors.set(valid_doctors)

        serializer = CampaignSerializer(campaign)
        return Response(
            {'status': 'success', 'message': 'Doctors assigned.', 'data': serializer.data},
            status=status.HTTP_200_OK,
        )


class CampaignDetailView(APIView):
    """GET: Full campaign detail with assigned doctors"""
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        campaign = get_object_or_404(Campaign, campaign_id=campaign_id)
        serializer = CampaignSerializer(campaign)
        return Response(
            {'status': 'success', 'data': serializer.data},
            status=status.HTTP_200_OK,
        )


class CampaignPatientsView(APIView):
    """GET: List patients booked for a campaign (assigned doctor, creator, or superuser)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        campaign = get_object_or_404(Campaign, campaign_id=campaign_id)
        user = request.user

        # Only assigned doctors, campaign creator, staff, or superuser
        allowed = (
            user.is_superuser
            or user.is_staff
            or campaign.created_by_id == user.pk
            or campaign.assigned_doctors.filter(pk=user.pk).exists()
        )
        if not allowed:
            return Response(
                {'status': 'error', 'message': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        from operations.models import Booking
        from operations.serializers import BookingSerializer

        bookings = (
            Booking.objects.filter(vaccine__campaign_id=campaign.campaign_id)
            .select_related('patient__profile', 'vaccine')
            .order_by('-scheduled_date')
        )
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response(
            {'status': 'success', 'count': len(serializer.data), 'data': serializer.data},
            status=status.HTTP_200_OK,
        )