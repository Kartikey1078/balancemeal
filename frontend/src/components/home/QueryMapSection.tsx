import React, { useMemo } from 'react';
import { Send } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const locations = [
  { name: 'Hamilton, ON', lat: 43.2557, lng: -79.8711 },
  { name: 'Burlington, ON', lat: 43.3255, lng: -79.799 },
  { name: 'Oakville, ON', lat: 43.4675, lng: -79.6877 },
  { name: 'Mississauga, ON', lat: 43.589, lng: -79.6441 },
  { name: 'Ontario (Toronto), ON', lat: 43.6532, lng: -79.3832 },
];

const FitBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
};

export const QueryMapSection: React.FC = () => {
  return (
    <section className="py-28 bg-[#F9FBF9]/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg bg-white group">
            <div className="h-72 lg:h-full w-full relative z-0">
              <MapContainer className="h-full w-full relative z-0" scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds
                  bounds={locations.map((loc) => [loc.lat, loc.lng]) as L.LatLngBoundsExpression}
                />
                {locations.map((loc) => (
                  <Marker key={loc.name} position={[loc.lat, loc.lng]}>
                    <Popup>{loc.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black text-olive-800 mb-2">Having a query?</h3>
              <p className="text-gray-500">
                We’re just one click away! Join the countless others who have made the switch to a healthier lifestyle with Balanced Meal.
              </p>
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-400">
                Hamilton · Burlington · Oakville · Mississauga · Ontario
              </p>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-gray-100 shadow-lg bg-white p-8">
            <h3 className="text-2xl font-black text-olive-800 mb-8">Send us a message</h3>
            <form className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-semibold text-olive-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-semibold text-olive-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Plan</label>
                <select className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-semibold text-olive-800 focus:outline-none focus:ring-2 focus:ring-gold-500">
                  <option>Nutrition Punch</option>
                  <option>Lean & Clean</option>
                  <option>Performance Plus</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help you."
                  className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-semibold text-olive-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <button
                type="button"
                className="w-full text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)]"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
