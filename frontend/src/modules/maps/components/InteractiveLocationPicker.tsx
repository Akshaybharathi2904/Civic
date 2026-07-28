import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import mapsService, { LocationSearchResult } from '../services/maps.service';
import { Search, Navigation, MapPin, Loader2, Check } from 'lucide-react';
import { Spinner } from '../../../shared/components/ui/Spinner';

const createPickerIcon = () => {
  return L.divIcon({
    className: 'custom-picker-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 16px rgba(6, 182, 212, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <div style="width: 10px; height: 10px; background-color: #0f172a; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

interface MapEventsHandlerProps {
  onPickLocation: (lat: number, lng: number) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({ onPickLocation }) => {
  useMapEvents({
    click(e) {
      onPickLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export interface InteractiveLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  height?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export const InteractiveLocationPicker: React.FC<InteractiveLocationPickerProps> = ({
  initialLat = 11.0084,
  initialLng = 76.9508,
  height = '420px',
  onLocationChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCoordinates = async (lat: number, lng: number, customAddress?: string) => {
    setPosition([lat, lng]);
    setIsGeocoding(true);

    let addressToUse = customAddress || '';
    if (!addressToUse) {
      const geoResult = await mapsService.reverseGeocode(lat, lng);
      addressToUse = geoResult.formattedAddress;
    }

    setFormattedAddress(addressToUse);
    setIsGeocoding(false);
    onLocationChange(lat, lng, addressToUse);
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await mapsService.searchLocation(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
    setShowDropdown(true);
  };

  const handleSelectSearchResult = (result: LocationSearchResult) => {
    setSearchQuery(result.displayName);
    setShowDropdown(false);
    handleSelectCoordinates(result.latitude, result.longitude, result.displayName);
  };

  const handleUseGPS = async () => {
    setIsLocatingGPS(true);
    try {
      const pos = await mapsService.getCurrentPosition();
      await handleSelectCoordinates(pos.lat, pos.lng);
    } catch (err: any) {
      alert(`GPS Geolocation Error: ${err.message || 'Unable to retrieve current position.'}`);
    } finally {
      setIsLocatingGPS(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Search Bar & GPS Button Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2" ref={searchContainerRef}>
        <div className="relative flex-1 w-full">
          <form onSubmit={handleSearchSubmit}>
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search location landmark or street address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold font-mono text-[11px] hover:bg-cyan-400 transition-colors flex items-center gap-1"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Autocomplete Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
              {searchResults.map((res) => (
                <button
                  key={res.placeId}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-3 text-xs hover:bg-slate-800/80 transition-colors flex items-start space-x-2 text-slate-200"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{res.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isLocatingGPS}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 font-mono"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <Navigation className="w-4 h-4 text-cyan-400" />
          )}
          <span>{isLocatingGPS ? 'Locating...' : 'Use Current GPS'}</span>
        </button>
      </div>

      {/* Map Display Container */}
      <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative z-0">
        {isGeocoding && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-400 font-mono text-[11px] flex items-center space-x-2 shadow-xl backdrop-blur-md">
            <Spinner size="sm" />
            <span>Reverse Geocoding Address...</span>
          </div>
        )}

        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController center={position} zoom={15} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventsHandler onPickLocation={(lat, lng) => handleSelectCoordinates(lat, lng)} />

          <Marker position={position} icon={createPickerIcon()}>
            <Popup>
              <div className="p-1 max-w-xs font-sans text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Check size={14} className="text-cyan-600" />
                  Selected Incident Marker
                </p>
                <p className="text-slate-600 mt-1">{formattedAddress || 'Resolving address...'}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  GPS: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default InteractiveLocationPicker;
