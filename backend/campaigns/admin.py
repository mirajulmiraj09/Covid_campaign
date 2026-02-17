# campaigns/admin.py
from django.contrib import admin
from .models import Campaign, Vaccine


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('campaign_id', 'title', 'start_date', 'end_date', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title',)
    readonly_fields = ('created_at',)


@admin.register(Vaccine)
class VaccineAdmin(admin.ModelAdmin):
    list_display = ('vaccine_id', 'name', 'campaign', 'dose_interval', 'total_doses', 'stock_quantity')
    list_filter = ('campaign',)
    search_fields = ('name', 'manufacturer')