# VenueOne

Stadium concession ordering platform for Riverside Arena — Fan ordering, Staff fulfillment, Runner dispatch, and GM Analytics.

**Repository:** [github.com/smacgruder-web/VenueOne](https://github.com/smacgruder-web/VenueOne)

## Features

- **Fan Ordering**: Self-service ordering system with real-time status tracking
- **Staff Management**: Kitchen staff view with order progression (received → preparing → ready)
- **Runner App**: Delivery runner interface for claiming and delivering orders
- **Analytics**: GM dashboard with revenue tracking and performance metrics
- **Print Reports**: Generate PDF reports for event management

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS-in-JS (styled objects)
- **Storage**: LocalStorage with optional cloud backup
- **Audio**: Web Audio API for notifications

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview built application
npm run preview
```

## Configuration

The application uses several configuration files:

### Environment Variables
Copy `.env.example` to `.env` and update as needed:
- `PORT`: Server port (default: 3000)
- `STORAGE_KEY`: LocalStorage key for the venue ledger
- `STORAGE_SHARED`: Whether storage should be shared across sessions

### Configuration Files
- `src/config/app-config.ts`: Application-wide settings and feature flags
- `src/config/api-config.ts`: API endpoint configurations
- `src/config/storage-config.ts`: Storage configuration

## Project Structure

```
VenueOne/
├── src/
│   ├── components/    # UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── views/         # Page views
│   ├── types/         # Type definitions
│   └── config/        # Configuration files
├── branding/           # Brand assets
├── docs/               # Documentation
└── VenueOne.jsx       # Main application component
```

## Running the Application

1. Ensure Node.js 18+ is installed
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to `http://localhost:5173`

## Development Notes

This application uses React's Context API and custom hooks for state management. All order data is stored client-side in LocalStorage by default, but can be backed up to Google Cloud Storage when configured.

The application simulates real restaurant operations with auto-progress timers for kitchen and delivery workflows.

## License

MIT