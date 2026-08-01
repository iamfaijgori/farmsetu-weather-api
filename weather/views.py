from rest_framework import viewsets
from rest_framework.response import Response
from .models import Region, Parameter, WeatherRecord
from .serializers import RegionSerializer, ParameterSerializer, WeatherRecordSerializer

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class ParameterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

class WeatherRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WeatherRecordSerializer

    def get_queryset(self):
        queryset = WeatherRecord.objects.all()
        
        # Extract filters from the URL (e.g., ?region=UK¶meter=Tmax&start_year=2010)
        region = self.request.query_params.get('region', None)
        parameter = self.request.query_params.get('parameter', None)
        start_year = self.request.query_params.get('start_year', None)
        end_year = self.request.query_params.get('end_year', None)
        period_type = self.request.query_params.get('period_type', None)

        # Apply filters if they exist
        if region:
            queryset = queryset.filter(region__code=region)
        if parameter:
            queryset = queryset.filter(parameter__code=parameter)
        if start_year:
            queryset = queryset.filter(year__gte=start_year)
        if end_year:
            queryset = queryset.filter(year__lte=end_year)
        if period_type:
            queryset = queryset.filter(period_type=period_type.upper())

        return queryset