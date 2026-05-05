"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Visit = {
  id: string;
  createdAt: string;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  path: string | null;
};

// Fix default marker icons when bundling.
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export function VisitorsMap({ visits }: { visits: Visit[] }) {
  const points = visits
    .filter((v) => typeof v.latitude === "number" && typeof v.longitude === "number")
    .map((v) => ({
      ...v,
      lat: v.latitude as number,
      lng: v.longitude as number,
    }));

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface">
      <div className="h-[420px] w-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((v) => (
            <Marker key={v.id} position={[v.lat, v.lng]}>
              <Popup>
                <div className="text-sm">
                  <div>
                    {v.city ?? "—"}
                    {v.region ? `, ${v.region}` : ""}
                    {v.country ? `, ${v.country}` : ""}
                  </div>
                  <div className="opacity-70">{v.path ?? "/"}</div>
                  <div className="opacity-70">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

