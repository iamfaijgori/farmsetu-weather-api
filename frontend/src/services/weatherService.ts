import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchWeatherData = async (
  regions: string[], 
  duration: string, 
  year: string
) => {
  try {
    const url = `${API_BASE_URL}/weather/`;
    
    // Build the parameters exactly as Django expects them
    const params: any = {};
    
    if (regions && regions.length > 0) {
      params.region = regions; // Axios automatically handles this array
    }
    
    if (duration) {
      params.duration = duration;
    }
    
    // Only pass the year if the duration requires it
    if (year && (duration === 'monthly' || duration === 'seasonal')) {
      params.year = year;
    }

    const response = await axios.get(url, { params });
    
    // Because we disabled Django's pagination, response.data is our clean array!
    return response.data;
    
  } catch (error) {
    console.error('Error fetching weather data from backend:', error);
    return [];
  }
};