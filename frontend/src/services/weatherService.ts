import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
      // 1. OUTGOING TRANSLATOR: Convert "Northern Ireland" to "Northern_Ireland"
      params.region = regions.map(r => r.replace(/ /g, '_')); 
    }
    
    if (duration) {
      params.duration = duration;
    }
    
    // Only pass the year if the duration requires it
    if (year && (duration === 'monthly' || duration === 'seasonal')) {
      params.year = year;
    }

    const response = await axios.get(url, { params });
    
    // 2. INCOMING TRANSLATOR: Convert "Northern_Ireland" back to "Northern Ireland"
    // This ensures the data maps perfectly to your Heatmap and Table rows
    if (Array.isArray(response.data)) {
      const formattedData = response.data.map((record: any) => ({
        ...record,
        region: record.region ? record.region.replace(/_/g, ' ') : record.region
      }));
      return formattedData;
    }
    
    return response.data;
    
  } catch (error) {
    console.error('Error fetching weather data from backend:', error);
    return [];
  }
};