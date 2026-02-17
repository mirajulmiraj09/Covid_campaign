# reviews/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from campaigns.permissions import IsPatient
from .models import CampaignReview
from .serializers import CampaignReviewSerializer, CampaignReviewCreateSerializer


class CampaignReviewListView(generics.ListAPIView):
    """
    GET: List all reviews for a specific campaign
    """
    serializer_class = CampaignReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.kwargs['campaign_id']
        return CampaignReview.objects.filter(
            campaign_id=campaign_id
        ).select_related('patient', 'campaign').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate average rating
        if queryset.exists():
            avg_rating = sum(r.rating for r in queryset) / len(queryset)
        else:
            avg_rating = 0
        
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'average_rating': round(avg_rating, 2),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CampaignReviewCreateView(generics.CreateAPIView):
    """
    POST: Create a review for a campaign (Patient only)
    """
    serializer_class = CampaignReviewCreateSerializer
    permission_classes = [IsPatient]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            review = serializer.save(patient=request.user)
            
            response_serializer = CampaignReviewSerializer(review)
            
            return Response({
                'status': 'success',
                'message': 'Review submitted successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Review submission failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class MyReviewsView(generics.ListAPIView):
    """
    GET: List all reviews by the authenticated patient
    """
    serializer_class = CampaignReviewSerializer
    permission_classes = [IsPatient]
    
    def get_queryset(self):
        return CampaignReview.objects.filter(
            patient=self.request.user
        ).select_related('campaign').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)