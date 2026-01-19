# MySecretary - Daily Report Copilot

AI-powered daily report generation using Microsoft 365 and Copilot integration. Automatically generate professional daily reports from your activity logs, calendar, emails, and Teams interactions.

## Features

- **📝 Daily Report Generation**: AI-powered report creation from activity logs
- **🤖 Copilot Integration**: Azure OpenAI-based summarization and key point extraction
- **📊 Activity Logging**: Track time spent on tasks and projects
- **📋 Project Management**: Organize and monitor multiple projects
- **📅 Microsoft 365 Integration**: Auto-sync with Outlook Calendar, Teams, and Emails
- **💾 Report Export**: Download reports in multiple formats
- **🎨 Modern UI**: Responsive React-based interface with TypeScript

## Project Structure

```
MySecretary/
├── src/
│   ├── backend/
│   │   ├── index.js                      # Main Express server
│   │   ├── copilot-integration.js        # Copilot API integration
│   │   ├── copilot-routes.js             # Copilot API endpoints
│   │   ├── microsoft-graph-integration.js # Microsoft Graph API client
│   │   ├── microsoft-graph-routes.js     # Microsoft Graph endpoints
│   │   ├── package.json                  # Dependencies
│   │   └── .env.example                  # Environment variables template
│   └── frontend/
│       ├── App.tsx                       # Main React component
│       ├── App.css                       # Styling
│       ├── index.tsx                     # Entry point
│       ├── components/
│       │   ├── DailyReportGenerator.tsx # Report generation UI
│       │   ├── ActivityLog.tsx          # Activity tracking UI
│       │   └── ProjectManager.tsx       # Project management UI
│       └── package.json                  # Dependencies
├── .env.example                          # Environment variables template
├── README.md                             # This file
└── package.*.json                        # Configuration files
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

### Environment Configuration

1. **Create `.env` file from template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Azure OpenAI (for Copilot):**
   ```env
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=deployment-name
   AI_MODEL=gpt-4
   ```

3. **Configure Microsoft Graph (optional - for M365 sync):**
   ```env
   MICROSOFT_GRAPH_TOKEN=your_graph_api_token
   ```

4. **Additional Configuration:**
   ```env
   PORT=3001
   NODE_ENV=development
   DAILY_REPORT_LANGUAGE=ja
   ```

### Azure OpenAI Setup

1. Create Azure OpenAI resource in Azure Portal
2. Deploy a gpt-4 model
3. Get API key and endpoint
4. Add to `.env` file

### Microsoft Graph Setup (Optional)

1. Register application in Azure AD
2. Grant permissions: `Calendar.Read`, `Mail.Read`, `TeamSettings.Read`
3. Obtain access token using OAuth 2.0
4. Add token to `.env` file (or configure OAuth flow in backend)

## API Endpoints

### Core Endpoints
- `GET /` - API information and available endpoints
- `GET /health` - Health check endpoint

### Activity Management
- `GET /api/activities` - List activities (with date/project filtering)
- `POST /api/activities` - Create new activity
- `GET /api/activities/:id` - Get specific activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Project Management
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project status/details

### Daily Reports
- `POST /api/reports/generate` - Generate daily report from activities
- `GET /api/reports` - List reports (with date/user filtering)
- `GET /api/reports/:id` - Get specific report

### Copilot Integration
- `POST /api/copilot/generate-report` - Generate AI-powered daily report
- `POST /api/copilot/summarize` - Summarize text using Copilot
- `POST /api/copilot/extract-key-points` - Extract key points from activities
- `GET /api/copilot/status` - Check Copilot integration status

### Microsoft Graph Integration
- `GET /api/microsoft-graph/calendar` - Fetch calendar events (query: date)
- `GET /api/microsoft-graph/emails` - Fetch recent emails (query: limit)
- `GET /api/microsoft-graph/teams` - Fetch Teams activity
- `GET /api/microsoft-graph/merged-activities` - Get merged activities from all sources
- `GET /api/microsoft-graph/status` - Check Microsoft Graph configuration

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