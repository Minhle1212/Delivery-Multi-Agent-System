# app.py - Flask Web Application for Multi-Agent Delivery System

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
import os
from threading import Lock
from simulation_engine import SimulationEngine

# Set up paths for frontend templates and static files
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'templates')
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
app.config['SECRET_KEY'] = 'delivery-multi-agent-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global simulation instance
simulation = None
simulation_lock = Lock()

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_simulation():
    """Start a new simulation with given parameters"""
    global simulation
    
    data = request.json
    num_agents = data.get('num_agents', 3)
    num_packages = data.get('num_packages', 20)
    map_location = data.get('map_location', 'Cau Giay District, Hanoi, Vietnam')
    buffer_percent = data.get('buffer_percent', 0.3)
    
    with simulation_lock:
        if simulation and simulation.is_running:
            return jsonify({'error': 'Simulation already running'}), 400
        
        try:
            simulation = SimulationEngine(
                num_agents=num_agents,
                num_packages=num_packages,
                map_location=map_location,
                buffer_percent=buffer_percent,
                socketio=socketio
            )
            simulation.start()
            
            return jsonify({
                'status': 'started',
                'message': 'Simulation started successfully'
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/stop', methods=['POST'])
def stop_simulation():
    """Stop the current simulation"""
    global simulation
    
    with simulation_lock:
        if simulation:
            simulation.stop()
            return jsonify({'status': 'stopped', 'message': 'Simulation stopped'})
        return jsonify({'error': 'No simulation running'}), 400

@app.route('/api/pause', methods=['POST'])
def pause_simulation():
    """Pause/Resume the simulation"""
    global simulation
    
    with simulation_lock:
        if simulation:
            simulation.toggle_pause()
            status = 'paused' if simulation.is_paused else 'resumed'
            return jsonify({'status': status})
        return jsonify({'error': 'No simulation running'}), 400

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current simulation status"""
    global simulation
    
    with simulation_lock:
        if simulation:
            return jsonify({
                'running': simulation.is_running,
                'paused': simulation.is_paused,
                'time_step': simulation.time_step,
                'completed_packages': simulation.get_completed_count(),
                'total_packages': simulation.total_packages
            })
        return jsonify({
            'running': False,
            'paused': False,
            'time_step': 0,
            'completed_packages': 0,
            'total_packages': 0
        })

@app.route('/api/map-data', methods=['GET'])
def get_map_data():
    """Get map boundaries and initial data"""
    global simulation
    
    with simulation_lock:
        if simulation and simulation.graph:
            return jsonify(simulation.get_map_data())
        return jsonify({'error': 'No simulation initialized'}), 400

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('connection_response', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

@socketio.on('request_update')
def handle_update_request():
    """Send current simulation state to client"""
    global simulation
    
    with simulation_lock:
        if simulation:
            state = simulation.get_current_state()
            emit('simulation_update', state)

if __name__ == '__main__':
    print("=" * 60)
    print("🚚 Multi-Agent Delivery System - Web Interface")
    print("=" * 60)
    print("Starting server...")
    print("Access the dashboard at: http://localhost:5000")
    print("=" * 60)
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
