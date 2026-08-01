from django.contrib import admin
from .models import Region, Parameter, WeatherRecord

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    search_fields = ('code', 'name')

@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    list_display = ('code', 'display_name', 'unit')
    search_fields = ('code', 'display_name')

@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = ('region', 'parameter', 'year', 'month', 'period_type', 'value')
    list_filter = ('region', 'parameter', 'period_type', 'year')
    search_fields = ('region__code', 'parameter__code', 'year')