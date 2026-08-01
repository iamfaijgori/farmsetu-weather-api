from django.db import models

# Create your models here.
from django.db import models

class Region(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True) # e.g., 'UK', 'England'

    def __str__(self):
        return self.name

class Parameter(models.Model):
    code = models.CharField(max_length=50, unique=True) # e.g., 'Tmax', 'Rainfall'
    display_name = models.CharField(max_length=100)
    unit = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.display_name} ({self.unit})"

class WeatherRecord(models.Model):
    PERIOD_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('WINTER', 'Winter'),
        ('SPRING', 'Spring'),
        ('SUMMER', 'Summer'),
        ('AUTUMN', 'Autumn'),
        ('ANNUAL', 'Annual'),
    ]

    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='weather_records')
    parameter = models.ForeignKey(Parameter, on_delete=models.CASCADE, related_name='weather_records')
    year = models.IntegerField()
    month = models.IntegerField(null=True, blank=True) # 1-12, null for seasonal/annual
    period_type = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='MONTHLY')
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Enforce the unique constraint you specified
        unique_together = ('region', 'parameter', 'year', 'month', 'period_type')
        
        # The compound index for fast filtered lookups
        indexes = [
            models.Index(fields=['region', 'parameter', 'year']),
        ]
        ordering = ['-year', 'month']

    def __str__(self):
        period = f"Month {self.month}" if self.period_type == 'MONTHLY' else self.period_type
        return f"{self.region.code} - {self.parameter.code} ({self.year}: {period})"