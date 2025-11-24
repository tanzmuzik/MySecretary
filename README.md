# MySecretary

A task management application with Microsoft Teams integration built with React and Node.js, plus a desktop analog clock widget for Windows 11.

## Features

### Task Management App
- **Task Management**: Create, update, and track tasks
- **Microsoft Teams Integration**: Sync with Teams channels and notifications
- **Real-time Updates**: Stay connected with your team
- **Modern UI**: Clean and intuitive React-based interface

### Analog Clock Widget
- **Windows 11 Desktop Widget**: Beautiful analog clock with transparent background
- **Always On Top**: Stays visible above all other windows
- **Draggable**: Position anywhere on your desktop
- **Theme Support**: Switch between transparent, light, and dark themes
- **Smooth Animation**: Fluid second hand movement

## Project Structure

```
MySecretary/
├── backend/           # Node.js Express API server
│   ├── index.js      # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env.example  # Environment variables template
├── frontend/         # React TypeScript application
│   ├── src/         # React source code
│   ├── public/      # Static assets
│   ├── package.json # Frontend dependencies
│   └── tsconfig.json # TypeScript configuration
├── clock-widget/    # Windows 11 Analog Clock Widget (Electron)
│   ├── main.js      # Electron main process
│   ├── index.html   # Clock UI
│   ├── style.css    # Styling with transparency
│   ├── clock.js     # Clock logic
│   ├── package.json # Widget dependencies
│   └── README.md    # Widget documentation
└── README.md        # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Microsoft Azure account (for Teams integration)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd MySecretary
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables:**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your Azure/Teams credentials
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```
   The React app will open at `http://localhost:3000`

### Microsoft Teams Integration Setup

1. Register your application in Azure Active Directory
2. Configure the required permissions for Microsoft Graph API
3. Update the `.env` file with your Azure credentials
4. Follow the Microsoft Teams app development guide for additional setup

### Running the Clock Widget

1. **Install clock widget dependencies:**
   ```bash
   cd clock-widget
   npm install
   ```

2. **Start the clock widget:**
   ```bash
   npm start
   ```

3. **Build Windows executable (optional):**
   ```bash
   npm run build:win
   ```

For detailed clock widget documentation, see [clock-widget/README.md](clock-widget/README.md)

## API Endpoints

- `GET /` - API information and available endpoints
- `GET /health` - Health check endpoint
- `GET /api/tasks` - Task management endpoint
- `GET /api/teams` - Microsoft Teams integration endpoint

## Technologies Used

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Node.js, Express.js
- **Microsoft Integration**: Microsoft Graph API, MSAL (Microsoft Authentication Library)
- **Development**: nodemon, React Scripts

## Development

- Backend runs on port 3001
- Frontend runs on port 3000
- Hot reloading enabled for both frontend and backend
- TypeScript support for type safety

## License

ISC