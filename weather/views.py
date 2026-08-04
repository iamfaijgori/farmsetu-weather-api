from rest_framework import viewsets
from rest_framework.response import Response
from .models import WeatherRecord
from .serializers import WeatherRecordSerializer
import datetime

class WeatherRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeatherRecord.objects.all()
    serializer_class = WeatherRecordSerializer
    pagination_class = None 

    def get_queryset(self):
        current_year = datetime.datetime.now().year
        
        # Bound data between 1884 and Current Year
        queryset = WeatherRecord.objects.filter(year__gte=1884, year__lte=current_year)
        
        duration = self.request.query_params.get('duration')
        year_param = self.request.query_params.get('year')
        
        regions = self.request.query_params.getlist('region[]') or self.request.query_params.getlist('region')
        if not regions and self.request.query_params.get('region'):
            regions = [r.strip() for r in self.request.query_params.get('region').split(',')]

        if regions:
            queryset = queryset.filter(region__in=regions)

        if duration:
            if duration == 'monthly':
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                queryset = queryset.filter(period__in=months)
                if year_param:
                    queryset = queryset.filter(year=int(year_param))
                    
            elif duration == 'seasonal':
                seasons = ['Win', 'Spr', 'Sum', 'Aut', 'Ann']
                queryset = queryset.filter(period__in=seasons)
                if year_param:
                    queryset = queryset.filter(year=int(year_param))
                    
            elif duration == '1y':
                queryset = queryset.filter(year=current_year - 1)
                
            elif duration == '5y':
                queryset = queryset.filter(year__gte=current_year - 5)
                
            elif duration == '10y':
                queryset = queryset.filter(year__gte=current_year - 10)
                
            elif duration == 'all':
                pass 

        elif year_param:
            queryset = queryset.filter(year=int(year_param))
            
        return queryset.order_by('-year')

    # THE INTERCEPTOR: Runs right before sending data to the frontend
    def list(self, request, *args, **kwargs):
        # 1. Get the standard database response
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # 2. Intercept and auto-calculate missing current-year seasons
        duration = request.query_params.get('duration')
        year_param = request.query_params.get('year')
        current_year = datetime.datetime.now().year

        # If user asks for current year seasonal data and Met Office hasn't provided it yet
        if duration == 'seasonal' and year_param and int(year_param) == current_year and len(data) == 0:
            regions = request.query_params.getlist('region[]') or request.query_params.getlist('region')
            if not regions and request.query_params.get('region'):
                regions = [r.strip() for r in request.query_params.get('region').split(',')]

            calculated_seasons = []

            for region in regions:
                # Fetch all raw months for this year
                current_months = list(WeatherRecord.objects.filter(year=current_year, region=region))

                def get_month(period_name, records):
                    return next((m for m in records if m.period == period_name), None)

                def calc_season(period_name, m1, m2, m3):
                    # Only calculate if all 3 months of the season have finished and exist
                    if m1 and m2 and m3:
                        months = [m1, m2, m3]
                        
                        # Temperatures are averages; Sunshine/Rainfall are sums
                        tmax = [m.tmax for m in months if m.tmax is not None]
                        tmin = [m.tmin for m in months if m.tmin is not None]
                        tmean = [m.tmean for m in months if m.tmean is not None]
                        sun = [m.sun for m in months if m.sun is not None]
                        rain = [m.rain for m in months if m.rain is not None]

                        calculated_seasons.append({
                            'id': f"calc-{period_name}-{region}",
                            'year': current_year,
                            'period': period_name,
                            'region': region,
                            'tmax': round(sum(tmax)/len(tmax), 2) if len(tmax) == 3 else None,
                            'tmin': round(sum(tmin)/len(tmin), 2) if len(tmin) == 3 else None,
                            'tmean': round(sum(tmean)/len(tmean), 2) if len(tmean) == 3 else None,
                            'sun': round(sum(sun), 1) if len(sun) == 3 else None,
                            'rain': round(sum(rain), 1) if len(rain) == 3 else None,
                        })

                # Calculate Spring (March, April, May)
                calc_season('Spr', get_month('Mar', current_months), get_month('Apr', current_months), get_month('May', current_months))

                # Calculate Winter (December of previous year, January, February)
                dec_prev = WeatherRecord.objects.filter(year=current_year - 1, region=region, period='Dec').first()
                calc_season('Win', dec_prev, get_month('Jan', current_months), get_month('Feb', current_months))

            # Inject the calculated rows directly into the payload heading to React
            data.extend(calculated_seasons)

        return Response(data)