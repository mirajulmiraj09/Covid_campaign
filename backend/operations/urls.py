from django.urls import path
from .views import (
    DoctorAppointmentsView,
    BookingCancelView,
    MyBookingsView,
    BookingCreateView,
    CampaignVaccinesView,
    VaccinateView,
    download_certificate,
    PendingBookingsView,
    BookingApproveView,
    BookingRejectView,
)

urlpatterns = [
    path('bookings/my-bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/campaign/<int:campaign_id>/vaccines/', CampaignVaccinesView.as_view(), name='campaign-vaccines'),
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('bookings/<int:booking_id>/approve/', BookingApproveView.as_view(), name='booking-approve'),
    path('bookings/<int:booking_id>/reject/', BookingRejectView.as_view(), name='booking-reject'),
    
    # Doctor endpoints
    path('doctor/appointments/', DoctorAppointmentsView.as_view(), name='doctor-appointments'),
    path('doctor/pending-bookings/', PendingBookingsView.as_view(), name='doctor-pending-bookings'),
    path('vaccinate/', VaccinateView.as_view(), name='vaccinate'),
    
    # Certificate
    path('certificates/<str:nid>/', download_certificate, name='certificate-download'),
]