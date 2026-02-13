# Weather Dashboard - Client

A React-based frontend for the Weather Dashboard application.

## Prerequisites

- **Node.js**: Version 18 or higher is required
- **npm**: Comes bundled with Node.js
- **Weather Platform Server**: Must be running (see server/README.md)

## Installation

1. **Navigate to the client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `client` directory with the following variables:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000/api/locations
   ```

   - `VITE_API_BASE_URL`: The base URL of the Weather Platform API server
   - Default: `http://localhost:3000/api/locations` (when running locally)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |

## Project Structure

```
client/
├── public/             # Static assets
├── src/
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   ├── index.css       # Global styles
│   ├── App.css        # Component-specific styles
│   └── assets/        # Imported assets
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── .env               # Environment variables (not committed)
├── .env.example       # Environment variable template
├── package.json       # Project dependencies
└── README.md          # This file
```

## Connecting to the Server

The client communicates with the Weather Platform server. Ensure:

1. The server is running on `http://localhost:3000` (or update `VITE_API_BASE_URL`)
2. MongoDB is running (required by the server)
3. The OpenWeatherMap API key is configured in the server's `.env` file

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Ensure the server is running
- Check that `VITE_API_BASE_URL` matches the server's URL and port

### Connection Refused

If the client cannot connect to the server:
- Verify the server is running with `npm start` in the `server` directory
- Check that the server port (default 3000) matches your `.env` configuration

### API Key Issues

If weather data fails to load:
- Ensure the server has a valid `WEATHER_API_KEY` in its `.env` file
- Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework
