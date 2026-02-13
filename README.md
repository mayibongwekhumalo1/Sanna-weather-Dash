# Sanna Weather Dashboard

A full-stack weather monitoring platform built with React, Node.js, Express, and MongoDB. Track weather conditions for multiple locations worldwide with automatic synchronization and 5-day forecasts.

![Weather Dashboard](https://via.placeholder.com/800x400?text=Weather+Dashboard)

## 🌟 Features

### Core Functionality
- **Multi-Location Tracking**: Add and monitor weather conditions for cities around the world
- **Real-Time Weather Data**: Current temperature, humidity, wind speed, and weather conditions
- **5-Day Forecast**: Extended weather predictions with daily breakdowns
- **Automatic Synchronization**: Periodic weather data updates (configurable interval)
- **Historical Data**: Store and retrieve weather history for analysis

### Frontend (React + Vite)
- Modern, responsive UI with Tailwind CSS
- Interactive weather cards with detailed metrics
- Forecast modal for 5-day predictions
- Search functionality to add new locations
- Real-time weather refresh capability
- Clean, elegant design with smooth transitions

### Backend (Node.js + Express)
- RESTful API architecture
- MongoDB database with Mongoose ODM
- OpenWeatherMap API integration
- CORS support for cross-origin requests
- Graceful shutdown handling
- Comprehensive error handling

## 🏗️ Architecture

```
Sanna-Weather-Dash/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # Application entry point
│   │   └── index.css      # Global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Node.js backend API
│   ├── src/
│   │   ├── app.js         # Express app configuration
│   │   ├── server.js      # Server entry point
│   │   ├── config/
│   │   │   └── db.js      # MongoDB connection
│   │   ├── models/
│   │   │   ├── Location.js         # Location schema
│   │   │   ├── WeatherSnapshot.js   # Weather data schema
│   │   │   └── UserPreference.js    # User settings schema
│   │   ├── routes/
│   │   │   └── locationRoutes.js   # Location API routes
│   │   ├── controllers/
│   │   │   └── locationController.js # Location business logic
│   │   ├── services/
│   │   │   └── weatherService.js    # Weather API integration
│   │   └── sync/
│   │       └── syncService.js       # Periodic sync scheduler
│   ├── database/
│   ├── tests/
│   └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sanna-weather-Dash
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env  # If applicable
   ```

4. **Configure environment variables**

   **Server (.env)**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/weather-platform
   WEATHER_API_KEY=your_openweathermap_api_key
   WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
   WEATHER_API_FORECAST_URL=https://api.openweathermap.org/data/2.5
   SYNC_INTERVAL_MINUTES=15
   ```

   **Client (.env)**
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/locations
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application**

   **Terminal 1 - Backend**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 📡 API Endpoints

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
| GET | `/api/locations/:id/forecast` | Get 5-day forecast for location |
| GET | `/api/locations/:id/weather/history` | Get weather history |
| POST | `/api/locations/:id/weather/refresh` | Force weather refresh |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status with sync stats |

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client
- **ESLint** - Code linting

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM library
- **Axios** - HTTP client for API calls
- **Jest** - Testing framework

## 📦 Key Dependencies

### Server
```json
{
  "axios": "^1.13.5",
  "cors": "^2.8.6",
  "dotenv": "^17.2.4",
  "express": "^5.2.1",
  "mongoose": "^9.2.1"
}
```

### Client
```json
{
  "axios": "^1.13.5",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwindcss": "^4.1.18",
  "vite": "^7.3.1"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/weather-platform |
| `WEATHER_API_KEY` | OpenWeatherMap API key | - |
| `WEATHER_API_BASE_URL` | Weather API base URL | https://api.openweathermap.org/data/2.5 |
| `WEATHER_API_FORECAST_URL` | Forecast API base URL | https://api.openweathermap.org/data/2.5 |
| `SYNC_INTERVAL_MINUTES` | Sync interval in minutes | 15 |
| `VITE_API_BASE_URL` | Frontend API base URL | http://localhost:3000/api/locations |

### MongoDB Setup

For detailed MongoDB setup instructions, see [server/database/mongo-setup.md](server/database/mongo-setup.md).

## 🧪 Testing

### Run Server Tests
```bash
cd server
npm test
npm test -- --coverage
```

### Linting (Client)
```bash
cd client
npm run lint
```

## 🚢 Deployment

### Render Deployment
The application is configured for deployment on Render:
- Backend: https://sanna-weather-api.onrender.com
- Frontend: https://sanna-weather-dash.vercel.app

See [server/RENDER_DEPLOYMENT.md](server/RENDER_DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Data Models

### Location Schema
```javascript
{
  name: String,          // City name (required)
  country: String,       // Country name (required)
  latitude: Number,      // Latitude (-90 to 90)
  longitude: Number,     // Longitude (-180 to 180)
  timezone: String,      // Timezone (default: UTC)
  isActive: Boolean,     // Active status (default: true)
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

### Weather Snapshot Schema
```javascript
{
  location: ObjectId,    // Reference to Location
  temperature: {
    current: Number,
    feelsLike: Number,
    min: Number,
    max: Number
  },
  humidity: Number,
  pressure: Number,
  wind: {
    speed: Number,
    direction: Number,
    gust: Number
  },
  weather: {
    main: String,
    description: String,
    icon: String
  },
  fetchedAt: Date        // When data was fetched
}
```

## 🔒 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Weather Cards**: Display current conditions with icons
- **Forecast Modal**: Detailed 5-day forecast view
- **Refresh Button**: Update weather data on demand
- **Delete Functionality**: Remove locations from dashboard
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: User-friendly error messages

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and feature requests, please open a GitHub issue.

---

Built with ❤️ using React, Node.js, Express, and MongoDB
