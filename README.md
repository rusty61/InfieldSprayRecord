# Infield Spray Record Web App

A mobile-first agricultural compliance application for capturing spray mix and application records in the field with offline PWA capabilities, GPS/weather capture, QA-compliant audit trails, and agronomist recommendation system with automated email ingestion.

## Features

- **Spray Application Recording**: Capture detailed spray mix details, paddock information, weather conditions, and GPS location
- **Tank Mix Builder**: Create and manage tank mix formulations with detailed chemical breakdown
- **GPS & Weather Integration**: Automatic location capture and weather condition logging for compliance
- **Paddock Management**: Store paddock boundaries with GPS coordinates and proximity-based auto-selection
- **PDF Export**: Generate QA-compliant PDF reports for single or batch records with email delivery via SendGrid
- **Agronomist Recommendations**: Automatically receive recommendations from agronomists via email webhook
- **Offline-First Design**: PWA capabilities with offline support and sync indicators
- **Audit Trail**: Complete record history with timestamps and user tracking
- **Dark Agricultural Theme**: Purpose-built UI with dark green (#093d2b) and golden (#fcb32c) accents for field visibility

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with Zod validation
- **Email**: SendGrid API
- **PDF Generation**: PDFKit
- **State Management**: TanStack Query v5, React Context
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (provided via Replit)
- SendGrid account (optional, for email features)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section below)

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Database Setup

Push the schema to your database:
```bash
npm run db:push
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database (automatically configured on Replit)
DATABASE_URL=your_postgresql_connection_string

# SendGrid API (required for email functionality)
SENDGRID_API_KEY=your_sendgrid_api_key

# Session secret (for user sessions)
SESSION_SECRET=your_secret_key_here
```

### Getting Your SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Spray Record App")
5. Select **Full Access** or custom permissions
6. Copy the key and add it to your `.env` file

## Agronomist Email Recommendations

### How It Works

Agronomists can send recommendations via email, which are automatically received and displayed in your application. The system:

1. Receives emails at your webhook endpoint
2. Extracts the application ID from the email subject
3. Auto-detects recommendation priority from email keywords
4. Creates and displays recommendations in the Records page

### Setting Up the Webhook

#### SendGrid Inbound Parse Setup

1. **Get Your Webhook URL**:
   - Your app's webhook endpoint: `https://your-app-url.replit.dev/api/webhook/email-recommendations`
   - For local testing: Use a tunnel service like `ngrok` to expose your local server

2. **Configure SendGrid Inbound Parse**:
   - Go to [SendGrid Dashboard](https://app.sendgrid.com/)
   - Navigate to **Settings** → **Inbound Parse**
   - Click **Add Host**
   - Enter a subdomain (e.g., `recommendations.yourdomain.com`)
   - Paste your webhook URL in the "Post the raw, full email to this URL" field
   - Click **Save**

3. **Create MX Record** (for your domain):
   - Add an MX record pointing to SendGrid's servers:
     ```
     10 mx.sendgrid.net
     ```
   - This allows emails sent to `recommendations@yourdomain.com` to be intercepted by SendGrid

### Email Format for Agronomists

Agronomists should follow this format when sending recommendations:

#### Basic Format

**To**: `recommendations@yourdomain.com`  
**Subject**: `[APPLICATION_ID] Your recommendation here` or `App-APPLICATION_ID: Your recommendation`  
**Body**: Detailed recommendation text

#### Example Emails

**High Priority (Urgent) Recommendation**:
```
To: recommendations@yourdomain.com
Subject: [550e8400-e29b-41d4-a716-446655440000] Urgent: Reduce water rate immediately

Body:
Based on recent field observations, the water rate for paddock A needs to be reduced ASAP. 
The current rate of 100L/ha is causing runoff issues. Recommend reducing to 80L/ha for optimal coverage.
Critical: Apply this change before next application session.
```

**Medium Priority Recommendation**:
```
To: recommendations@yourdomain.com
Subject: App-550e8400-e29b-41d4-a716-446655440000: Tank mix improvement suggested

Body:
Consider adding a surfactant to improve spray adhesion. 
The current mix lacks adequate spreading agent for better coverage.
Recommend adding 1L of X-77 per 100L of water.
```

**Low Priority (Informational) Recommendation**:
```
To: recommendations@yourdomain.com
Subject: [550e8400-e29b-41d4-a716-446655440000] FYI - Weather pattern update

Body:
Note: Next week's forecast shows potential rain. This is just informational - 
plan your spray schedule accordingly if needed.
```

### Email Subject Line Rules

The system extracts the application ID from your email subject. Use one of these formats:

- `[APPLICATION_ID] Your message here`
- `App-APPLICATION_ID: Your message here`
- `App-550e8400-e29b-41d4-a716-446655440000 recommendation text`

The APPLICATION_ID is a UUID or numeric ID. Check your Records page to find the correct ID.

### Priority Detection

The system automatically detects priority from email content:

| Priority | Triggered By Keywords |
|----------|----------------------|
| **High** | urgent, critical, immediately, asap |
| **Medium** | (default if no keywords match) |
| **Low** | note, fyi, informational |

### Example API Test

To test the webhook manually:

```bash
curl -X POST http://localhost:5000/api/webhook/email-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Dr. Sarah Green <sarah@agronomy.com>",
    "subject": "[550e8400-e29b-41d4-a716-446655440000] Urgent: Adjust water rate",
    "text": "Please reduce water rate immediately for optimal coverage",
    "html": "<p>Please reduce water rate immediately for optimal coverage</p>"
  }'
```

## API Endpoints

### Applications

- `GET /api/applications` - Fetch all applications
- `GET /api/applications/:id` - Fetch single application
- `POST /api/applications` - Create new application
- `PATCH /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Paddocks

- `GET /api/paddocks` - Fetch all paddocks
- `GET /api/paddocks/:id` - Fetch single paddock
- `POST /api/paddocks` - Create new paddock with boundary validation
- `PATCH /api/paddocks/:id` - Update paddock
- `DELETE /api/paddocks/:id` - Delete paddock

### Recommendations

- `GET /api/applications/:id/recommendations` - Fetch recommendations for an application
- `POST /api/applications/:id/recommendations` - Create recommendation manually
- `POST /api/webhook/email-recommendations` - Receive recommendations via SendGrid webhook

### PDF Export

- `POST /api/applications/:id/export-pdf` - Export single record as PDF
- `POST /api/applications/batch/export-pdf` - Batch export multiple records as PDF

## PDF Export & Email

### Single Record Export

```bash
curl -X POST http://localhost:5000/api/applications/550e8400/export-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farm@example.com"
  }'
