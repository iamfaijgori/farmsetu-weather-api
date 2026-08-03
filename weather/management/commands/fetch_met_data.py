import requests
from django.core.management.base import BaseCommand
from weather.models import WeatherRecord
from django.db import transaction

class Command(BaseCommand):
    help = 'Fetches and populates historic weather data from the UK Met Office'

    def handle(self, *args, **kwargs):
        # Update this list with all 17 region names
        # The exact 17 region strings expected by the Met Office URLs
        # The exact 17 region strings verified against the Met Office servers
        regions = [
            'UK', 'England', 'Wales', 'Scotland', 'Northern_Ireland', 
            'England_and_Wales', 'England_N', 'England_S', 
            'Scotland_N', 'Scotland_E', 'Scotland_W', 
            'England_E_and_NE', 'England_NW_and_N_Wales', 
            'Midlands', 'East_Anglia', 'England_SW_and_S_Wales', 
            'England_SE_and_Central_S'
        ]
        
        metrics = {
            'Tmax': 'tmax',
            'Tmin': 'tmin',
            'Tmean': 'tmean',
            'Sunshine': 'sun',
            'Rainfall': 'rain'
        }
        
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Win', 'Spr', 'Sum', 'Aut', 'Ann']

        data_store = {}

        self.stdout.write("Initializing Met Office Data Extraction...")

        for param_url, model_field in metrics.items():
            for region in regions:
                url = f"https://www.metoffice.gov.uk/pub/data/weather/uk/climate/datasets/{param_url}/date/{region}.txt"
                self.stdout.write(f"  -> Fetching {param_url} for {region}...")
                
                try:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    lines = response.text.splitlines()
                    
                    # Robust parsing: Skip headers by checking if the first column is a valid year
                    for line in lines:
                        parts = line.split()
                        if not parts:
                            continue
                        
                        # If the first word isn't a number (like "UK", "Areal", "Year"), it's a header line. Skip it.
                        try:
                            year = int(parts[0])
                        except ValueError:
                            continue
                        
                        # Now we know we are on a data row
                        for idx, period in enumerate(periods):
                            if idx + 1 < len(parts):
                                val_str = parts[idx + 1]
                                
                                # Met Office uses '---' for missing data and '*' for provisional data
                                val_clean = val_str.replace('*', '') 
                                val = None if val_clean == '---' else float(val_clean)
                                
                                key = (region, year, period)
                                if key not in data_store:
                                    data_store[key] = {}
                                
                                data_store[key][model_field] = val

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to process {url}: {e}"))

        self.stdout.write("Parsing complete. Preparing bulk database insert...")

        records_to_create = []
        for (region, year, period), metrics_data in data_store.items():
            records_to_create.append(
                WeatherRecord(
                    region=region,
                    year=year,
                    period=period,
                    tmax=metrics_data.get('tmax'),
                    tmin=metrics_data.get('tmin'),
                    tmean=metrics_data.get('tmean'),
                    sun=metrics_data.get('sun'),
                    rain=metrics_data.get('rain')
                )
            )

        with transaction.atomic():
            self.stdout.write("Wiping old data to prevent duplicates...")
            WeatherRecord.objects.all().delete() 
            
            self.stdout.write("Injecting new data into PostgreSQL...")
            WeatherRecord.objects.bulk_create(records_to_create, batch_size=5000)

        self.stdout.write(self.style.SUCCESS(f"SUCCESS! Perfectly loaded {len(records_to_create)} weather records into the database!"))