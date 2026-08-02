import requests
from django.core.management.base import BaseCommand
from weather.models import Region, Parameter, WeatherRecord

class Command(BaseCommand):
    help = 'Fetches and seeds historical weather data from the UK Met Office'

    def handle(self, *args, **kwargs):
        # 1. Define all available regions from the dropdown
        regions = [
            'UK', 'England', 'Wales', 'Scotland', 'Northern_Ireland', 
            'England_and_Wales', 'England_N', 'England_S', 'Scotland_N', 
            'Scotland_E', 'Scotland_W', 'England_E_and_NE', 
            'England_NW_and_N_Wales', 'Midlands', 'East_Anglia', 
            'England_SW_and_S_Wales', 'England_SE_and_Central_S'
        ]

        # 2. Define parameters with metadata to satisfy model fields
        parameters = {
            'Tmax': {'name': 'Max Temperature', 'unit': '°C'},
            'Tmin': {'name': 'Min Temperature', 'unit': '°C'},
            'Tmean': {'name': 'Mean Temperature', 'unit': '°C'},
            'Sunshine': {'name': 'Sunshine Hours', 'unit': 'hours'},
            'Rainfall': {'name': 'Rainfall', 'unit': 'mm'},
            'Raindays1mm': {'name': 'Rain Days >= 1mm', 'unit': 'days'},
            'AirFrost': {'name': 'Days of Air Frost', 'unit': 'days'},
        }

        self.stdout.write(self.style.NOTICE("Starting Met Office data ingestion..."))

        for param_code, meta in parameters.items():
            param_obj, _ = Parameter.objects.get_or_create(
                code=param_code,
                defaults={'display_name': meta['name'], 'unit': meta['unit']}
            )

            for region_name in regions:
                try:
                    region_obj, _ = Region.objects.get_or_create(
                        code=region_name,
                        defaults={'name': region_name.replace('_', ' ')}
                    )
                    
                    url = f"https://www.metoffice.gov.uk/pub/data/weather/uk/climate/datasets/{param_code}/date/{region_name}.txt"
                    
                    self.stdout.write(f"Fetching {param_code} for {region_name}...")
                    response = requests.get(url, timeout=10)
                    
                    if response.status_code != 200:
                        continue  # Skip if URL doesn't exist instead of crashing
                        
                    lines = response.text.splitlines()
                    data_start_index = 0
                    for i, line in enumerate(lines):
                        if line.strip().lower().startswith('year'):
                            data_start_index = i + 1
                            break
                    
                    if data_start_index == 0:
                        continue

                    for line in lines[data_start_index:]:
                        columns = line.split()
                        if len(columns) >= 18 and columns[17] != '---':
                            try:
                                annual_value = float(columns[17])
                                WeatherRecord.objects.update_or_create(
                                    region=region_obj,
                                    parameter=param_obj,
                                    year=int(columns[0]),
                                    month=None,
                                    period_type='ANNUAL',
                                    defaults={'value': annual_value}
                                )
                            except ValueError:
                                continue
                                
                except requests.exceptions.RequestException as e:
                    self.stdout.write(self.style.ERROR(f"Failed to fetch {url}: {e}"))
                except Exception as e:
                    # Catch any other unexpected error for this specific region/param and continue
                    continue

        self.stdout.write(self.style.SUCCESS("Successfully ingested all available Met Office data!"))