class PosterSystem {
    constructor(canvas, posterCount = 10) {
        this.canvas = canvas;
        this.posterCount = posterCount;
        this.posters = [];
        this.posterImage = null;
        this.loadPosterImage();
    }
    
    async loadPosterImage() {
        // Use the OG image as poster
        try {
            const img = new Image();
            img.src = 'public/og.jpg';
            img.onload = () => {
                this.posterImage = img;
            };
        } catch (error) {
            console.error('Failed to load poster image:', error);
        }
    }
    
    generatePosters() {
        const posters = [];
        const gridCols = Math.ceil(Math.sqrt(this.posterCount));
        const gridRows = Math.ceil(this.posterCount / gridCols);
        
        const posterWidth = Math.floor(this.canvas.width / (gridCols + 1));
        const posterHeight = Math.floor((this.canvas.height - 70) / (gridRows + 1));
        
        let index = 0;
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                if (index >= this.posterCount) break;
                
                const poster = new Poster(
                    (col + 1) * (posterWidth + 20),
                    70 + (row + 1) * (posterHeight + 20),
                    posterWidth,
                    posterHeight,
                    this.posterImage,
                    index
                );
                
                posters.push(poster);
                index++;
            }
        }
        
        // Attach click handlers
        this.attachClickHandlers(posters);
        
        return posters;
    }
    
    attachClickHandlers(posters) {
        const container = document.getElementById('posters-container');
        container.innerHTML = '';
        
        posters.forEach((poster, index) => {
            const posterEl = document.createElement('div');
            posterEl.className = 'poster';
            posterEl.id = `poster-${index}`;
            posterEl.style.left = poster.x + 'px';
            posterEl.style.top = poster.y + 'px';
            posterEl.style.width = poster.width + 'px';
            posterEl.style.height = poster.height + 'px';
            
            if (this.posterImage) {
                const img = document.createElement('img');
                img.src = this.posterImage.src;
                posterEl.appendChild(img);
            } else {
                posterEl.style.background = `url('public/og.jpg')`;
                posterEl.style.backgroundSize = 'cover';
            }
            
            posterEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removePoster(posterEl, poster);
            });
            
            container.appendChild(posterEl);
        });
    }
    
    removePoster(element, posterData) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0)';
        
        setTimeout(() => {
            element.remove();
            posterData.removed = true;
            window.game.posterRemoved();
        }, 200);
    }
}

class Poster {
    constructor(x, y, width, height, image, index) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.index = index;
        this.removed = false;
    }
    
    checkCollision(x, y) {
        return x > this.x && x < this.x + this.width &&
               y > this.y && y < this.y + this.height;
    }
}
