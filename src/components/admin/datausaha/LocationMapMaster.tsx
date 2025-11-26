"use client";
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-expect-error Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
    const html = `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
    return L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

interface LocationMaster {
    id: number;
    koordinat: [number, number]; 
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string;
}

interface LocationMapMasterProps {
    locations: LocationMaster[];
}

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

interface LocationMapMasterProps {
    locations: LocationMaster[];
    onClickMap: (lat: number, lon: number) => void; 
    isAddingMode: boolean; 
}

const MapEventsHandler: React.FC<{ isAddingMode: boolean; onClickMap: (lat: number, lon: number) => void }> = ({ isAddingMode, onClickMap }) => {
    useMapEvents({
        click: (e) => {
            if (isAddingMode) {
                onClickMap(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const LocationMapMaster: React.FC<LocationMapMasterProps> = ({ locations, isAddingMode, onClickMap }) => {
    const centerLat = -7.3364264426045045;
    const centerLon = 108.22250268808587;
    const defaultCenter: [number, number] = [centerLat, centerLon];
    
    const getMarkerColor = (status: LocationMaster['status']) => {
        switch (status) {
            case 'Terisi': return 'green';
            case 'Tersedia': return 'blue';
            case 'Terlarang': return 'red';
            default: return 'gray';
        }
    };
    
    const markers = useMemo(() => {
        return locations.map(loc => {
            const color = getMarkerColor(loc.status);
            const icon = createCustomIcon(color);
            
            return (
                <Marker key={loc.id} position={[loc.koordinat[0], loc.koordinat[1]]} icon={icon}>
                    <Popup>
                        <strong className="text-sm">{loc.umkmName || 'Titik Kosong'}</strong><br />
                        Status: <span style={{ color: color }}>{loc.status}</span><br />
                        Koordinat: {loc.koordinat[0]}, {loc.koordinat[1]}
                    </Popup>
                </Marker>
            );
        });
    }, [locations]);


    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={15} 
            scrollWheelZoom={true} 
            className="w-full h-full z-0"
        >
            <ChangeView center={defaultCenter} zoom={13} />
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventsHandler isAddingMode={isAddingMode} onClickMap={onClickMap} /> 
            {markers}
        </MapContainer>
    );
};

export default LocationMapMaster;