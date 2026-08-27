# 6 Nights at Gojira's 🎮

A horror/kaiju browser game where you must remove 10 old posters while avoiding Gojira until 6 AM for 6 consecutive nights.

## Features

- **6-Night Survival Challenge** - Beat each night by removing all 10 posters before time runs out
- **Dynamic Gojira AI** - The kaiju patrols, hunts, and charges with escalating aggression
- **Real-Time Weather** - Weather conditions affect game difficulty (fog reduces visibility, storms increase threat)
- **Poster Mechanics** - Click posters to remove them quickly before Gojira catches you
- **Threat System** - Real-time distance tracking and threat level indicator
- **Blood-Bath Aesthetic** - Dark, horror atmosphere with blood-red UI

## How to Play

1. Open the game in your browser
2. Click on posters to remove them (removes all 10 to survive the night)
3. Avoid Gojira - if it catches you, it's game over
4. Survive all 6 nights to win

## Technologies

- **Canvas API** - Side-view game rendering
- **Open-Meteo API** - Free real-time weather data (Tokyo-based)
- **Vanilla JavaScript** - Pure game engine, no frameworks
- **CSS3** - Horror atmosphere styling

## Game Mechanics

### Gojira Behavior
- **Patrolling** - Moves slowly across the screen
- **Hunting** - Detected player and is tracking
- **Charging** - Close to player, aggressive attack mode

### Weather Effects
- Low visibility reduces Gojira's detection range but increases tension
- Fog increases movement speed
- Rain/storms increase aggressiveness
- Temperature extremes add difficulty

### Win Conditions
- Remove all 10 posters before time runs out → Survive night
- Survive all 6 nights → Win the game
- Get caught by Gojira → Game over

## Files

- `index.html` - Main game structure
- `styles.css` - Blood-bath horror theme
- `js/game.js` - Core game engine
- `js/gojira.js` - Kaiju AI system
- `js/poster.js` - Poster removal mechanics
- `js/weather.js` - Real-time weather integration
- `public/og.jpg` - Poster artwork (1200×630)
- `public/favicon.svg` - Game favicon

## Deployment

This game is deployed via GitHub Pages. Push to `main` branch to auto-deploy.

**Play it here:** https://magnatrossyt-cloud.github.io/6-nights-at-gojiras/

---

*Inspired by horror survival games. Can you survive 6 nights at Gojira's?*
