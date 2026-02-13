# Weather Platform

A Node.js-based weather monitoring platform that fetches, stores, and provides weather data for multiple locations with automatic synchronization.

## Features

- **Multi-location Weather Tracking**: Add and monitor weather conditions for multiple locations
- **Automatic Synchronization**: Periodic weather data updates (configurable interval)
- **Historical Data**: Store and retrieve weather history for analysis
- **RESTful API**: Clean API for location and weather management
- **MongoDB Storage**: Persistent storage with Mongoose ODM
- **Weather API Integration**: Built-in support for OpenWeatherMap API

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **HTTP Client**: Axios
- **Environment Variables**: dotenv

## Project Structure

```
server/
├── src/
│   ├── server.js          # Application entry point
│   ├── app.js             # Express app configuration
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/
│   │   ├── Location.js           # Location schema
│   │   ├── WeatherSnapshot.js     # Weather data schema
│   │   └── UserPreference.js      # User settings schema
│   ├── routes/
│   │   └── locationRoutes.js      # Location API routes
│   ├── controllers/
│   │   └── locationController.js  # Location business logic
│   ├── services/
│   │   └── weatherService.js      # Weather API integration
│   └── sync/
│       └── syncService.js         # Periodic sync scheduler
├── database/
│   └── mongo-setup.md      # MongoDB setup guide
├── tests/
├── .env.example            # Environment template
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sanna-weather-Dash
   ```

2. **Navigate to server directory**
   ```bash
   cd server
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

5. **Edit .env file**

   Open `.env` in a text editor and update the following variables:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/weather-platform

   # Weather API Configuration
   WEATHER_API_KEY=your_openweathermap_api_key
   WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
   WEATHER_API_FORECAST_URL=https://api.openweathermap.org/data/2.5
   WEATHER_API_GEOCODING_URL=https://api.openweathermap.org/geo/1.0

   # Sync Service Configuration
   SYNC_INTERVAL_MINUTES=15
   ```

   **Important:** You must replace `your_openweathermap_api_key` with a valid OpenWeatherMap API key.

6. **Set up MongoDB**

   **Option A: Local MongoDB**
   - Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Start MongoDB service:
     - Windows: `net start MongoDB` (or use MongoDB Compass)
     - macOS: `brew services start mongodb-community`
     - Linux: `sudo systemctl start mongod`
   - Default connection: `mongodb://localhost:27017/weather-platform`

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and database
   - Get your connection string
   - Replace `MONGODB_URI` in `.env` with your Atlas connection string

   See [database/mongo-setup.md](database/mongo-setup.md) for detailed MongoDB setup instructions.

7. **Get an OpenWeatherMap API Key**

   - Sign up for free at [OpenWeatherMap](https://openweathermap.org/api)
   - Navigate to "My API Keys"
   - Copy your API key and paste it in the `.env` file as `WEATHER_API_KEY`

8. **Start the server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`

## API Endpoints

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get all locations |
| GET | `/api/locations?isActive=true` | Get active locations only |
| GET | `/api/locations/:id` | Get location by ID |
| GET | `/api/locations/search?q=query` | Search locations |
| POST | `/api/locations` | Create new location |
| PUT | `/api/locations/:id` | Update location |
| DELETE | `/api/locations/:id` | Delete location |

### Weather

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/:id/weather` | Get latest weather for location |
| GET | `/api/locations/:id/weather/history?startDate=...&endDate=...` | Get weather history |
| POST | `/api/locations/:id/weather/refresh` | Force weather refresh |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Example Usage

### Create a Location

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New York",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York"
  }'
```

### Get Current Weather

```bash
curl http://localhost:3000/api/locations/:locationId/weather
```

### Get Weather History

```bash
curl "http://localhost:3000/api/locations/:locationId/weather/history?startDate=2024-01-01&endDate=2024-01-31"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/weather-platform |
| `WEATHER_API_KEY` | OpenWeatherMap API key | - |
| `WEATHER_API_BASE_URL` | Current weather API URL | https://api.openweathermap.org/data/2.5 |
| `WEATHER_API_FORECAST_URL` | Forecast API URL | https://api.openweathermap.org/data/2.5 |
| `WEATHER_API_GEOCODING_URL` | Geocoding API URL | https://api.openweathermap.org/geo/1.0 |
| `SYNC_INTERVAL_MINUTES` | Sync interval in minutes | 15 |

## Development

```bash
# Install dev dependencies
npm install --save-dev nodemon jest supertest

# Run in development mode with hot reload
npm run dev

# Run tests
npm test
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## License

ISC
