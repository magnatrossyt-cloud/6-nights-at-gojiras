class WeatherSystem {
    constructor() {
        this.apiKey = 'open-meteo'; // Open-Meteo is free, no API key needed
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.weatherHistory = [];
        this.cacheTime = 5 * 60 * 1000; // 5 minute cache
        this.lastFetch = null;
    }
    
    async fetchWeather(latitude = 35.6762, longitude = 139.6503) {
        // Tokyo coordinates (Gojira's birthplace)
        // Check cache first
        if (this.lastFetch && Date.now() - this.lastFetch < this.cacheTime) {
            return this.weatherHistory[this.weatherHistory.length - 1];
        }
        
        try {
            const params = new URLSearchParams({
                latitude: latitude,
                longitude: longitude,
                current: 'temperature_2m,relative_humidity_2m,weather_code,visibility',
                hourly: 'temperature_2m',
                timezone: 'auto'
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            const weatherData = this.parseWeatherData(data);
            this.weatherHistory.push(weatherData);
            this.lastFetch = Date.now();
            
            return weatherData;
        } catch (error) {
            console.error('Weather fetch error:', error);
            return this.getDefaultWeather();
        }
    }
    
    parseWeatherData(data) {
        const current = data.current;
        const weatherCode = current.weather_code;
        const condition = this.interpretWeatherCode(weatherCode);
        
        return {
            temp: Math.round(current.temperature_2m),
            humidity: current.relative_humidity_2m,
            visibility: Math.max(20, Math.min(100, current.visibility / 10)), // 0-100 scale
            condition: condition,
            weatherCode: weatherCode,
            raw: data
        };
    }
    
    interpretWeatherCode(code) {
        // WMO Weather interpretation codes
        if (code === 0) return 'Clear Sky';
        if (code === 1 || code === 2) return 'Mostly Clear';
        if (code === 3) return 'Overcast';
        if (code === 45) return 'Foggy';
        if (code === 48) return 'Foggy Rime';
        if (code === 51 || code === 53 || code === 55) return 'Drizzle';
        if (code === 61 || code === 63 || code === 65) return 'Rain';
        if (code === 71 || code === 73 || code === 75) return 'Snow';
        if (code === 80 || code === 81 || code === 82) return 'Rain Showers';
        if (code === 85 || code === 86) return 'Snow Showers';
        if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
        return 'Unknown';
    }
    
    getDefaultWeather() {
        return {
            temp: 20,
            humidity: 65,
            visibility: 80,
            condition: 'Overcast',
            weatherCode: 3
        };
    }
    
    getWeatherModifier() {
        // Returns how much the weather affects game difficulty (1.0 = normal)
        if (!this.weatherHistory.length) return 1.0;
        
        const weather = this.weatherHistory[this.weatherHistory.length - 1];
        let modifier = 1.0;
        
        // Low visibility increases danger
        modifier *= (1 + (100 - weather.visibility) * 0.005);
        
        // Temperature extremes add tension
        if (weather.temp < 5 || weather.temp > 35) {
            modifier *= 1.1;
        }
        
        // Weather conditions
        if (weather.condition.includes('Storm')) modifier *= 1.3;
        if (weather.condition.includes('Rain')) modifier *= 1.15;
        if (weather.condition.includes('Fog')) modifier *= 1.2;
        if (weather.condition.includes('Snow')) modifier *= 1.1;
        
        return modifier;
    }
}
