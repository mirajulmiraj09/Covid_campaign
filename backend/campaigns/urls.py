from django.urls import path
from .views import (
    CampaignListCreateView,
    CampaignVaccinesView,
    CampaignDetailView,
    VaccineCreateView,
    VaccineUpdateDeleteView,
    AssignDoctorsView,
    CampaignPatientsView,
)

app_name = 'campaigns'

urlpatterns = [
    # Campaign endpoints
    path('campaigns/', CampaignListCreateView.as_view(), name='campaign-list-create'),
    path('campaigns/<int:campaign_id>/', CampaignDetailView.as_view(), name='campaign-detail'),
    path('campaigns/<int:campaign_id>/vaccines/', CampaignVaccinesView.as_view(), name='campaign-vaccines'),
    path('campaigns/<int:campaign_id>/assign-doctors/', AssignDoctorsView.as_view(), name='campaign-assign-doctors'),
    path('campaigns/<int:campaign_id>/patients/', CampaignPatientsView.as_view(), name='campaign-patients'),
    
    # Vaccine endpoints
    path('vaccines/', VaccineCreateView.as_view(), name='vaccine-create'),
    path('vaccines/<int:vaccine_id>/', VaccineUpdateDeleteView.as_view(), name='vaccine-update-delete'),
]