# Quick Start Guide - Web Interface

## Prerequisites
- Python 3.12 or higher
- pip (Python package manager)
- Internet connection (for downloading map data)

## Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Minhle1212/Delivery-Multi-Agent-System.git
   cd Delivery-Multi-Agent-System
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows PowerShell:
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - Windows CMD:
     ```bash
     venv\Scripts\activate.bat
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Web Application

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Access the dashboard**:
   - Open your web browser
   - Navigate to: `http://localhost:5000`

3. **Start a simulation**:
   - Click the "Start Simulation" button
   - Configure simulation parameters:
     - Number of agents (default: 3)
     - Number of packages (default: 20)
     - Map location (default: Cau Giay District, Hanoi, Vietnam)
     - Battery buffer (default: 30%)
   - Click "Start Simulation" in the modal

4. **Control the simulation**:
   - **Pause/Resume**: Click the Pause button
   - **Stop**: Click the Stop button to end the simulation
   - **View Details**: Click on any package in the orders list to see details

## Features

### Real-time Visualization
- **Interactive Map**: Zoom and pan the map to explore
- **Agent Tracking**: Watch agents move in real-time
- **Route Visualization**: See planned routes as colored lines
- **Status Indicators**: Color-coded markers for different statuses

### Dashboard Panels
1. **Orders List** (Left Panel):
   - Shows all packages with status
   - Color-coded status badges
   - Click to view details

2. **Map View** (Center):
   - Real-time agent positions
   - Delivery routes
   - Depot location (green)
   - Dropoff locations (red)

3. **Agent Status** (Left Bottom):
   - Battery levels
   - Package count
   - Current status

4. **Order Details** (Bottom):
   - Selected package information
   - Pickup and dropoff locations
   - Assigned agent

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can change it in `app.py`:
```python
socketio.run(app, debug=True, host='0.0.0.0', port=5001)  # Change port here
```

### Map Not Loading
- Ensure you have an active internet connection
- OSMnx requires internet to download map data
- Try a different location if one fails

### Dependencies Issues
If you encounter issues installing dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

## Performance Tips
- Start with fewer agents (2-3) for better performance
- Reduce number of packages (10-15) for faster initialization
- Close other browser tabs to free up resources

## Original Command-Line Version
To run the original matplotlib-based simulation:
```bash
python simulation.py
```

## Need Help?
- Check the main README.md for detailed documentation
- Review the code comments for implementation details
- Open an issue on GitHub for bugs or questions
