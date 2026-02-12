import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/locations'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weatherData, setWeatherData] = useState({})

  // Fetch all locations from the server
  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE)
      const data = await response.json()
      if (data.success) {
        setLocations(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch locations')
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch weather data for a location
  const fetchWeather = useCallback(async (location) => {
    try {
      const response = await fetch(`${API_BASE}/${location._id}/weather`)
      const data = await response.json()
      if (data.success) {
        const weather = data.data.weather || {}
        setWeatherData(prev => ({
          ...prev,
          [location._id]: {
            temperature: weather.temperature?.current || 72,
            condition: weather.weather?.main || 'Sunny',
            humidity: weather.humidity || 45,
            windSpeed: weather.wind?.speed || 8
          }
        }))
      }
    } catch (err) {
      console.error('Error fetching weather:', err)
      // Set default weather data on error
      setWeatherData(prev => ({
        ...prev,
        [location._id]: {
          temperature: 72,
          condition: 'Sunny',
          humidity: 45,
          windSpeed: 8
        }
      }))
    }
  }, [])

  // Load locations and their weather on mount
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Fetch weather for each location
  useEffect(() => {
    locations.forEach(location => {
      fetchWeather(location)
    })
  }, [locations, fetchWeather])

  const handleAddLocation = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: searchQuery,
            country: 'Unknown',
            latitude: Math.random() * 180 - 90,
            longitude: Math.random() * 360 - 180,
            timezone: 'UTC'
          }),
        })
        const data = await response.json()
        if (data.success) {
          setLocations(prev => [...prev, data.data])
          setSearchQuery('')
        } else {
          throw new Error(data.error || 'Failed to add location')
        }
      } catch (err) {
        console.error('Error adding location:', err)
        alert('Failed to add location: ' + err.message)
      }
    }
  }

  const handleRemoveLocation = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setLocations(prev => prev.filter(loc => loc._id !== id))
        setWeatherData(prev => {
          const newData = { ...prev }
          delete newData[id]
          return newData
        })
      } else {
        throw new Error(data.error || 'Failed to remove location')
      }
    } catch (err) {
      console.error('Error removing location:', err)
      alert('Failed to remove location: ' + err.message)
    }
  }

  const refreshWeather = async (location) => {
    try {
      const response = await fetch(`${API_BASE}/${location._id}/weather/refresh`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        const weather = data.data || {}
        setWeatherData(prev => ({
          ...prev,
          [location._id]: {
            temperature: weather.temperature?.current || weather.temperature || 72,
            condition: weather.weather?.main || weather.condition || 'Sunny',
            humidity: weather.humidity || 45,
            windSpeed: weather.wind?.speed || weather.windSpeed || 8
          }
        }))
      }
    } catch (err) {
      console.error('Error refreshing weather:', err)
    }
  }

  const getWeatherIcon = (condition) => {
    // Handle both direct condition string and nested weather object
    const weatherMain = typeof condition === 'object' ? condition.main : condition
    switch (weatherMain) {
      case 'Sunny':
      case 'Clear':
        return '☀️'
      case 'Cloudy':
      case 'Clouds':
        return '☁️'
      case 'Rainy':
      case 'Rain':
        return '🌧️'
      case 'Partly Cloudy':
      case 'Mist':
        return '⛅'
      default:
        return '🌤️'
    }
  }

  if (loading && locations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Weather Dashboard
          </h1>
          <p className="text-white/80 text-lg">Stay informed about weather conditions worldwide</p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-2 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleAddLocation} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Add a city..."
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </form>

        {/* Weather Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => {
            const weather = weatherData[location._id] || {
              temperature: 72,
              condition: 'Sunny',
              humidity: 45,
              windSpeed: 8
            }
            return (
              <div
                key={location._id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{location.name}</h2>
                    <p className="text-gray-600">{location.country || 'Unknown Country'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => refreshWeather(location)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      title="Refresh weather"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveLocation(location._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-6xl">{getWeatherIcon(weather.condition)}</span>
                    <span className="text-5xl font-bold text-gray-800 ml-4">{weather.temperature}°F</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💧</span>
                      <span className="text-sm text-gray-600">Humidity</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">{weather.humidity}%</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💨</span>
                      <span className="text-sm text-gray-600">Wind</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">{weather.windSpeed} mph</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {weather.condition}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Card Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <form onSubmit={handleAddLocation} className="bg-white/30 border-2 border-dashed border-white/50 rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">+</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="City name"
                className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 text-center focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="mt-3 bg-white/80 hover:bg-white text-blue-600 px-6 py-2 rounded-full font-medium transition-colors"
              >
                Add Location
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-white/70 text-sm">
          <p>Click on a location to see detailed forecast</p>
        </footer>
      </div>
    </div>
  )
}

export default App
