# operations/models.py
from django.db import models
from django.conf import settings


class Booking(models.Model):
    """Transactional data (The Plan)"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    booking_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_bookings'
    )
    vaccine = models.ForeignKey(
        'campaigns.Vaccine',
        on_delete=models.CASCADE,
        related_name='vaccine_bookings'
    )
    dose_number = models.SmallIntegerField()
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.booking_id} - Dose {self.dose_number}"


class VaccinationRecord(models.Model):
    """Transactional data (The Reality)"""
    record_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='vaccination_record'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='administered_vaccinations'
    )
    administered_at = models.DateTimeField(auto_now_add=True)
    batch_number = models.CharField(max_length=50)
    remarks = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'vaccination_records'
    
    def __str__(self):
        return f"Record {self.record_id}"