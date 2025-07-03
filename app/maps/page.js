'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="loading">Loading map...</div>
})

const categories = [
  { id: 'restaurant', name: 'Restaurants', amenity: 'restaurant' },
  { id: 'cafe', name: 'Cafes', amenity: 'cafe' },
  { id: 'hotel', name: 'Hotels', amenity: 'hotel' },
  { id: 'fuel', name: 'Gas Stations', amenity: 'fuel' },
  { id: 'hospital', name: 'Hospitals', amenity: 'hospital' },
  { id: 'bank', name: 'Banks', amenity: 'bank' },
  { id: 'pharmacy', name: 'Pharmacies', amenity: 'pharmacy' },
  { id: 'supermarket', name: 'Supermarkets', amenity: 'supermarket' }
]

export default function Home() {
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('loading')
  const [selectedCategory, setSelectedCategory] = useState('restaurant')
  const [searchQuery, setSearchQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(coords)
          setLocationStatus('success')
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationStatus('error')
          // Fallback to a default location (NYC)
          setUserLocation({ lat: 40.7128, lng: -74.0060 })
        }
      )
    } else {
      setLocationStatus('error')
      setUserLocation({ lat: 40.7128, lng: -74.0060 })
    }
  }, [])

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in km
  }

  // Search places using Overpass API (OpenStreetMap)
  const searchPlaces = useCallback(async (category, query = '') => {
    if (!userLocation) return

    setLoading(true)
    setError('')

    try {
      const radius = 5000 // 5km radius
      const amenity = categories.find(cat => cat.id === category)?.amenity || 'restaurant'
      
      // Build Overpass query
      let overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="${amenity}"]
            (around:${radius},${userLocation.lat},${userLocation.lng});
          way["amenity"="${amenity}"]
            (around:${radius},${userLocation.lat},${userLocation.lng});
          relation["amenity"="${amenity}"]
            (around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out geom;
      `

      if (query) {
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="${amenity}"]["name"~"${query}",i]
              (around:${radius},${userLocation.lat},${userLocation.lng});
            way["amenity"="${amenity}"]["name"~"${query}",i]
              (around:${radius},${userLocation.lat},${userLocation.lng});
            relation["amenity"="${amenity}"]["name"~"${query}",i]
              (around:${radius},${userLocation.lat},${userLocation.lng});
          );
          out geom;
        `
      }

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      })

      if (!response.ok) {
        throw new Error('Failed to fetch places')
      }

      const data = await response.json()
      
      // Process the results
      const processedPlaces = data.elements
        .filter(element => element.tags && element.tags.name)
        .map(element => {
          const lat = element.lat || (element.center ? element.center.lat : null)
          const lng = element.lon || (element.center ? element.center.lon : null)
          const distance = lat && lng ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng) : null
          
          return {
            id: element.id,
            name: element.tags.name,
            address: element.tags['addr:full'] || 
                     `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() ||
                     'Address not available',
            lat,
            lng,
            distance: distance ? distance.toFixed(1) : null,
            type: element.tags.amenity,
            cuisine: element.tags.cuisine,
            phone: element.tags.phone,
            website: element.tags.website,
            opening_hours: element.tags.opening_hours
          }
        })
        .filter(place => place.lat && place.lng)
        .sort((a, b) => (a.distance || 999) - (b.distance || 999)) // Sort by distance
        .slice(0, 50) // Limit to 50 results for performance

      setPlaces(processedPlaces)
    } catch (err) {
      console.error('Error searching places:', err)
      setError('Failed to search places. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userLocation])

  // Search when category or location changes
  useEffect(() => {
    if (userLocation) {
      searchPlaces(selectedCategory, searchQuery)
    }
  }, [userLocation, selectedCategory, searchPlaces])

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchPlaces(selectedCategory, query)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handlePlaceClick = (place) => {
    setSelectedPlace(place)
  }

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'loading':
        return 'Getting location...'
      case 'error':
        return 'Location unavailable'
      case 'success':
        return 'Location found'
      default:
        return ''
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="w-96 glass-morphism m-4 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <input
            type="text"
            placeholder="Search places..."
            className="w-full px-4 py-3 rounded-xl glass-morphism-dark placeholder-white/70 text-white outline-none focus:ring-2 focus:ring-white/30 transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
          
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="text-center py-10 text-white/70">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Searching places...
            </div>
          )}
          
          {error && (
            <div className="text-center py-10 text-red-300">
              {error}
            </div>
          )}
          
          {!loading && !error && places.length === 0 && (
            <div className="text-center py-10 text-white/70">
              No places found
            </div>
          )}

          {places.map(place => (
            <div
              key={place.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedPlace?.id === place.id
                  ? 'glass-morphism border-2 border-white/30'
                  : 'glass-morphism-dark hover:bg-white/10'
              }`}
              onClick={() => handlePlaceClick(place)}
            >
              <div className="font-semibold text-white mb-1">
                {place.name}
              </div>
              <div className="text-white/70 text-sm mb-2">
                {place.address}
              </div>
              <div className="flex flex-wrap gap-2">
                {place.distance && (
                  <span className="px-2 py-1 bg-blue-500/30 text-blue-100 text-xs rounded-full">
                    📍 {place.distance} km
                  </span>
                )}
                {place.cuisine && (
                  <span className="px-2 py-1 bg-green-500/30 text-green-100 text-xs rounded-full">
                    🍽️ {place.cuisine}
                  </span>
                )}
                {place.phone && (
                  <span className="px-2 py-1 bg-purple-500/30 text-purple-100 text-xs rounded-full">
                    📞 {place.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <div className={`absolute top-6 right-6 z-[1000] px-4 py-2 rounded-xl glass-morphism text-white text-sm font-medium shadow-lg ${
          locationStatus === 'loading' ? 'text-blue-200' :
          locationStatus === 'error' ? 'text-red-200' : 'text-green-200'
        }`}>
          {getLocationStatusText()}
        </div>
        
        {userLocation && (
          <Map
            userLocation={userLocation}
            places={places}
            selectedPlace={selectedPlace}
            onPlaceClick={handlePlaceClick}
          />
        )}
      </div>
    </div>
  )
}
