import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const icon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapComponent = ({ trip }) => {
    const center = [
        (trip.startPoint.latitude + trip.endingPoint.latitude) / 2,
        (trip.startPoint.longitude + trip.endingPoint.longitude) / 2
    ];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
                position={[trip.startPoint.latitude, trip.startPoint.longitude]}
                icon={icon}
            >
                <Popup>نقطة البداية: {trip.startPoint.address}</Popup>
            </Marker>
            <Marker 
                position={[trip.endingPoint.latitude, trip.endingPoint.longitude]}
                icon={icon}
            >
                <Popup>نقطة النهاية: {trip.endingPoint.address}</Popup>
            </Marker>
            <Polyline 
                positions={[
                    [trip.startPoint.latitude, trip.startPoint.longitude],
                    [trip.endingPoint.latitude, trip.endingPoint.longitude]
                ]}
                color="#007bff"
                weight={3}
                opacity={0.7}
            />
        </MapContainer>
    );
};

export default MapComponent;