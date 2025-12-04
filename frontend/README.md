# Frontend - Multi-Agent Delivery System

This folder contains the web-based user interface for the multi-agent delivery simulation.

## Structure

```
frontend/
├── templates/
│   └── index.html         # Main dashboard HTML
└── static/
    ├── css/
    │   └── style.css      # Styling and theme
    └── js/
        └── app.js         # Frontend logic and map integration
```

## Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Leaflet.js** - Interactive maps with OpenStreetMap
- **Socket.IO** - Real-time WebSocket communication

## Features

### Dashboard Layout
- **Sidebar** - Navigation menu with icons
- **Header** - Top navigation and user profile
- **Orders Panel** - List of packages with status
- **Map Panel** - Interactive Leaflet map
- **Order Details** - Detailed package information
- **Agent Status** - Real-time agent monitoring

### Map Visualization
- Real-time agent positions
- Route path visualization
- Depot and dropoff markers
- Custom icons and colors
- Smooth animations

### Real-time Updates
- WebSocket connection to backend
- Live simulation state updates
- Dynamic UI rendering
- Status indicators

## Customization

### Colors (CSS Variables)
Edit `static/css/style.css`:
```css
:root {
    --primary-blue: #2563eb;
    --success-green: #10b981;
    --warning-orange: #f59e0b;
    --danger-red: #ef4444;
}
```

### Map Tiles
Edit `static/js/app.js` to change map provider:
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Responsive Design

The interface adapts to different screen sizes:
- Desktop: Full layout with sidebar, orders panel, and map
- Tablet: Adjusted panels
- Mobile: Stacked layout (experimental)
