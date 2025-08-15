# FC Tinder - Vercel Deployment Guide

This project is configured for deployment on Vercel with a React frontend and Node.js backend.

## Project Structure

- **Frontend**: Located in `/front` directory, runs on port 3002 in development
- **Backend**: Located in root directory, runs on port 3000 in development
- **API**: Vercel-compatible API handlers in `/api` directory

## Deployment Steps

### 1. Prerequisites

- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository connected to Vercel

### 2. Environment Variables

Set the following environment variables in your Vercel dashboard:

```bash
NODE_ENV=production
CSV_DIR=good csvs
```

If you're using OpenAI or Anthropic APIs, also set:
```bash
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Deploy to Vercel

#### Option 1: Using Vercel CLI
```bash
# Install dependencies
npm install
cd front && npm install && cd ..

# Deploy
vercel --prod
```

#### Option 2: Using Git Integration
1. Connect your repository to Vercel
2. Push to your main branch
3. Vercel will automatically deploy

### 4. Build Configuration

The project uses these build commands:
- **Root**: `npm run vercel-build` (builds both frontend and backend)
- **Frontend**: `npm run build` (Vite build)
- **Backend**: Handled by Vercel's Node.js runtime

### 5. API Routes

All backend routes are available at:
- `/health` - Health check
- `/courses` - Course data
- `/sections` - Section data
- `/faculties` - Faculty data
- `/recommendations` - Recommendation engine
- `/admin` - Admin operations

### 6. Local Development

```bash
# Install dependencies
npm install
cd front && npm install && cd ..

# Start backend (port 3000)
npm run dev

# Start frontend (port 3002) - in another terminal
npm run dev:frontend
```

The frontend proxy configuration automatically forwards API calls to the backend during development.

## File Structure

```
fc_tinder/
├── api/
│   └── index.ts          # Vercel API handler
├── front/                # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src/                  # Backend source
│   ├── routes/
│   ├── services/
│   └── server.ts
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all dependencies are installed in both root and frontend directories
2. **API Routes Not Working**: Check that all routes are properly defined in `vercel.json`
3. **Frontend Not Loading**: Verify the build output is in the correct `dist` directory

### Vercel Logs

Use `vercel logs` to check deployment and runtime logs for debugging.

## Performance Considerations

- The backend uses caching for loaded data
- Static assets are served by Vercel's CDN
- API functions have a 30-second timeout limit
