from django.urls import path
from .views import DoctorAppointmentsView,BookingCancelView, MyBookingsView, BookingCreateView, CampaignVaccinesView, VaccinateView, download_certificate

urlpatterns = [
    path('bookings/my-bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/campaign/<int:campaign_id>/vaccines/', CampaignVaccinesView.as_view(), name='campaign-vaccines'),
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    
    # Doctor endpoints
    path('doctor/appointments/', DoctorAppointmentsView.as_view(), name='doctor-appointments'),
    path('vaccinate/', VaccinateView.as_view(), name='vaccinate'),
    
    # Certificate
    path('certificates/<str:nid>/', download_certificate, name='certificate-download'),
]