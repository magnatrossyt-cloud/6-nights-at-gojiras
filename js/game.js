class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentNight = 1;
        this.totalNights = 6;
        this.postersRemoved = 0;
        this.totalPosters = 10;
        this.gameRunning = true;
        this.nightStartTime = null;
        this.nightDuration = 6 * 60 * 1000; // 6 minutes per night (6 AM to 6 AM in-game)
        
        // Weather integration
        this.weather = new WeatherSystem();
        this.currentWeather = null;
        
        // Game systems
        this.gojira = new Gojira(this);
        this.posters = [];
        
        this.resizeCanvas();
        this.initializeNight();
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 70; // Subtract HUD height
    }
    
    async initializeNight() {
        this.nightStartTime = Date.now();
        this.postersRemoved = 0;
        
        // Fetch weather for this night
        this.currentWeather = await this.weather.fetchWeather();
        this.updateWeatherDisplay();
        
        // Initialize posters
        this.createPosters();
        
        // Reset Gojira position
        this.gojira.reset();
    }
    
    createPosters() {
        this.posters = [];
        const posterSystem = new PosterSystem(this.canvas, this.totalPosters);
        this.posters = posterSystem.generatePosters();
    }
    
    updateWeatherDisplay() {
        const weatherDisplay = document.getElementById('weather-display');
        if (this.currentWeather) {
            const condition = this.currentWeather.condition;
            const temp = this.currentWeather.temp;
            const visibility = this.currentWeather.visibility;
            weatherDisplay.innerHTML = `${condition} | ${temp}° | Visibility: ${visibility}%`;
            
            // Weather affects game difficulty
            this.applyWeatherEffects();
        }
    }
    
    applyWeatherEffects() {
        if (!this.currentWeather) return;
        
        const condition = this.currentWeather.condition.toLowerCase();
        const visibility = this.currentWeather.visibility;
        
        // Low visibility makes Gojira harder to detect
        if (visibility < 50) {
            this.gojira.detectionRange *= 0.8;
        }
        
        // Fog/mist affects movement
        if (condition.includes('fog') || condition.includes('mist')) {
            this.gojira.speed *= 1.2;
        }
        
        // Rain/storm increases tension
        if (condition.includes('rain') || condition.includes('storm')) {
            this.gojira.aggressiveness *= 1.3;
        }
    }
    
    updateTimer() {
        const elapsed = Date.now() - this.nightStartTime;
        const timeToMorning = Math.max(0, this.nightDuration - elapsed);
        const minutes = Math.floor(timeToMorning / 60000);
        const seconds = Math.floor((timeToMorning % 60000) / 1000);
        
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')} AM`;
        
        return timeToMorning;
    }
    
    updateStats() {
        document.getElementById('current-night').textContent = this.currentNight;
        document.getElementById('poster-count').textContent = this.postersRemoved;
        document.getElementById('gojira-distance').textContent = 
            Math.floor(this.gojira.distanceToPlayer) + 'px';
        
        const threatLevel = this.calculateThreatLevel();
        const threatElement = document.getElementById('threat-level');
        threatElement.textContent = threatLevel;
        threatElement.className = threatLevel.toLowerCase();
    }
    
    calculateThreatLevel() {
        const distance = this.gojira.distanceToPlayer;
        if (distance < 100) return 'CRITICAL';
        if (distance < 300) return 'HIGH';
        if (distance < 600) return 'MEDIUM';
        return 'LOW';
    }
    
    posterRemoved() {
        this.postersRemoved++;
        document.getElementById('poster-count').textContent = this.postersRemoved;
        
        if (this.postersRemoved === this.totalPosters) {
            this.nightWon();
        }
    }
    
    nightWon() {
        this.gameRunning = false;
        if (this.currentNight < this.totalNights) {
            this.showNightComplete(true);
        } else {
            this.showGameComplete(true);
        }
    }
    
    playerCaught() {
        this.gameRunning = false;
        this.showNightComplete(false);
    }
    
    nightTimedOut() {
        this.gameRunning = false;
        this.showNightComplete(true);
    }
    
    showNightComplete(success) {
        const message = success ? 
            `Night ${this.currentNight} - Survived!` : 
            `Night ${this.currentNight} - Caught by Gojira!`;
        
        alert(message);
        
        if (success && this.currentNight < this.totalNights) {
            this.currentNight++;
            this.gameRunning = true;
            this.initializeNight();
        } else if (!success) {
            // Game over - player caught
            alert('GAME OVER - You were caught!');
            location.reload();
        }
    }
    
    showGameComplete(success) {
        alert('All 6 nights survived! You escaped!');
        location.reload();
    }
    
    gameLoop() {
        if (!this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(26, 15, 13, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update timer
        const timeRemaining = this.updateTimer();
        if (timeRemaining <= 0) {
            this.nightTimedOut();
            return;
        }
        
        // Update game systems
        this.gojira.update(this.posters);
        this.gojira.draw(this.ctx);
        
        // Update stats
        this.updateStats();
        
        // Check for collision with Gojira
        if (this.gojira.isPlayerCaught()) {
            this.playerCaught();
            return;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});

window.addEventListener('resize', () => {
    // Handle resize
});
