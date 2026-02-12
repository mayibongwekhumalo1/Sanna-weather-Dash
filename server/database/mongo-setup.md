# MongoDB Setup for Weather Platform

## Prerequisites

- MongoDB 6.0 or higher
- Node.js 18+ 
- npm or yarn

## Installation Options

### Option 1: Local MongoDB Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the appropriate version for your OS
   - Run the installer

2. **Start MongoDB Service**

   **Windows (using mongod.exe):**
   ```cmd
   mongod --dbpath "C:\data\db"
   ```

   **macOS/Linux (using mongod):**
   ```bash
   mongod --dbpath /data/db
   ```

3. **Verify Installation**
   ```bash
   mongosh
   > db.version()
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/atlas
   - Click "Try Free" and create account

2. **Create Cluster**
   - Select "Create Cluster"
   - Choose free tier options
   - Wait for cluster deployment (~5 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Note credentials for .env file

4. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allow all) or your specific IP

5. **Get Connection String**
   - Go to "Database" > "Connect"
   - Select "Connect your application"
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/weather-platform?retryWrites=true&w=majority
     ```

### Option 3: Docker

1. **Pull MongoDB Image**
   ```bash
   docker pull mongo:latest
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -v mongodb_data:/data/db \
     mongo:latest
   ```

3. **Verify**
   ```bash
   docker exec -it mongodb mongosh
   ```

## Configuration

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env File**
   ```env
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/weather-platform

   # OR MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/weather-platform
   ```

## Schema Overview

### Location Schema
```javascript
{
  name: String,          // Location name (required)
  country: String,       // Country name (required)
  latitude: Number,      // Latitude -90 to 90 (required)
  longitude: Number,     // Longitude -180 to 180 (required)
  timezone: String,      // Timezone (default: UTC)
  isActive: Boolean,     // Active for syncing (default: true)
  createdAt: Date,
  updatedAt: Date
}
```

### WeatherSnapshot Schema
```javascript
{
  location: ObjectId,    // Reference to Location
  temperature: {
    current: Number,
    feelsLike: Number,
    min: Number,
    max: Number
  },
  humidity: Number,      // 0-100
  pressure: Number,
  wind: {
    speed: Number,
    direction: Number,
    gust: Number
  },
  visibility: Number,
  clouds: Number,        // 0-100
  weather: {
    main: String,
    description: String,
    icon: String
  },
  sunrise: Date,
  sunset: Date,
  fetchedAt: Date,
  apiSource: String
}
```

### UserPreference Schema
```javascript
{
  userId: String,        // Unique user identifier
  preferredUnits: {
    temperature: String, // 'metric' or 'imperial'
    windSpeed: String,   // 'metric' or 'imperial'
    pressure: String    // 'hPa' or 'inHg'
  },
  favoriteLocations: [ObjectId],  // References to Location
  notifications: {
    enabled: Boolean,
    severeWeather: Boolean,
    dailyForecast: Boolean
  },
  displaySettings: {
    language: String,
    theme: String       // 'light', 'dark', 'auto'
  }
}
```

## Indexes

- `Location`: Compound index on `(latitude, longitude)` unique
- `Location`: Index on `(name, country)`
- `WeatherSnapshot`: Compound index on `(location, fetchedAt)` for history queries
- `WeatherSnapshot`: TTL index (30 days) for automatic old data cleanup

## Useful Commands

### Connect to MongoDB Shell
```bash
mongosh weather-platform
```

### Show Collections
```javascript
> show collections
locations
weathersnapshots
userpreferences
```

### Query Examples
```javascript
// Get all active locations
db.locations.find({ isActive: true })

// Get weather history for a location
db.weathersnapshots
  .find({ location: ObjectId("...") })
  .sort({ fetchedAt: -1 })
  .limit(10)

// Delete old snapshots (older than 30 days)
db.weathersnapshots.deleteMany({
  fetchedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
```

## Performance Tips

1. **Create Indexes** (if not using TTL)
   ```javascript
   db.locations.createIndex({ latitude: 1, longitude: 1 }, { unique: true })
   db.weathersnapshots.createIndex({ location: 1, fetchedAt: -1 })
   ```

2. **Monitor Query Performance**
   ```javascript
   db.weathersnapshots.find({ location: ObjectId("...") }).explain("executionStats")
   ```

3. **Use Connection Pooling**
   - Mongoose handles this automatically (default pool size: 100)
