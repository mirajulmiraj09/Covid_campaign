# campaigns/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from campaigns.models import Campaign, Vaccine
from campaigns.serializers import (
    CampaignSerializer, 
    CampaignCreateSerializer,
    CampaignListSerializer,
    VaccineSerializer,
    VaccineCreateSerializer
)
from campaigns.permissions import IsDoctor


class CampaignListCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CampaignCreateSerializer
        return CampaignListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsDoctor()]
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
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
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
        
        # Soft delete: set stock_quantity to 0
        instance.stock_quantity = 0
        instance.save()
        
        return Response({
            'status': 'success',
            'message': 'Vaccine removed successfully (soft delete)'
        }, status=status.HTTP_200_OK)