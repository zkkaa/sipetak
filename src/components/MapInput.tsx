import React, { useEffect, useRef, useState, useMemo } from 'react';
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
        if (!map) return;
        
        const timer = setTimeout(() => {
            try {
                map.invalidateSize();
                map.setView(center, zoom, { animate: false });
            } catch (error) {
                console.warn('Map setView error:', error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [center, zoom, map]);
    
    return null;
};

interface MapInputProps {
    latitude: string;
    longitude: string;
}

const MapInput: React.FC<MapInputProps> = ({ latitude, longitude }) => {
    const defaultCenter: [number, number] = [-6.9175, 107.6191]; 
    const [isClient, setIsClient] = useState(false);
    const isInitializedRef = useRef(false);
    
    const position: [number, number] = useMemo(() => 
        (latitude && longitude) 
            ? [parseFloat(latitude), parseFloat(longitude)] 
            : defaultCenter,
        [latitude, longitude]
    );

    useEffect(() => {
        if (!isInitializedRef.current) {
            setIsClient(true);
            isInitializedRef.current = true;
        }
    }, []);

    if (!isClient) {
        return (
            <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Memuat peta...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-lg">
            <MapContainer 
                center={position} 
                zoom={15} 
                scrollWheelZoom={false} 
                className="w-full h-full rounded-lg z-0"
                attributionControl={true}
                zoomControl={true}
            >
                <ChangeView center={position} zoom={15} />
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {(latitude && longitude && position[0] !== defaultCenter[0]) && (
                    <Marker position={position} />
                )}
            </MapContainer>
        </div>
    );
};

export default React.memo(MapInput);