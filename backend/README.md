# Backend - Multi-Agent Delivery System

This folder contains the Python backend for the multi-agent delivery simulation system.

## Structure

```
backend/
├── app.py                  # Flask web server with REST API and WebSocket
├── simulation_engine.py    # Simulation wrapper for web interface
├── delivery_agent.py       # Delivery agent logic and behavior
├── main_agent.py          # Main coordinator (depot) agent
├── package.py             # Package model
└── simulation.py          # Original matplotlib-based simulation
```

## Core Components

### `app.py`
Flask application that provides:
- REST API endpoints (`/api/start`, `/api/stop`, `/api/pause`, `/api/status`)
- WebSocket support for real-time updates
- Static file serving for frontend

### `simulation_engine.py`
Thread-safe wrapper that:
- Initializes the multi-agent system
- Manages simulation state
- Sends real-time updates via WebSocket
- Handles map data from OpenStreetMap

### `delivery_agent.py`
Individual agent implementation with:
- Battery management
- Capacity constraints
- Bidding logic (Contract Net Protocol)
- Route optimization (nearest-neighbor)
- Dynamic adaptation

### `main_agent.py`
Central coordinator that:
- Manages task queue
- Implements Contract Net Protocol
- Coordinates agent bidding

### `package.py`
Simple package model for tracking delivery status

### `simulation.py`
Original command-line simulation with matplotlib visualization

## Running the Backend

From the project root:
```bash
cd backend
python app.py
```

Or use the launcher scripts from the root directory.

## API Endpoints

- `POST /api/start` - Start simulation with configuration
- `POST /api/stop` - Stop the running simulation
- `POST /api/pause` - Pause/resume simulation
- `GET /api/status` - Get current simulation status
- `GET /api/map-data` - Get map boundaries and initial data

## WebSocket Events

- `connect` - Client connection established
- `simulation_update` - Real-time state updates
- `simulation_complete` - Simulation finished
- `request_update` - Client requests current state
