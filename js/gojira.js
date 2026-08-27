class Gojira {
    constructor(game) {
        this.game = game;
        this.x = -100;
        this.y = game.canvas.height / 2;
        this.width = 150;
        this.height = 180;
        this.speed = 1;
        this.baseSpeed = 1;
        this.detectionRange = 600;
        this.aggressiveness = 1.0;
        this.distanceToPlayer = Infinity;
        this.playerX = game.canvas.width / 2;
        this.playerY = game.canvas.height / 2;
        this.state = 'patrolling'; // patrolling, charging, hunting
        this.health = 100;
        this.roarCooldown = 0;
    }
    
    reset() {
        this.x = -100;
        this.y = this.game.canvas.height / 2;
        this.state = 'patrolling';
        this.health = 100;
        this.detectionRange = 600;
        this.aggressiveness = 1.0;
    }
    
    update(posters) {
        // Detect player through posters
        this.detectPlayer(posters);
        
        // Update behavior based on state
        this.updateBehavior();
        
        // Move Gojira
        this.move();
        
        // Update roar cooldown
        if (this.roarCooldown > 0) {
            this.roarCooldown--;
        }
        
        // Calculate distance to player
        this.distanceToPlayer = Math.hypot(this.playerX - this.x, this.playerY - this.y);
    }
    
    detectPlayer(posters) {
        // Player is hidden behind posters or at edges
        const playerHidden = posters.some(poster => {
            return this.x < poster.x + poster.width &&
                   this.x + this.width > poster.x &&
                   this.y < poster.y + poster.height &&
                   this.y + this.height > poster.y;
        });
        
        if (playerHidden) {
            this.state = 'patrolling';
            this.speed = this.baseSpeed * 0.5;
        } else if (this.distanceToPlayer < this.detectionRange) {
            this.state = 'hunting';
            this.speed = this.baseSpeed * this.aggressiveness;
        }
    }
    
    updateBehavior() {
        switch (this.state) {
            case 'patrolling':
                this.patrol();
                break;
            case 'hunting':
                this.hunt();
                break;
            case 'charging':
                this.charge();
                break;
        }
    }
    
    patrol() {
        // Random patrol movement
        this.x += this.speed;
        this.y += Math.sin(Date.now() * 0.001) * 0.5;
        
        // Bounce off edges
        if (this.x > this.game.canvas.width) {
            this.x = -this.width;
        }
        if (this.y < 0) this.y = 0;
        if (this.y > this.game.canvas.height) this.y = this.game.canvas.height - this.height;
    }
    
    hunt() {
        // Chase player
        const dx = this.playerX - this.x;
        const dy = this.playerY - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        // Roar when close
        if (distance < 200 && this.roarCooldown <= 0) {
            this.roar();
            this.roarCooldown = 120;
        }
        
        // Switch to charging if very close
        if (distance < 100) {
            this.state = 'charging';
        }
    }
    
    charge() {
        // Aggressive charge at player
        const dx = this.playerX - this.x;
        const dy = this.playerY - this.y;
        const distance = Math.hypot(dx, dy);
        
        const chargeSpeed = this.speed * 2;
        
        if (distance > 50) {
            this.x += (dx / distance) * chargeSpeed;
            this.y += (dy / distance) * chargeSpeed;
        } else {
            // Caught the player!
            return true;
        }
        
        return false;
    }
    
    move() {
        // Clamp to canvas
        this.x = Math.max(-this.width, Math.min(this.game.canvas.width, this.x));
        this.y = Math.max(0, Math.min(this.game.canvas.height - this.height, this.y));
    }
    
    roar() {
        // Play sound effect and visual effect
        console.log('ROOOAAARRR!');
        // TODO: Add sound effect
    }
    
    isPlayerCaught() {
        return this.state === 'charging' && 
               this.x < this.playerX + 30 &&
               this.x + this.width > this.playerX - 30 &&
               this.y < this.playerY + 30 &&
               this.y + this.height > this.playerY - 30;
    }
    
    draw(ctx) {
        // Draw Gojira as a red kaiju silhouette
        ctx.save();
        ctx.fillStyle = this.getGojiraColor();
        ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        
        // Draw body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw head
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 20, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes (glowing red)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 3, this.y - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + (this.width * 2) / 3, this.y - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw teeth
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 20 + i * 25, this.y - 5);
            ctx.lineTo(this.x + 25 + i * 25, this.y + 10);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw threat range indicator in debug
        if (this.state === 'hunting') {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.detectionRange, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    getGojiraColor() {
        if (this.state === 'charging') {
            return '#ff0000';
        } else if (this.state === 'hunting') {
            return '#cc0000';
        } else {
            return '#8b0000';
        }
    }
}
