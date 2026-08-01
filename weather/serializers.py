from rest_framework import serializers
from .models import Region, Parameter, WeatherRecord

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['code', 'name']

class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ['code', 'display_name', 'unit']

class WeatherRecordSerializer(serializers.ModelSerializer):
    # We use StringRelatedField so the JSON shows the actual names (e.g., 'UK', 'Tmax') 
    # instead of just database IDs (like 1 or 2).
    region = serializers.StringRelatedField()
    parameter = serializers.StringRelatedField()

    class Meta:
        model = WeatherRecord
        fields = ['region', 'parameter', 'year', 'month', 'period_type', 'value']