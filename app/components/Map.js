'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-marker'
})

const placeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjRkYwMDAwIi8+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

// Component to handle map updates
function MapUpdater({ selectedPlace, places }) {
  const map = useMap()

  useEffect(() => {
    if (selectedPlace) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 16)
    }
  }, [selectedPlace, map])

  return null
}

export default function Map({ userLocation, places, selectedPlace, onPlaceClick }) {
  const mapRef = useRef(null)

  if (!userLocation) return null

  return (
    <div className="glass-morphism max-lg:h-[300px] max-xl:h-[400px] overflow-hidden w-full " >
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="leaflet-container h-full w-full  "
      
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <div>
            <strong>Your Location</strong>
          </div>
        </Popup>
      </Marker>

      {/* Place markers */}
      {places.map(place => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={placeIcon}
          eventHandlers={{
            click: () => onPlaceClick(place)
          }}
        >
          <Popup>
            <div>
              <strong>{place.name}</strong>
              <br />
              {place.address}
              {place.cuisine && (
                <>
                  <br />
                  <em>Cuisine: {place.cuisine}</em>
                </>
              )}
              {place.phone && (
                <>
                  <br />
                  📞 {place.phone}
                </>
              )}
              {place.website && (
                <>
                  <br />
                  <a href={place.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <MapUpdater selectedPlace={selectedPlace} places={places} />
    </MapContainer>

    </div>
  )
}