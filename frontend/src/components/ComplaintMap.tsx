import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Complaint } from '../types';

// Custom Marker Icons for Leaflet with Priority Color Indicators
const createPriorityIcon = (priorityLevel: string) => {
    let color = '#10b981'; // Green (Low)
    if (priorityLevel === 'Critical') color = '#ef4444'; // Red
    else if (priorityLevel === 'High') color = '#f97316'; // Orange
    else if (priorityLevel === 'Medium') color = '#f59e0b'; // Yellow

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #0f172a;
        box-shadow: 0 0 12px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
      </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPickerMarker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
    const [position, setPosition] = React.useState<[number, number] | null>(null);

    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
    });

    return position === null ? null : (
        <Marker position={position} icon={createPriorityIcon('Critical')}>
            <Popup>Selected Location: {position[0].toFixed(4)}, {position[1].toFixed(4)}</Popup>
        </Marker>
    );
};

interface ComplaintMapProps {
    complaints?: any[];
    center?: [number, number];
    zoom?: number;
    interactivePicker?: boolean;
    onLocationSelect?: (lat: number, lng: number) => void;
    onComplaintSelect?: (complaint: any) => void;
    height?: string;
}

export const ComplaintMap: React.FC<ComplaintMapProps> = ({
    complaints = [],
    center = [12.9716, 77.5946], // Bengaluru Center
    zoom = 12,
    interactivePicker = false,
    onLocationSelect,
    onComplaintSelect,
    height = '450px'
}) => {
    return (
        <div style={{ height }} className="w-full rounded-xl overflow-hidden shadow-xl border border-slate-800 relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Incident Markers */}
                {complaints.map((c) => {
                    const targetId = c.id || c._id;
                    const lat = c.lat || c.latitude || c.location?.coordinates?.[1] || 12.9716;
                    const lng = c.lng || c.longitude || c.location?.coordinates?.[0] || 77.5946;
                    const priority = c.priorityLevel || 'Medium';

                    return (
                        <Marker
                            key={targetId}
                            position={[lat, lng]}
                            icon={createPriorityIcon(priority)}
                            eventHandlers={{
                                click: () => onComplaintSelect && onComplaintSelect(c)
                            }}
                        >
                            <Popup>
                                <div className="p-1 max-w-xs font-sans">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-900 text-cyan-400">
                                            {c.ticketId}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-700">
                                            {priority} Priority ({c.priorityScore || 65}/100)
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-xs text-slate-900 mt-1.5 line-clamp-1">{c.title}</h4>
                                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5">{c.address || c.ward}</p>

                                    <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium">{c.category}</span>
                                        <a
                                            href={`/complaints/${targetId}`}
                                            className="font-bold text-cyan-600 hover:text-cyan-700 underline"
                                        >
                                            View Details &rarr;
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Interactive Click-to-Pick Location Marker */}
                {interactivePicker && onLocationSelect && (
                    <LocationPickerMarker onLocationSelect={onLocationSelect} />
                )}
            </MapContainer>
        </div>
    );
};
