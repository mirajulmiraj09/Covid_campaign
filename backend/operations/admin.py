from django.contrib import admin

# Register your models here.
# operations/admin.py
from django.contrib import admin
from .models import Booking, VaccinationRecord


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'patient', 'vaccine', 'dose_number', 'scheduled_date', 'status', 'created_at')
    list_filter = ('status', 'dose_number', 'scheduled_date')
    search_fields = ('patient__email', 'vaccine__name')
    readonly_fields = ('created_at',)


@admin.register(VaccinationRecord)
class VaccinationRecordAdmin(admin.ModelAdmin):
    list_display = ('record_id', 'booking', 'doctor', 'batch_number', 'administered_at')
    list_filter = ('administered_at',)
    search_fields = ('booking__patient__email', 'doctor__email', 'batch_number')
    readonly_fields = ('administered_at',)