import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-expect-error Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
});

interface ChangeViewProps {
    center: [number, number];
    zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom); 
    }, [center, zoom, map]);
    return null;
};

interface MapInputProps {
    latitude: string;
    longitude: string;
}

const MapInput: React.FC<MapInputProps> = ({ latitude, longitude }) => {
    const defaultCenter: [number, number] = [-6.9175, 107.6191]; // Contoh: Bandung
    const position: [number, number] = 
        (latitude && longitude) 
            ? [parseFloat(latitude), parseFloat(longitude)] 
            : defaultCenter;

    return (
        <MapContainer 
            center={position} 
            zoom={15} 
            scrollWheelZoom={false} 
            className="w-full h-full rounded-lg z-0"
        >
            <ChangeView center={position} zoom={15} />
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(latitude && longitude && position[0] !== defaultCenter[0]) && (
                <Marker position={position} />
            )}
        </MapContainer>
    );
};

export default MapInput;