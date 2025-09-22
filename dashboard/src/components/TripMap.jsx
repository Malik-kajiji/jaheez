import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class TripMap extends React.Component {
    componentDidMount() {
        const { trip } = this.props;
        
        // Initialize map
        const map = L.map(this.mapRef).setView([
            (trip.startPoint.latitude + trip.endingPoint.latitude) / 2,
            (trip.startPoint.longitude + trip.endingPoint.longitude) / 2
        ], 13);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create start icon (green)
        const startIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="marker-circle" style="background: #4CAF50;">
                    <span>A</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });

        // Create end icon (red)
        const endIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="marker-circle" style="background: #f44336;">
                    <span>B</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });

        // Add custom CSS for markers
        const style = document.createElement('style');
        style.textContent = `
            .marker-circle {
                width: 36px;
                height: 36px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                border: 2px solid white;
            }
            .marker-circle span {
                color: white;
                font-weight: bold;
                font-size: 16px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);

        // Add start marker
        L.marker([trip.startPoint.latitude, trip.startPoint.longitude], { icon: startIcon })
            .bindPopup(`<div style="font-weight: bold;">نقطة البداية:</div>${trip.startPoint.address}`)
            .addTo(map);

        // Add end marker
        L.marker([trip.endingPoint.latitude, trip.endingPoint.longitude], { icon: endIcon })
            .bindPopup(`<div style="font-weight: bold;">نقطة النهاية:</div>${trip.endingPoint.address}`)
            .addTo(map);

        // Add polyline
        L.polyline([
            [trip.startPoint.latitude, trip.startPoint.longitude],
            [trip.endingPoint.latitude, trip.endingPoint.longitude]
        ], {
            color: '#007bff',
            weight: 3,
            opacity: 0.7
        }).addTo(map);

        // Fit bounds
        const bounds = L.latLngBounds(
            [trip.startPoint.latitude, trip.startPoint.longitude],
            [trip.endingPoint.latitude, trip.endingPoint.longitude]
        );
        map.fitBounds(bounds, { padding: [50, 50] });

        // Save map instance
        this.map = map;
    }

    componentWillUnmount() {
        // Clean up map instance
        if (this.map) {
            this.map.remove();
        }
    }

    render() {
        return (
            <div 
                ref={el => this.mapRef = el}
                style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            />
        );
    }
}

export default TripMap;