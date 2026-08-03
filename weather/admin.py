from django.contrib import admin
from .models import WeatherRecord

@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = ('region', 'year', 'period', 'tmax', 'tmin', 'tmean', 'sun', 'rain')
    list_filter = ('region', 'year', 'period')
    search_fields = ('region',)