# Delivery Multi Agent System

A multi-agent delivery simulation system using real-world map data from OpenStreetMap. This project demonstrates key AI agent concepts including automated negotiation, dynamic adaptation, and distributed task allocation.

## Features

- 🤝 **Contract Net Protocol** - Decentralized task assignment through competitive bidding
- 🔍 **Route Optimization** - Shortest path finding and nearest-neighbor routing
- 💬 **Automated Negotiation** - Agents bid for delivery tasks based on feasibility
- 🎯 **Dynamic Adaptation** - Autonomous decision-making for departure timing
- 🔋 **Battery Management** - Realistic energy constraints and depot recharging
- 🗺️ **Real-World Maps** - Uses OpenStreetMap data for realistic simulations
- 📊 **Live Visualization** - Real-time matplotlib visualization of agents and routes

## System Components

### Main Agent (`main_agent.py`)
Central coordinator (depot) that manages the task queue and implements the Contract Net Protocol for task assignment.

### Delivery Agent (`delivery_agent.py`)
Individual delivery agents with:
- Battery management (drains while moving, recharges at depot)
- Capacity constraints (max 5 packages)
- Bidding logic for task negotiation
- Route optimization using greedy nearest-neighbor algorithm
- Dynamic adaptation based on battery, capacity, and remaining tasks

### Package (`package.py`)
Simple package class for tracking delivery status and assignments.

### Simulation (`simulation.py`)
Main simulation engine that:
- Loads real map data from OpenStreetMap
- Creates and manages agents and packages
- Provides real-time visualization
- Runs step-by-step until all packages are delivered

## Installation

### Requirements
- Python 3.12 or higher
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
python -m pip install osmnx networkx matplotlib
```

## Usage

Run the simulation:
```bash
python simulation.py
```

Optional - Save simulation log to file:
```bash
python simulation.py | Out-File -Encoding utf8 simulation_log.txt
```

## Configuration

You can modify the following parameters in `simulation.py`:

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
