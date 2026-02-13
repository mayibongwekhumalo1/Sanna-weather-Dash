import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/locations'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weatherData, setWeatherData] = useState({})
  const [forecastData, setForecastData] = useState({})
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForecast, setShowForecast] = useState(false)

  // Fetch all locations fom the server
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

  // Fetch weather data for a loction
  const fetchWeather = useCallback(async (location) => {
    try {
      const response = await fetch(`${API_BASE}/${location._id}/weather`)
      const data = await response.json()
      if (data.success) {
        const weather = data.data.weather || {}
        setWeatherData(prev => ({
          ...prev,
          [location._id]: {
            temperature: weather.temperature?.current || 22,
            condition: weather.weather?.main || 'Sunny',
            humidity: weather.humidity || 45,
            windSpeed: weather.wind?.speed || 8
          }
        }))
      }
    } catch (err) {
      console.error('Error fetching weather:', err)
      // Set default weather data on err
      setWeatherData(prev => ({
        ...prev,
        [location._id]: {
          temperature: 22,
          humidity: 45,
          windSpeed: 8
        }
      }))
    }
  }, [])

  // Fetch 5-day forecast for a location
  const fetchForecast = useCallback(async (location) => {
    try {
      const response = await fetch(`${API_BASE}/${location._id}/forecast`)
      const data = await response.json()
      if (data.success) {
        setForecastData(prev => ({
          ...prev,
          [location._id]: data.data.forecast
        }))
      }
    } catch (err) {
      console.error('Error fetching forecast:', err)
    }
  }, [])

  // Handle card click to show forecast
  const handleCardClick = (location) => {
    setSelectedLocation(location)
    setShowForecast(true)
    fetchForecast(location)
  }

  // Close forecast modal
  const closeForecast = () => {
    setShowForecast(false)
    setSelectedLocation(null)
  }

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
            temperature: weather.temperature?.current || weather.temperature || 22,
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

  const getWeatherConditionClass = (condition) => {
    const weatherMain = typeof condition === 'object' ? condition.main : condition
    switch (weatherMain) {
      case 'Sunny':
      case 'Clear':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Cloudy':
      case 'Clouds':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Rainy':
      case 'Rain':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'Partly Cloudy':
      case 'Mist':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  if (loading && locations.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-serif text-lg tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 font-serif">
      {/* Decorative Header */}
      <div className="bg-stone-800 text-stone-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px bg-amber-600"></div>
              <span className="text-amber-600 text-xs tracking-[0.3em] uppercase">Established</span>
              <div className="w-12 h-px bg-amber-600"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Weather Dashboard
            </h1>
            <p className="text-stone-400 text-lg font-light tracking-wide">
              Global Weather Conditions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-sm mb-8">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-12">
          <div className="bg-white border border-stone-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
              <span className="text-stone-600 text-sm tracking-wider uppercase">Add Location</span>
            </div>
            <form onSubmit={handleAddLocation} className="max-w-lg">
              <div className="flex gap-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city name..."
                  className="flex-1 px-5 py-3 bg-stone-50 border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all font-light"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium tracking-wide transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Weather Cards Grid */}
        {locations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-stone-300"></div>
              <span className="text-stone-500 text-sm tracking-[0.2em] uppercase">Your Locations</span>
              <div className="flex-1 h-px bg-stone-300"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => {
                const weather = weatherData[location._id] || {
                  temperature: 22,
                  condition: 'Sunny',
                  humidity: 45,
                  windSpeed: 8
                }
                return (
                  <div
                    key={location._id}
                    onClick={() => handleCardClick(location)}
                    className="bg-white border border-stone-200 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-stone-800 tracking-tight">{location.name}</h2>
                        <p className="text-stone-500 text-sm font-light tracking-wide">{location.country || 'Unknown Country'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => refreshWeather(location)}
                          className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                          title="Refresh weather"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveLocation(location._id)}
                          className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Weather Display */}
                    <div className="px-6 py-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <span className="text-5xl">{getWeatherIcon(weather.condition)}</span>
                          <div className="ml-4">
                            <span className="text-5xl font-light text-stone-800">{weather.temperature}°</span>
                            <span className="text-stone-500 text-lg ml-1">C</span>
                          </div>
                        </div>
                      </div>

                      {/* Weather Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 border border-stone-100 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            <span className="text-xs text-stone-500 uppercase tracking-wider">Humidity</span>
                          </div>
                          <p className="text-lg font-medium text-stone-700">{weather.humidity}%</p>
                        </div>
                        <div className="bg-stone-50 border border-stone-100 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="text-xs text-stone-500 uppercase tracking-wider">Wind</span>
                          </div>
                          <p className="text-lg font-medium text-stone-700">{weather.windSpeed} m/s</p>
                        </div>
                      </div>

                      {/* Condition Badge */}
                      <div className="mt-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getWeatherConditionClass(weather.condition)}`}>
                          {weather.condition}
                        </span>
                      </div>

                      {/* View 5-Day Forecast Button */}
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <button
                          className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-50 transition-colors rounded-sm border border-transparent hover:border-stone-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCardClick(location)
                          }}
                        >
                          View 5-Day Forecast →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Card Placeholder */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone-300"></div>
            <span className="text-stone-500 text-sm tracking-[0.2em] uppercase">Quick Add</span>
            <div className="flex-1 h-px bg-stone-300"></div>
          </div>
          <form onSubmit={handleAddLocation} className="bg-white border border-dashed border-stone-300 rounded-sm p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="City name"
                className="w-full md:w-64 px-4 py-2 bg-stone-50 border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 text-center"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium tracking-wide transition-all duration-300"
              >
                Add Location
              </button>
            </div>
          </form>
        </div>

        {/* 5-Day Forecast Modal */}
        {showForecast && selectedLocation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeForecast}>
            <div 
              className="bg-white rounded-sm shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
                <div>
                  <h2 className="text-xl font-semibold text-stone-800">
                    5-Day Forecast - {selectedLocation.name}
                  </h2>
                  <p className="text-stone-500 text-sm">{selectedLocation.country || 'Unknown Country'}</p>
                </div>
                <button
                  onClick={closeForecast}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {forecastData[selectedLocation._id]?.forecast ? (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    {forecastData[selectedLocation._id].forecast.slice(0, 5).map((day, index) => {
                      const date = new Date(day.date)
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      const temp = day.temperature?.max || 22
                      const condition = day.weather?.main || 'Sunny'
                      const humidity = day.humidity || 45
                      
                      return (
                        <div 
                          key={index}
                          className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center hover:shadow-md transition-shadow"
                        >
                          <p className="text-sm font-medium text-stone-700 mb-2">{dayName}</p>
                          <span className="text-3xl block mb-2">{getWeatherIcon(condition)}</span>
                          <p className="text-2xl font-light text-stone-800">{temp}°C</p>
                          <p className="text-xs text-stone-500 mt-2 capitalize">{condition.toLowerCase()}</p>
                          <div className="mt-3 pt-3 border-t border-stone-200">
                            <p className="text-xs text-stone-500">Humidity: {humidity}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-600">Loading forecast...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-20 h-px bg-stone-300"></div>
            <span className="text-stone-400 text-xs tracking-[0.2em] uppercase">Weather Dashboard</span>
            <div className="w-20 h-px bg-stone-300"></div>
          </div>
          <p className="mt-4 text-stone-500 text-sm font-light">Classic weather monitoring for the discerning observer</p>
        </footer>
      </div>
    </div>
  )
}

export default App
