# reviews/urls.py
from django.urls import path
from .views import (
    CampaignReviewListView,
    CampaignReviewCreateView,
    MyReviewsView
)

app_name = 'reviews'

urlpatterns = [
    path('campaigns/<int:campaign_id>/reviews/', CampaignReviewListView.as_view(), name='campaign-reviews'),
    path('reviews/', CampaignReviewCreateView.as_view(), name='review-create'),
    path('reviews/my-reviews/', MyReviewsView.as_view(), name='my-reviews'),
]