from rest_framework import viewsets
from .models import WeatherRecord
from .serializers import WeatherRecordSerializer

class WeatherRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeatherRecord.objects.all()
    serializer_class = WeatherRecordSerializer
    
    # Enable filtering directly from the URL query params
    def get_queryset(self):
        queryset = WeatherRecord.objects.all()
        region = self.request.query_params.get('region')
        year = self.request.query_params.get('year')
        
        if region:
            queryset = queryset.filter(region__iexact=region)
        if year:
            queryset = queryset.filter(year=year)
            
        return queryset