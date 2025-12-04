// app.js - Frontend JavaScript for Multi-Agent Delivery System

// Initialize variables
let map;
let socket;
let markers = {
    depot: null,
    agents: {},
    dropoffs: {}
};
let routeLines = {};
let selectedOrder = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeSocketIO();
    initializeEventListeners();
});

// Initialize Leaflet Map
function initializeMap() {
    // Default center (will be updated when simulation starts)
    map = L.map('map').setView([21.0285, 105.8542], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// Initialize Socket.IO connection
function initializeSocketIO() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('simulation_update', function(data) {
        updateSimulation(data);
    });
    
    socket.on('simulation_complete', function(data) {
        handleSimulationComplete(data);
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });
}

// Initialize Event Listeners
function initializeEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const modal = document.getElementById('configModal');
    const closeModal = document.querySelector('.close');
    const cancelConfig = document.getElementById('cancelConfig');
    const confirmConfig = document.getElementById('confirmConfig');
    
    startBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });
    
    pauseBtn.addEventListener('click', pauseSimulation);
    stopBtn.addEventListener('click', stopSimulation);
    
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    cancelConfig.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    confirmConfig.addEventListener('click', startSimulation);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// Start Simulation
async function startSimulation() {
    const numAgents = parseInt(document.getElementById('numAgents').value);
    const numPackages = parseInt(document.getElementById('numPackages').value);
    const mapLocation = document.getElementById('mapLocation').value;
    const bufferPercent = parseInt(document.getElementById('bufferPercent').value) / 100;
    
    const modal = document.getElementById('configModal');
    modal.classList.remove('show');
    
    // Disable start button, enable pause/stop
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    
    try {
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                num_agents: numAgents,
                num_packages: numPackages,
                map_location: mapLocation,
                buffer_percent: bufferPercent
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Simulation started:', data);
            // Get map data and center view
            setTimeout(async () => {
                const mapDataResponse = await fetch('/api/map-data');
                const mapData = await mapDataResponse.json();
                if (mapData.center) {
                    map.setView([mapData.center.lat, mapData.center.lng], 14);
                }
            }, 1000);
        } else {
            alert('Error starting simulation: ' + data.error);
            resetButtons();
        }
    } catch (error) {
        console.error('Error starting simulation:', error);
        alert('Failed to start simulation');
        resetButtons();
    }
}

