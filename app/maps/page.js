'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="loading">Loading map...</div>
})

// Updated categories with proper OSM tags
const categories = [
  // Gastronomy
  { id: 'restaurant', name: 'Restaurants', tags: [{ key: 'amenity', value: 'restaurant' }] },
  { id: 'cafe', name: 'Cafes', tags: [{ key: 'amenity', value: 'cafe' }] },
  { id: 'fast_food', name: 'Fast Food', tags: [{ key: 'amenity', value: 'fast_food' }] },
  { id: 'bar', name: 'Bars', tags: [{ key: 'amenity', value: 'bar' }] },
  { id: 'pub', name: 'Pubs', tags: [{ key: 'amenity', value: 'pub' }] },
  
  // Healthcare
  { id: 'hospital', name: 'Hospitals', tags: [{ key: 'amenity', value: 'hospital' }] },
  { id: 'pharmacy', name: 'Pharmacies', tags: [{ key: 'amenity', value: 'pharmacy' }] },
  { id: 'clinic', name: 'Clinics', tags: [{ key: 'amenity', value: 'clinic' }, { key: 'amenity', value: 'doctors' }] },
  { id: 'dentist', name: 'Dentists', tags: [{ key: 'amenity', value: 'dentist' }] },
  
  // Finance
  { id: 'bank', name: 'Banks', tags: [{ key: 'amenity', value: 'bank' }] },
  { id: 'atm', name: 'ATMs', tags: [{ key: 'amenity', value: 'atm' }] },
  
  // Transportation
  { id: 'fuel', name: 'Gas Stations', tags: [{ key: 'amenity', value: 'fuel' }] },
  { id: 'parking', name: 'Parking', tags: [{ key: 'amenity', value: 'parking' }] },
  { id: 'bus_stop', name: 'Bus Stops', tags: [{ key: 'highway', value: 'bus_stop' }] },
  
  // Shopping
  { id: 'supermarket', name: 'Supermarkets', tags: [{ key: 'shop', value: 'supermarket' }] },
  { id: 'convenience', name: 'Convenience Stores', tags: [{ key: 'shop', value: 'convenience' }] },
  { id: 'marketplace', name: 'Marketplaces', tags: [{ key: 'amenity', value: 'marketplace' }] },
  
  // Tourism & Accommodation
  { id: 'hotel', name: 'Hotels', tags: [{ key: 'tourism', value: 'hotel' }] },
  { id: 'guest_house', name: 'Guest Houses', tags: [{ key: 'tourism', value: 'guest_house' }] },
  { id: 'hostel', name: 'Hostels', tags: [{ key: 'tourism', value: 'hostel' }] },
  { id: 'museum', name: 'Museums', tags: [{ key: 'tourism', value: 'museum' }] },
  { id: 'viewpoint', name: 'Viewpoints', tags: [{ key: 'tourism', value: 'viewpoint' }] },
  
  // Culture & Entertainment
  { id: 'library', name: 'Libraries', tags: [{ key: 'amenity', value: 'library' }] },
  { id: 'cinema', name: 'Cinemas', tags: [{ key: 'amenity', value: 'cinema' }] },
  { id: 'theatre', name: 'Theatres', tags: [{ key: 'amenity', value: 'theatre' }] },
  
  // Leisure & Sports
  { id: 'playground', name: 'Playgrounds', tags: [{ key: 'leisure', value: 'playground' }] },
  { id: 'fitness', name: 'Fitness Centers', tags: [{ key: 'leisure', value: 'fitness_centre' }] },
  { id: 'golf', name: 'Golf Courses', tags: [{ key: 'leisure', value: 'golf_course' }] },
  
  // Public Services
  { id: 'toilets', name: 'Public Toilets', tags: [{ key: 'amenity', value: 'toilets' }] },
  { id: 'police', name: 'Police Stations', tags: [{ key: 'amenity', value: 'police' }] },
  { id: 'fire_station', name: 'Fire Stations', tags: [{ key: 'amenity', value: 'fire_station' }] },
  
  // Religious
  { id: 'place_of_worship', name: 'Places of Worship', tags: [{ key: 'amenity', value: 'place_of_worship' }] }
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

  // Build Overpass query for multiple tags
  const buildOverpassQuery = (categoryTags, userLocation, radius, query = '') => {
    const tagQueries = categoryTags.map(tag => {
      const baseQuery = `["${tag.key}"="${tag.value}"]`
      const nameFilter = query ? `["name"~"${query}",i]` : ''
      
      return `
        node${baseQuery}${nameFilter}(around:${radius},${userLocation.lat},${userLocation.lng});
        way${baseQuery}${nameFilter}(around:${radius},${userLocation.lat},${userLocation.lng});
        relation${baseQuery}${nameFilter}(around:${radius},${userLocation.lat},${userLocation.lng});
      `
    }).join('')

    return `
      [out:json][timeout:25];
      (
        ${tagQueries}
      );
      out geom;
    `
  }

  // Search places using Overpass API (OpenStreetMap)
  const searchPlaces = useCallback(async (categoryId, query = '') => {
    if (!userLocation) return

    setLoading(true)
    setError('')

    try {
      const radius = 5000 // 5km radius
      const category = categories.find(cat => cat.id === categoryId)
      
      if (!category) {
        throw new Error('Category not found')
      }

      const overpassQuery = buildOverpassQuery(category.tags, userLocation, radius, query)

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
        .filter(element => element.tags && (element.tags.name || element.tags.brand))
        .map(element => {
          const lat = element.lat || (element.center ? element.center.lat : null)
          const lng = element.lon || (element.center ? element.center.lon : null)
          const distance = lat && lng ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng) : null
          
          // Get the most relevant tag for display
          const getDisplayType = (tags) => {
            if (tags.amenity) return tags.amenity
            if (tags.shop) return tags.shop
            if (tags.tourism) return tags.tourism
            if (tags.leisure) return tags.leisure
            if (tags.highway) return tags.highway
            return 'unknown'
          }

          // Build address from various address components
          const buildAddress = (tags) => {
            if (tags['addr:full']) return tags['addr:full']
            
            const parts = []
            if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
            if (tags['addr:street']) parts.push(tags['addr:street'])
            if (tags['addr:city']) parts.push(tags['addr:city'])
            
            return parts.length > 0 ? parts.join(' ') : 'Address not available'
          }
          
          return {
            id: element.id,
            name: element.tags.name || element.tags.brand || 'Unnamed',
            address: buildAddress(element.tags),
            lat,
            lng,
            distance: distance ? distance.toFixed(1) : null,
            type: getDisplayType(element.tags),
            cuisine: element.tags.cuisine,
            phone: element.tags.phone,
            website: element.tags.website,
            opening_hours: element.tags.opening_hours,
            brand: element.tags.brand,
            operator: element.tags.operator,
            description: element.tags.description
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

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userLocation) {
        searchPlaces(selectedCategory, searchQuery)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, userLocation, searchPlaces])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
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
        return `Location found`
      default:
        return ''
    }
  }

  // Get icon for category
  const getCategoryIcon = (categoryId) => {
    const icons = {
      restaurant: '🍽️', cafe: '☕', fast_food: '🍔', bar: '🍺', pub: '🍻',
      hospital: '🏥', pharmacy: '💊', clinic: '🏥', dentist: '🦷',
      bank: '🏦', atm: '💳',
      fuel: '⛽', parking: '🅿️', bus_stop: '🚌',
      supermarket: '🛒', convenience: '🏪', marketplace: '🛍️',
      hotel: '🏨', guest_house: '🏡', hostel: '🏠', museum: '🏛️', viewpoint: '👁️',
      library: '📚', cinema: '🎬', theatre: '🎭',
      playground: '🛝', fitness: '💪', golf: '⛳',
      toilets: '🚻', police: '👮', fire_station: '🚒',
      place_of_worship: '⛪'
    }
    return icons[categoryId] || '📍'
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="lg:max-w-96 max-lg:h-[60%] min-h-[400px] glass-morphism m-4 rounded-2xl flex lg:flex-col flex-row max-md:flex-col overflow-hidden">
        <div className="lg:p-6 p-3 max-w-96 border-b border-white/20">
          <input
            type="text"
            placeholder="Search places..."
            className="w-full px-4 py-3 rounded-xl glass-morphism-dark placeholder-white/70 text-white outline-none focus:ring-2 focus:ring-white/30 transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
          
          <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === category.id
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{getCategoryIcon(category.id)}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-sm:p-2 p-4 space-y-3">
          {loading && (
            <div className="text-center py-10 text-white/70">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Searching {categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}...
            </div>
          )}
          
          {error && (
            <div className="text-center py-10 text-red-300">
              {error}
            </div>
          )}
          
          {!loading && !error && places.length === 0 && (
            <div className="text-center py-10 text-white/70">
              No {categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} found nearby
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
              <div className="font-semibold text-white mb-1 flex items-center gap-2">
                <span>{getCategoryIcon(selectedCategory)}</span>
                {place.name}
                {place.brand && place.brand !== place.name && (
                  <span className="text-xs text-white/60">({place.brand})</span>
                )}
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
                {place.opening_hours && (
                  <span className="px-2 py-1 bg-orange-500/30 text-orange-100 text-xs rounded-full">
                    🕐 {place.opening_hours}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative h-fit">
        <div  
          onClick={() => setSelectedPlace({'lat': userLocation?.lat, 'lng': userLocation?.lng})} 
          className={`absolute hover:cursor-pointer bottom-6 h-fit sm:top-6 right-6 z-[1000] px-4 py-2 rounded-xl glass-morphism text-white text-sm font-medium shadow-lg ${
            locationStatus === 'loading' ? 'text-blue-200' :
            locationStatus === 'error' ? 'text-red-200' : 'text-green-200'
          }`}
        >
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

// Add these CSS classes to your global styles
const styles = `
.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-morphism-dark {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
`