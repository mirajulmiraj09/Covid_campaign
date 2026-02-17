# reviews/models.py
from django.db import models
from django.conf import settings


class CampaignReview(models.Model):
    """Campaign reviews by patients"""
    review_id = models.AutoField(primary_key=True)
    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='campaign_reviews'
    )
    rating = models.SmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaign_reviews'
        unique_together = ('campaign', 'patient')
    
    def __str__(self):
        return f"Review by {self.patient.email} for {self.campaign.title}"