```

### Batch Export

```bash
curl -X POST http://localhost:5000/api/applications/batch/export-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "applicationIds": ["550e8400", "550e8400"],
    "email": "farm@example.com"
  }'
```

Both endpoints require:
- Valid application ID(s)
- Email address for delivery
- `SENDGRID_API_KEY` environment variable set

## Development

### Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/          # Page components (Dashboard, Records, etc.)
│   │   ├── components/     # UI components
│   │   ├── lib/            # Utilities and query client
│   │   ├── hooks/          # Custom React hooks
│   │   └── index.css       # Global styles with dark theme
│   └── index.html
├── server/
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   ├── pdf-generator.ts    # PDF generation for single records
│   ├── pdf-generator-batch.ts  # Batch PDF generation
│   └── vite.ts             # Vite middleware integration
├── shared/
│   └── schema.ts           # Drizzle ORM schema and Zod types
└── migrations/             # Database migrations
```

### Database Schema

**Applications Table**:
- `id` (UUID primary key)
- `paddockId` (FK to paddocks)
- `farm` (text)
- `operator` (text)
- `sprayDate` (date)
- `latitude`, `longitude` (GPS coordinates)
- `windSpeed`, `temperature`, `humidity` (weather)
- `tankMixDetails` (JSON)
- `createdAt`, `updatedAt` (timestamps)

**Paddocks Table**:
- `id` (UUID primary key)
- `name` (text)
- `area` (decimal - hectares)
- `boundaryCoordinates` (JSON array of {lat, lng} points)
- `centerLatitude`, `centerLongitude` (for proximity searches)

**Recommendations Table**:
- `id` (UUID primary key)
- `applicationId` (FK to applications)
- `agronomer` (text)
- `recommendation` (text)
- `priority` (enum: low, medium, high)
- `createdAt` (timestamp)

### Running Tests

```bash
npm run check   # TypeScript type checking
```

## Building for Production

### Build

```bash
npm run build
```

This will:
1. Build the frontend with Vite
2. Bundle the backend with esbuild
3. Output to `dist/` directory

### Start Production Server

```bash
npm start
```

## Deployment

### Deploy to Replit

Click the "Publish" button in Replit to deploy your application. This will:
- Build the application
- Deploy to a `.replit.dev` domain
- Set up TLS/HTTPS automatically
- Provide health checks and monitoring

### Important: Add Your Domain's MX Record

After deployment, update your domain's MX record to enable SendGrid inbound email:

```
Priority: 10
Host: mx.sendgrid.net
```

This allows agronomists' recommendation emails to reach your webhook.

## Troubleshooting

### Emails Not Received

1. **Check webhook URL**: Verify that SendGrid has the correct webhook URL
2. **Check MX records**: Ensure your domain's MX records point to SendGrid
3. **Test webhook manually**: Use curl to test the endpoint (see API Endpoints section)
4. **Check logs**: Review your application logs for webhook errors

### PDF Generation Issues

1. **Missing SendGrid Key**: Ensure `SENDGRID_API_KEY` is set in environment variables
2. **Invalid Email**: Verify the email address format is correct
3. **File Size**: Large PDFs may take longer - check server logs for timeouts

### Database Connection Issues

1. **Verify DATABASE_URL**: Check that the connection string is correct
2. **Run migrations**: Execute `npm run db:push` to ensure schema is up to date
3. **Check Neon status**: If using Neon, verify the database is active and not suspended

## Performance Considerations

- **Geolocation**: Uses high accuracy mode with 10-second timeout
- **Batch PDFs**: Generate up to 50 records per batch for optimal performance
- **Email Limits**: SendGrid rate limits apply (consult their documentation for your plan)
- **Offline Sync**: PWA syncs automatically when connection restored

## Security

- Sensitive data (passwords, API keys) stored securely
- HTTPS/TLS enforced for all connections
- CSRF protection on all forms
- Input validation on all endpoints
- Environment variables for secrets (never commit to git)

## License

MIT

## Support

For issues or feature requests, contact the development team or check the application logs for detailed error messages.

---

**Last Updated**: November 2025  
**Version**: 1.0.0
