from django.db import models
from django.conf import settings
 
class Campaign(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('doctors_only', 'Doctors & Admin Only'),
    ]

    campaign_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='public',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_campaigns'
    )
    assigned_doctors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assigned_campaigns',
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title



class Vaccine(models.Model):
    vaccine_id = models.AutoField(primary_key=True)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name='vaccines'
    )
    name = models.CharField(max_length=100)
    dose_interval = models.IntegerField(default=0)
    total_doses = models.IntegerField(default=1)
    stock_quantity = models.IntegerField(default=0)
    manufacturer = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        db_table = 'vaccines'
    
    def __str__(self):
        return f"{self.name} ({self.campaign.title})"