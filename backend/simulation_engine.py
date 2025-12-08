# simulation_engine.py - Wrapper for the multi-agent simulation to work with web interface

import osmnx as ox
import networkx as nx
import random
from threading import Thread, Lock
import time
from main_agent import MainAgent
from package import Package

class SimulationEngine:
    def __init__(self, num_agents=3, num_packages=20, map_location='Cau Giay District, Hanoi, Vietnam', 
                 buffer_percent=0.3, socketio=None):
        self.num_agents = num_agents
        self.num_packages = num_packages
        self.total_packages = num_packages
        self.map_location = map_location
        self.buffer_percent = buffer_percent
        self.socketio = socketio
        
        self.graph = None
        self.supervisor = None
        self.all_tasks = []
        
        self.is_running = False
        self.is_paused = False
        self.time_step = 0
        self.simulation_thread = None
        self.lock = Lock()
        
        # Initialize the simulation
        self._initialize()
    
    def _initialize(self):
        """Initialize the graph, agents, and packages"""
        print(f"Loading map from OpenStreetMap ({self.map_location})...")
        graph_directional = ox.graph_from_place(self.map_location, network_type='drive')
        print("Converting map to undirected...")
        self.graph = graph_directional.to_undirected()
        self.graph = nx.convert_node_labels_to_integers(self.graph)
        nodes = list(self.graph.nodes)
        print(f"Map has {len(self.graph.nodes)} nodes")
        
        # Create main agent (depot)
        self.supervisor = MainAgent(self.graph)
        self.supervisor.create_agents(self.num_agents, self.buffer_percent)
        
        # Create packages
        print(f"Creating {self.num_packages} packages...")
        for i in range(self.num_packages):
            while True:
                dropoff = random.choice(nodes)
                if (dropoff != self.supervisor.location and 
                    nx.has_path(self.graph, self.supervisor.location, dropoff)):
                    break
            package = Package(package_id=i + 1, dropoff_location=dropoff, 
                            pickup_location=self.supervisor.location)
            self.all_tasks.append(package)
        
        self.supervisor.add_tasks(self.all_tasks)
        print("Simulation initialized successfully!")
    
    def start(self):
        """Start the simulation in a separate thread"""
        if not self.is_running:
            self.is_running = True
            self.is_paused = False
            self.simulation_thread = Thread(target=self._run_simulation)
            self.simulation_thread.daemon = True
            self.simulation_thread.start()
    
    def stop(self):
        """Stop the simulation"""
        self.is_running = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=2)
    
    def toggle_pause(self):
        """Pause or resume the simulation"""
        self.is_paused = not self.is_paused
    
    def _run_simulation(self):
        """Main simulation loop"""
        while self.is_running and any(p.status != 'delivered' and p.status != 'cancelled' 
                                     for p in self.all_tasks):
            if not self.is_paused:
                try:
                    with self.lock:
                        print(f"\n--- Time Step: {self.time_step} ---")
                        
                        # Update agents
                        for agent in self.supervisor.agents:
                            agent.update(
                                self.supervisor.location,
                                self.buffer_percent,
                                self.supervisor.pending_tasks
                            )
                        
                        # Check and assign tasks
                        self.supervisor.check_and_assign_tasks()
                        
                        self.time_step += 1
                    
                    # Emit update to frontend (outside lock to prevent blocking)
                    if self.socketio:
                        try:
                            state = self.get_current_state()
                            self.socketio.emit('simulation_update', state)
                        except Exception as e:
                            print(f"Warning: Failed to emit state: {e}")
                    
                    time.sleep(0.5)  # Control simulation speed
                except Exception as e:
                    print(f"Error in simulation loop: {e}")
                    import traceback
                    traceback.print_exc()
            else:
                time.sleep(0.1)  # Small sleep when paused
        
        self.is_running = False
        if self.socketio:
            self.socketio.emit('simulation_complete', {
                'total_steps': self.time_step,
                'completed': self.get_completed_count()
            })
        print("\nSimulation completed!")
    
    def get_current_state(self):
        """Get current state of the simulation for frontend"""
        with self.lock:
            print(f"Getting current state for time step {self.time_step}")
            agents_data = []
            for agent in self.supervisor.agents:
                agent_info = {
                    'id': agent.id,
                    'location': agent.location,
                    'location_coords': {
                        'lat': self.graph.nodes[agent.location]['y'],
                        'lng': self.graph.nodes[agent.location]['x']
                    },
                    'status': agent.status,
                    'battery': agent.current_battery,
                    'max_battery': agent.max_battery,
                    'packages_count': len(agent.packages_on_board),
                    'capacity': agent.capacity,
                    'path': agent.path[:10] if agent.path else [],  # Send next 10 nodes
                    'dropoff_order': agent.dropoff_order
                }
                
                # Add route coordinates
                if agent.path:
                    route_coords = []
                    current = agent.location
                    for node in agent.path[:10]:
                        route_coords.append({
                            'lat': self.graph.nodes[node]['y'],
                            'lng': self.graph.nodes[node]['x']
                        })
                    agent_info['route_coords'] = route_coords
                
                agents_data.append(agent_info)
            
            # Package data
            packages_data = []
            for pkg in self.all_tasks:
                pkg_info = {
                    'id': pkg.id,
                    'status': pkg.status,
                    'pickup_location': pkg.pickup_location,
                    'dropoff_location': pkg.dropoff_location,
                    'dropoff_coords': {
                        'lat': self.graph.nodes[pkg.dropoff_location]['y'],
                        'lng': self.graph.nodes[pkg.dropoff_location]['x']
                    },
                    'assigned_agent': pkg.assigned_agent
                }
                packages_data.append(pkg_info)
            
            # Depot location
            depot_coords = {
                'lat': self.graph.nodes[self.supervisor.location]['y'],
                'lng': self.graph.nodes[self.supervisor.location]['x']
            }
            
            return {
                'time_step': self.time_step,
                'agents': agents_data,
                'packages': packages_data,
                'depot': depot_coords,
                'depot_node': self.supervisor.location,
                'pending_tasks_count': len(self.supervisor.pending_tasks),
                'completed_count': self.get_completed_count()
            }
    
    def get_map_data(self):
        """Get map boundaries and initial data for frontend"""
        if not self.graph:
            return None
        
        nodes = list(self.graph.nodes(data=True))
        lats = [node[1]['y'] for node in nodes]
        lngs = [node[1]['x'] for node in nodes]
        
        return {
            'center': {
                'lat': sum(lats) / len(lats),
                'lng': sum(lngs) / len(lngs)
            },
            'bounds': {
                'north': max(lats),
                'south': min(lats),
                'east': max(lngs),
                'west': min(lngs)
            },
            'depot': {
                'lat': self.graph.nodes[self.supervisor.location]['y'],
                'lng': self.graph.nodes[self.supervisor.location]['x']
            }
        }
    
    def get_completed_count(self):
        """Get count of completed packages"""
        return len([p for p in self.all_tasks if p.status == 'delivered'])
