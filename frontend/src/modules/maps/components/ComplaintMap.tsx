import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { InteractiveLocationPicker } from './InteractiveLocationPicker';

const createPriorityIcon = (priorityLevel: string) => {
  let color = '#10b981';
  if (priorityLevel === 'Critical') color = '#ef4444';
  else if (priorityLevel === 'High') color = '#f97316';
  else if (priorityLevel === 'Medium') color = '#f59e0b';

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
    iconAnchor: [12, 12],
  });
};

export interface ComplaintMapProps {
  complaints?: any[];
  center?: [number, number];
  zoom?: number;
  interactivePicker?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  onComplaintSelect?: (complaint: any) => void;
  height?: string;
}

export const ComplaintMap: React.FC<ComplaintMapProps> = ({
  complaints = [],
  center = [12.9716, 77.5946],
  zoom = 12,
  interactivePicker = false,
  onLocationSelect,
  onComplaintSelect,
  height = '450px',
}) => {
  if (interactivePicker && onLocationSelect) {
    return (
      <InteractiveLocationPicker
        initialLat={center[0]}
        initialLng={center[1]}
        height={height}
        onLocationChange={(lat, lng, address) => onLocationSelect(lat, lng, address)}
      />
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative z-0">
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
                click: () => onComplaintSelect && onComplaintSelect(c),
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
      </MapContainer>
    </div>
  );
};

export default ComplaintMap;
