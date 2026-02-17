from django.urls import path
from .views import (
    CampaignListCreateView,
    CampaignVaccinesView,
    VaccineCreateView,
    VaccineUpdateDeleteView
)

app_name = 'campaigns'

urlpatterns = [
    # Campaign endpoints
    path('campaigns/', CampaignListCreateView.as_view(), name='campaign-list-create'),
    path('campaigns/<int:campaign_id>/vaccines/', CampaignVaccinesView.as_view(), name='campaign-vaccines'),
    
    # Vaccine endpoints
    path('vaccines/', VaccineCreateView.as_view(), name='vaccine-create'),
    path('vaccines/<int:vaccine_id>/', VaccineUpdateDeleteView.as_view(), name='vaccine-update-delete'),
]