// Pause/Resume Simulation
async function pauseSimulation() {
    try {
        const response = await fetch('/api/pause', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const pauseBtn = document.getElementById('pauseBtn');
            if (data.status === 'paused') {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        }
    } catch (error) {
        console.error('Error pausing simulation:', error);
    }
}

// Stop Simulation
async function stopSimulation() {
    try {
        const response = await fetch('/api/stop', {
            method: 'POST'
        });
        
        if (response.ok) {
            console.log('Simulation stopped');
            resetButtons();
            clearMap();
        }
    } catch (error) {
        console.error('Error stopping simulation:', error);
    }
}

// Update Simulation Display
function updateSimulation(data) {
    // Update stats
    document.getElementById('timeStep').textContent = data.time_step;
    document.getElementById('completedCount').textContent = 
        `${data.completed_count}/${data.packages.length}`;
    
    // Update depot marker
    if (!markers.depot && data.depot) {
        markers.depot = L.marker([data.depot.lat, data.depot.lng], {
            icon: L.divIcon({
                className: 'custom-marker depot-marker',
                html: '<i class="fas fa-warehouse" style="color: #10b981; font-size: 24px;"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
    }
    
    // Update agents
    updateAgents(data.agents);
    
    // Update packages/orders
    updateOrders(data.packages);
    
    // Update dropoff markers
    updateDropoffs(data.packages);
}

// Update Agents on Map and List
function updateAgents(agents) {
    const agentsList = document.getElementById('agentsList');
    agentsList.innerHTML = '';
    
    // Track existing agent IDs
    const currentAgentIds = new Set(agents.map(a => a.id));
    
    // Remove markers for agents that no longer exist
    Object.keys(markers.agents).forEach(id => {
        if (!currentAgentIds.has(parseInt(id))) {
            map.removeLayer(markers.agents[id]);
            delete markers.agents[id];
        }
    });
    
    // Remove old route lines
    Object.keys(routeLines).forEach(id => {
        if (!currentAgentIds.has(parseInt(id))) {
            map.removeLayer(routeLines[id]);
            delete routeLines[id];
        }
    });
    
    agents.forEach(agent => {
        // Update agent marker
        const iconColor = agent.status === 'available' ? '#2563eb' : 
                         agent.status === 'busy' ? '#f59e0b' : '#6b7280';
        
        const icon = L.divIcon({
            className: 'custom-marker agent-marker',
            html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        if (markers.agents[agent.id]) {
            markers.agents[agent.id].setLatLng([agent.location_coords.lat, agent.location_coords.lng]);
            markers.agents[agent.id].setIcon(icon);
        } else {
            markers.agents[agent.id] = L.marker([agent.location_coords.lat, agent.location_coords.lng], {
                icon: icon
            }).addTo(map);
        }
        
        // Update route line
        if (agent.route_coords && agent.route_coords.length > 0) {
            const routeColor = agent.status === 'busy' ? '#f59e0b' : '#6b7280';
            const latlngs = [[agent.location_coords.lat, agent.location_coords.lng]];
            agent.route_coords.forEach(coord => {
                latlngs.push([coord.lat, coord.lng]);
            });
            
            if (routeLines[agent.id]) {
                routeLines[agent.id].setLatLngs(latlngs);
                routeLines[agent.id].setStyle({ color: routeColor });
            } else {
                routeLines[agent.id] = L.polyline(latlngs, {
                    color: routeColor,
                    weight: 3,
                    opacity: 0.7
                }).addTo(map);
            }
        } else if (routeLines[agent.id]) {
            map.removeLayer(routeLines[agent.id]);
            delete routeLines[agent.id];
        }
        
        // Update agent list
        const batteryPercent = (agent.battery / agent.max_battery) * 100;
        const batteryClass = batteryPercent > 50 ? '' : batteryPercent > 20 ? 'medium' : 'low';
        
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-header">
                <span class="agent-id">Agent ${agent.id}</span>
                <span class="agent-status status-${agent.status}">${agent.status}</span>
            </div>
            <div class="agent-info">
                <div>Battery: ${agent.battery.toFixed(1)}/${agent.max_battery}</div>
                <div>Packages: ${agent.packages_count}/${agent.capacity}</div>
                <div class="battery-bar">
                    <div class="battery-fill ${batteryClass}" style="width: ${batteryPercent}%"></div>
                </div>
            </div>
        `;
        agentsList.appendChild(agentCard);
    });
}

// Update Orders List
function updateOrders(packages) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    packages.forEach(pkg => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        if (selectedOrder === pkg.id) {
            orderCard.classList.add('selected');
        }
        
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Package ${pkg.id}</span>
                <span class="order-status status-${pkg.status}">${pkg.status}</span>
            </div>
            <div class="order-date">Dropoff: Node ${pkg.dropoff_location}</div>
            ${pkg.assigned_agent ? `<div class="order-date">Agent: ${pkg.assigned_agent}</div>` : ''}
        `;
        
        orderCard.addEventListener('click', () => {
            selectOrder(pkg);
        });
        
        ordersList.appendChild(orderCard);
    });
}

// Update Dropoff Markers
function updateDropoffs(packages) {
    // Track current dropoff locations
    const activeDropoffs = new Set();
    
    packages.forEach(pkg => {
        if (pkg.status !== 'delivered' && pkg.status !== 'cancelled') {
            activeDropoffs.add(pkg.dropoff_location);
            
            if (!markers.dropoffs[pkg.dropoff_location]) {
                markers.dropoffs[pkg.dropoff_location] = L.marker(
                    [pkg.dropoff_coords.lat, pkg.dropoff_coords.lng],
                    {
                        icon: L.divIcon({
                            className: 'custom-marker dropoff-marker',
                            html: '<i class="fas fa-map-marker-alt" style="color: #ef4444; font-size: 24px;"></i>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    }
                ).addTo(map);
            }
        }
    });
    
    // Remove markers for completed dropoffs
    Object.keys(markers.dropoffs).forEach(loc => {
        if (!activeDropoffs.has(parseInt(loc))) {
            map.removeLayer(markers.dropoffs[loc]);
            delete markers.dropoffs[loc];
        }
    });
}

// Select Order
function selectOrder(pkg) {
    selectedOrder = pkg.id;
    
    // Update UI
    document.querySelectorAll('.order-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update order details panel
    const detailsPanel = document.getElementById('orderDetails');
    detailsPanel.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Package ID:</span>
            <span class="detail-value">${pkg.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">${pkg.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Pickup Location:</span>
            <span class="detail-value">Node ${pkg.pickup_location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Dropoff Location:</span>
            <span class="detail-value">Node ${pkg.dropoff_location}</span>
        </div>
        ${pkg.assigned_agent ? `
        <div class="detail-row">
            <span class="detail-label">Assigned Agent:</span>
            <span class="detail-value">Agent ${pkg.assigned_agent}</span>
        </div>
        ` : ''}
    `;
    
    // Center map on dropoff location
    if (pkg.dropoff_coords) {
        map.setView([pkg.dropoff_coords.lat, pkg.dropoff_coords.lng], 16);
    }
}

// Handle Simulation Complete
function handleSimulationComplete(data) {
    alert(`Simulation completed in ${data.total_steps} time steps!\nDelivered: ${data.completed} packages`);
    resetButtons();
}

// Reset Buttons
function resetButtons() {
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
    document.getElementById('stopBtn').disabled = true;
}

// Clear Map
function clearMap() {
    // Remove all markers and lines
    if (markers.depot) {
        map.removeLayer(markers.depot);
        markers.depot = null;
    }
    
    Object.values(markers.agents).forEach(marker => map.removeLayer(marker));
    markers.agents = {};
    
    Object.values(markers.dropoffs).forEach(marker => map.removeLayer(marker));
    markers.dropoffs = {};
    
    Object.values(routeLines).forEach(line => map.removeLayer(line));
    routeLines = {};
    
    // Reset UI
    document.getElementById('ordersList').innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>Start simulation to see packages</p></div>';
    document.getElementById('agentsList').innerHTML = '';
    document.getElementById('orderDetails').innerHTML = '<p class="empty-message">Select an order to view details</p>';
    document.getElementById('timeStep').textContent = '0';
    document.getElementById('completedCount').textContent = '0/0';
}
