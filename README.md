# Delivery Multi Agent System

A multi-agent delivery simulation system using real-world map data from OpenStreetMap. This project demonstrates key AI agent concepts including automated negotiation, dynamic adaptation, and distributed task allocation.

## Features

- 🤝 **Contract Net Protocol** - Decentralized task assignment through competitive bidding
- 🔍 **Route Optimization** - Shortest path finding and nearest-neighbor routing
- 💬 **Automated Negotiation** - Agents bid for delivery tasks based on feasibility
- 🎯 **Dynamic Adaptation** - Autonomous decision-making for departure timing
- 🔋 **Battery Management** - Realistic energy constraints and depot recharging
- 🗺️ **Real-World Maps** - Uses OpenStreetMap data for realistic simulations
- 📊 **Live Visualization** - Real-time web-based dashboard with interactive maps
- 🌐 **Web Interface** - Modern UI with real-time updates via WebSockets

## System Components

### Backend

#### Main Agent (`main_agent.py`)
Central coordinator (depot) that manages the task queue and implements the Contract Net Protocol for task assignment.

#### Delivery Agent (`delivery_agent.py`)
Individual delivery agents with:
- Battery management (drains while moving, recharges at depot)
- Capacity constraints (max 5 packages)
- Bidding logic for task negotiation
- Route optimization using greedy nearest-neighbor algorithm
- Dynamic adaptation based on battery, capacity, and remaining tasks

#### Package (`package.py`)
Simple package class for tracking delivery status and assignments.

#### Simulation Engine (`simulation_engine.py`)
Wrapper for the multi-agent simulation that:
- Loads real map data from OpenStreetMap
- Creates and manages agents and packages
- Provides real-time state updates
- Runs in a separate thread for web interface

#### Web Server (`app.py`)
Flask application with:
- REST API endpoints for simulation control
- WebSocket support for real-time updates
- Static file serving for frontend

### Frontend

#### Dashboard (`templates/index.html`)
Modern web interface featuring:
- Sidebar navigation
- Orders list with status indicators
- Interactive Leaflet map
- Agent status cards
- Order details panel

#### Styling (`static/css/style.css`)
Professional blue-themed CSS matching the UI design with:
- Responsive layout
- Smooth animations
- Custom components

#### JavaScript (`static/js/app.js`)
Frontend logic including:
- Leaflet map integration
- Socket.IO real-time communication
- Dynamic UI updates
- User interaction handling

## Project Structure

```
Delivery-Multi-Agent-System/
├── backend/              # Python backend
│   ├── app.py           # Flask web server
│   ├── simulation_engine.py
│   ├── delivery_agent.py
│   ├── main_agent.py
│   ├── package.py
│   └── simulation.py    # Original CLI version
├── frontend/            # Web frontend
│   ├── templates/       # HTML templates
│   │   └── index.html
│   └── static/          # CSS, JS, assets
│       ├── css/
│       └── js/
├── requirements.txt     # Python dependencies
├── start_web.bat       # Windows launcher
└── start_web.ps1       # PowerShell launcher
```

## Installation

### Requirements
- Python 3.10 or higher
- Virtual environment (recommended)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Minhle1212/Delivery-Multi-Agent-System.git
cd Delivery-Multi-Agent-System
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Web-Based Dashboard (Recommended)

**Option 1: Use launcher scripts**
- Windows: Double-click `start_web.bat`
- PowerShell: Run `.\start_web.ps1`

**Option 2: Manual start**
```bash
cd backend
python app.py
```

Then open your browser and navigate to:
```
http://localhost:5000
```

**Using the Dashboard:**
1. Click "Start Simulation"
2. Configure parameters:
   - Number of agents (1-10)
   - Number of packages (1-100)
   - Map location
   - Battery buffer percentage
3. Watch the real-time simulation on the interactive map!

### Command-Line Simulation (Original)

Run the matplotlib-based simulation:
```bash
cd backend
python simulation.py
```

Optional - Save simulation log to file:
```bash
python simulation.py | Out-File -Encoding utf8 simulation_log.txt
```

## Configuration

### Web Interface
Configure simulation parameters through the web UI when clicking "Start Simulation":
- Number of agents (1-10)
- Number of packages (1-100)
- Map location (any city/district supported by OpenStreetMap)
- Battery buffer percentage (0-100%)

### Command-Line
Modify parameters in `simulation.py`:
- `MAP_QUERY` - Location for the map (default: "Cau Giay District, Hanoi, Vietnam")
- `NUM_AGENTS` - Number of delivery agents (default: 3)
- `NUM_PACKAGES` - Number of packages to deliver (default: 20)
- `MIN_WORKING_BUFFER_PERCENT` - Minimum battery buffer percentage (default: 0.3)

## How It Works

1. **Task Creation** - Packages are generated with random dropoff locations
2. **Bidding Process** - Main agent broadcasts tasks using Contract Net Protocol
3. **Agent Decision** - Agents evaluate feasibility based on battery and capacity
4. **Winner Selection** - Agent with shortest travel distance wins the bid
5. **Route Planning** - Winning agent plans optimal route using nearest-neighbor
6. **Delivery Execution** - Agent follows route, delivers packages, returns to depot
7. **Battery Management** - Agents recharge at depot before next task

## AI Concepts Demonstrated

- **Interaction Protocols** - Structured communication using Contract Net Protocol
- **Search/Optimization** - Shortest path algorithms and greedy heuristics
- **Automated Negotiation** - Competitive bidding for task assignment
- **Dynamic Adaptation** - Real-time decision-making based on constraints
- **Multi-Agent Coordination** - Distributed problem-solving

## License

MIT License

## Author

Minh Le
