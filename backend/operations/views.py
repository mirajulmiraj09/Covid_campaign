# Django Imports
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

# Python Standard Library
from datetime import datetime, date, timedelta
import io

# DRF Imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView, CreateAPIView

# ReportLab
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Local App Imports
from campaigns.models import Campaign, Vaccine
from accounts.models import Profile
from .models import Booking, VaccinationRecord
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    VaccinationRecordSerializer,
    VaccinateSerializer,
    CampaignVaccinesSerializer
)
from .permissions import IsDoctor, IsPatient, IsBookingOwner


class MyBookingsView(ListAPIView):
    """GET /bookings/my-bookings/ — returns all bookings for the logged-in patient"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            patient=self.request.user
        ).select_related(
            'vaccine', 'vaccine__campaign', 'patient__profile'
        ).order_by('-created_at')


class BookingCreateView(CreateAPIView):
    """POST /bookings/ — patient submits campaign, vaccine_id, scheduled_date"""
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        response_serializer = BookingSerializer(
            booking,
            context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CampaignVaccinesView(APIView):
    """
    GET /bookings/campaign/<campaign_id>/vaccines/
    Returns campaign info + filtered vaccine list for the booking form.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        try:
            campaign = Campaign.objects.prefetch_related('vaccines').get(pk=campaign_id)
        except Campaign.DoesNotExist:
            return Response(
                {'error': 'Campaign not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        vaccines = campaign.vaccines.all()
        vaccine_data = CampaignVaccinesSerializer(vaccines, many=True).data

        data = {
            'campaign_id': campaign.campaign_id,
            'campaign_title': campaign.title,
            'campaign_start_date': campaign.start_date,
            'campaign_end_date': campaign.end_date,
            'campaign_is_active': campaign.is_active,
            'vaccines': vaccine_data,
        }
        return Response(data, status=status.HTTP_200_OK)


class BookingCancelView(APIView):
    """POST: Cancel a booking (owner only, pending or approved only)"""
    permission_classes = [IsPatient, IsBookingOwner]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, booking_id=booking_id)

        if booking.patient != request.user:
            return Response({
                'status': 'error',
                'message': 'You do not have permission to cancel this booking.'
            }, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in ('Pending', 'Approved'):
            return Response({
                'status': 'error',
                'message': f'Cannot cancel booking with status: {booking.status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'Cancelled'
        booking.save()

        vaccine = booking.vaccine
        vaccine.stock_quantity += 1
        vaccine.save()

        return Response({
            'status': 'success',
            'message': 'Booking cancelled successfully'
        }, status=status.HTTP_200_OK)


class DoctorAppointmentsView(generics.ListAPIView):
    """
    GET: List doctor's APPROVED appointments for today (or a given date).
    Query params:
      ?date=YYYY-MM-DD  → filter specific date (default: today)
      ?scope=upcoming   → all approved from today onward
    """
    serializer_class = BookingSerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        scope = self.request.query_params.get('scope', None)
        today = timezone.now().date()

        base = Booking.objects.filter(
            status='Approved'
        ).select_related('patient', 'vaccine', 'vaccine__campaign')

        if scope == 'upcoming':
            return base.filter(scheduled_date__gte=today).order_by('scheduled_date')

        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                filter_date = today
        else:
            filter_date = today

        return base.filter(scheduled_date=filter_date).order_by('scheduled_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        date_str = self.request.query_params.get('date', str(timezone.now().date()))

        return Response({
            'status': 'success',
            'date': date_str,
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class PendingBookingsView(generics.ListAPIView):
    """
    GET: List PENDING bookings for campaigns the doctor is assigned to.
    Query params: ?category=today|previous|upcoming (default: all)
    """
    serializer_class = BookingSerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        doctor = self.request.user
        today = timezone.now().date()
        assigned_campaigns = Campaign.objects.filter(assigned_doctors=doctor)
        base = Booking.objects.filter(
            vaccine__campaign__in=assigned_campaigns,
            status='Pending'
        ).select_related('patient', 'vaccine', 'vaccine__campaign')

        category = self.request.query_params.get('category', None)
        if category == 'today':
            return base.filter(scheduled_date=today).order_by('created_at')
        elif category == 'previous':
            return base.filter(scheduled_date__lt=today).order_by('-scheduled_date')
        elif category == 'upcoming':
            return base.filter(scheduled_date__gt=today).order_by('scheduled_date')
        return base.order_by('created_at')

    def list(self, request, *args, **kwargs):
        doctor = request.user
        today = timezone.now().date()
        assigned_campaigns = Campaign.objects.filter(assigned_doctors=doctor)
        base = Booking.objects.filter(
            vaccine__campaign__in=assigned_campaigns,
            status='Pending'
        )
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'today_count': base.filter(scheduled_date=today).count(),
            'previous_count': base.filter(scheduled_date__lt=today).count(),
            'upcoming_count': base.filter(scheduled_date__gt=today).count(),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class BookingApproveView(APIView):
    """POST: Approve a pending booking (assigned doctor only)"""
    permission_classes = [IsDoctor]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, booking_id=booking_id)

        if booking.status != 'Pending':
            return Response({
                'status': 'error',
                'message': f'Cannot approve booking with status: {booking.status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        campaign = booking.vaccine.campaign
        if not campaign.assigned_doctors.filter(pk=request.user.pk).exists():
            return Response({
                'status': 'error',
                'message': 'You are not assigned to this campaign.'
            }, status=status.HTTP_403_FORBIDDEN)

        booking.status = 'Approved'
        booking.save()

        return Response({
            'status': 'success',
            'message': 'Booking approved successfully.'
        }, status=status.HTTP_200_OK)


class BookingRejectView(APIView):
    """POST: Reject a pending booking (assigned doctor only)"""
    permission_classes = [IsDoctor]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, booking_id=booking_id)

        if booking.status != 'Pending':
            return Response({
                'status': 'error',
                'message': f'Cannot reject booking with status: {booking.status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        campaign = booking.vaccine.campaign
        if not campaign.assigned_doctors.filter(pk=request.user.pk).exists():
            return Response({
                'status': 'error',
                'message': 'You are not assigned to this campaign.'
            }, status=status.HTTP_403_FORBIDDEN)

        booking.status = 'Rejected'
        booking.save()

        vaccine = booking.vaccine
        vaccine.stock_quantity += 1
        vaccine.save()

        return Response({
            'status': 'success',
            'message': 'Booking rejected successfully.'
        }, status=status.HTTP_200_OK)


class VaccinateView(generics.CreateAPIView):
    """POST: Record a vaccination (Doctor only)"""
    serializer_class = VaccinateSerializer
    permission_classes = [IsDoctor]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            record = serializer.save()
            response_serializer = VaccinationRecordSerializer(record)

            return Response({
                'status': 'success',
                'message': 'Vaccination recorded successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'error',
            'message': 'Vaccination recording failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsPatient])
def download_certificate(request, nid):
    """GET: Download vaccination certificate PDF"""

    # Check NID belongs to authenticated user
    try:
        profile = Profile.objects.get(nid=nid)
        if profile.user != request.user:
            return Response({
                'status': 'error',
                'message': 'You do not have permission to access this certificate.'
            }, status=status.HTTP_403_FORBIDDEN)
    except Profile.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Profile not found.'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only count non-cancelled, non-rejected bookings
    all_bookings = Booking.objects.filter(
        patient=profile.user
    ).exclude(status__in=['Cancelled', 'Rejected'])

    completed_bookings = all_bookings.filter(status='Completed')

    if not all_bookings.exists():
        return Response({
            'status': 'error',
            'message': 'No vaccination records found.'
        }, status=status.HTTP_404_NOT_FOUND)

    if completed_bookings.count() == 0:
        return Response({
            'status': 'error',
            'message': 'You need at least one completed dose to download the certificate.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check all non-cancelled bookings are completed
    if all_bookings.count() != completed_bookings.count():
        return Response({
            'status': 'error',
            'message': f'Not all doses are completed yet. ({completed_bookings.count()}/{all_bookings.count()} done)'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Generate PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width / 2, height - 100, "VACCINATION CERTIFICATE")

    # Patient Info
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, height - 150, "Patient Information:")

    p.setFont("Helvetica", 12)
    p.drawString(100, height - 180, f"Name: {profile.first_name} {profile.last_name}")
    p.drawString(100, height - 200, f"NID: {profile.nid}")
    p.drawString(100, height - 220, f"Date of Birth: {profile.dob}")

    # Vaccination Records
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, height - 270, "Vaccination Records:")

    y_position = height - 300
    p.setFont("Helvetica", 10)

    for booking in completed_bookings.order_by('dose_number'):
        record = VaccinationRecord.objects.filter(booking=booking).first()
        if record:
            p.drawString(100, y_position,
                f"Dose {booking.dose_number}: {booking.vaccine.name} - "
                f"Date: {record.administered_at.strftime('%Y-%m-%d')} - "
                f"Batch: {record.batch_number}")
            y_position -= 20

    # Footer
    p.setFont("Helvetica", 10)
    p.drawCentredString(width / 2, 50,
        f"Certificate generated on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}")

    p.showPage()
    p.save()

    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="vaccination_certificate_{nid}.pdf"'

    return response