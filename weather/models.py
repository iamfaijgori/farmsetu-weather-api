from django.db import models

class WeatherRecord(models.Model):
    # We store region as a string instead of a ForeignKey to avoid heavy SQL JOINs
    region = models.CharField(max_length=50, db_index=True)
    year = models.IntegerField(db_index=True)
    
    # 'period' will store 'Jan', 'Feb', ..., 'Win', 'Spr', 'Ann'
    period = models.CharField(max_length=10, db_index=True)
    
    # Flattened metrics for blazingly fast horizontal queries (matching our React table)
    tmax = models.FloatField(null=True, blank=True)
    tmin = models.FloatField(null=True, blank=True)
    tmean = models.FloatField(null=True, blank=True)
    sun = models.FloatField(null=True, blank=True)
    rain = models.FloatField(null=True, blank=True)

    # Good practice from your previous model
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevents accidental duplicate data ingestion
        unique_together = ('region', 'year', 'period')
        
        # Composite index because our API will almost always query by region AND year
        indexes = [
            models.Index(fields=['region', 'year']),
        ]
        # Default sorting
        ordering = ['-year']

    def __str__(self):
        return f"{self.region} - {self.year} ({self.period})"