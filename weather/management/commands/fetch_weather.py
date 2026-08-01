import re
import requests
from django.core.management.base import BaseCommand
from weather.models import Region, Parameter, WeatherRecord

class Command(BaseCommand):
    help = 'Fetches and parses weather data from the MetOffice API'

    def handle(self, *args, **kwargs):
        # 1. Define our targets
        regions = {'UK': 'United Kingdom', 'England': 'England', 'Wales': 'Wales'}
        parameters = {
            'Tmax': ('Maximum Temperature', '°C'),
            'Tmin': ('Minimum Temperature', '°C'),
            'Rainfall': ('Rainfall', 'mm')
        }

        for reg_code, reg_name in regions.items():
            region_obj, _ = Region.objects.get_or_create(code=reg_code, defaults={'name': reg_name})

            for param_code, (param_name, unit) in parameters.items():
                param_obj, _ = Parameter.objects.get_or_create(code=param_code, defaults={'display_name': param_name, 'unit': unit})

                url = f"https://www.metoffice.gov.uk/pub/data/weather/uk/climate/datasets/{param_code}/date/{reg_code}.txt"
                self.stdout.write(f"Fetching {reg_code} - {param_code}...")
                
                try:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                except requests.exceptions.RequestException as e:
                    self.stderr.write(self.style.ERROR(f"Error fetching {url}: {e}"))
                    continue

                # 2. Parse the text data
                lines = response.text.splitlines()
                records_to_create = []
                
                for line in lines:
                    line = line.strip()
                    # Skip headers: Only process lines that start with a 4-digit year
                    if not re.match(r'^\d{4}\s', line):
                        continue
                        
                    parts = line.split()
                    year = int(parts[0])

                    # 3. Map columns to database fields (Index, Month Number, Period Type)
                    col_mappings = [
                        (1, 1, 'MONTHLY'), (2, 2, 'MONTHLY'), (3, 3, 'MONTHLY'), (4, 4, 'MONTHLY'),
                        (5, 5, 'MONTHLY'), (6, 6, 'MONTHLY'), (7, 7, 'MONTHLY'), (8, 8, 'MONTHLY'),
                        (9, 9, 'MONTHLY'), (10, 10, 'MONTHLY'), (11, 11, 'MONTHLY'), (12, 12, 'MONTHLY'),
                        (13, None, 'WINTER'), (14, None, 'SPRING'), (15, None, 'SUMMER'),
                        (16, None, 'AUTUMN'), (17, None, 'ANNUAL')
                    ]

                    for col_idx, month, period_type in col_mappings:
                        # Current years may not have all data yet, preventing index out of range errors
                        if col_idx < len(parts):
                            val_str = parts[col_idx]
                            value = None if val_str == '---' else float(val_str)
                                    
                            records_to_create.append(WeatherRecord(
                                region=region_obj,
                                parameter=param_obj,
                                year=year,
                                month=month,
                                period_type=period_type,
                                value=value
                            ))

                # 4. Bulk Insert
                # ignore_conflicts=True skips duplicates based on our unique_together constraint
                WeatherRecord.objects.bulk_create(records_to_create, ignore_conflicts=True)
                self.stdout.write(self.style.SUCCESS(f"Successfully processed records for {reg_code} {param_code}"))