# LLM Council

An LLM Council application that queries multiple AI models and synthesizes their responses.

## Overview

This application implements a 3-stage council process:
1. **Stage 1**: Collect responses from multiple LLMs (GPT, Gemini, Claude, Grok)
2. **Stage 2**: Each model ranks the responses from other models
3. **Stage 3**: A chairman model synthesizes the final answer based on rankings

## Project Architecture

### Backend (Python/FastAPI)
- Located in `backend/`
- Runs on port 8001 in development (port from PORT env var in production)
- Uses OpenRouter API for LLM calls
- Serves static frontend in production mode
- Endpoints:
  - `GET /api/conversations` - List conversations (supports ?include_archived=true)
  - `POST /api/conversations` - Create new conversation
  - `GET /api/conversations/{id}` - Get specific conversation
  - `DELETE /api/conversations/{id}` - Delete conversation
  - `PATCH /api/conversations/{id}/archive` - Archive/unarchive conversation
  - `POST /api/conversations/{id}/message` - Send message
  - `POST /api/conversations/{id}/message/stream` - Send message with streaming

### Frontend (React/Vite)
- Located in `frontend/`
- Runs on port 5000 (0.0.0.0 for Replit compatibility) in development
- Components for 3-stage visualization
- API calls proxied to backend via Vite in development

## Configuration

### Required Environment Variable
- `OPENROUTER_API_KEY` - Your OpenRouter API key

### Council Models (configured in backend/config.py)
- openai/gpt-5.1
- google/gemini-3-pro-preview  
- anthropic/claude-sonnet-4.5
- x-ai/grok-4

## Running the Application

The workflow "LLM Council" runs both servers:
- Backend: `python -m backend.main` (port 8001)
- Frontend: `npm run dev` in frontend/ (port 5000)

### Workflow Configuration Requirements
The workflow uses `bash start.sh` which runs both servers reliably. Configuration in `.replit`:
- **outputType**: `webview` - displays the frontend in the preview pane
- **waitForPort**: `5000` - waits for the frontend server before showing preview
- **Port mapping**: localPort 5000 → externalPort 80

**Troubleshooting**: If the preview shows JSON/API output instead of the UI:
1. Kill any stale processes: `pkill -f "python -m backend.main"; pkill -f "vite"`
2. Restart the workflow - this ensures both servers start fresh
3. Verify port 5000 is responding: `curl http://localhost:5000`

## Deployment

- Build: `cd frontend && npm run build`
- Run: `python -m backend.main` (serves both API and static frontend)

## Recent Changes

- 2024-12-30: Added Settings page with web search toggle
  - Settings button added to sidebar footer
  - Settings page allows toggling OpenRouter's web search feature
  - Web search plugin added to Stage 1 API calls when enabled
  - Settings stored in data/conversations/_settings.json

- 2024-12-30: Made UI mobile-friendly
  - Added hamburger menu button for mobile navigation
  - Sidebar collapses off-screen on mobile (slides in/out)
  - Added responsive media queries at 768px breakpoint
  - Touch targets meet 44px minimum for mobile accessibility
  - Stage tabs and visualizations stack properly on narrow screens
  - Input form stacks vertically on mobile

- 2024-12-30: Added conversation archive and delete functionality
  - Backend: Added DELETE and PATCH endpoints for conversations
  - Backend: Added archived field to conversation storage
  - Frontend: Added menu button on conversation items (shows on hover)
  - Frontend: Archive/unarchive and delete options with confirmation modal
  - Frontend: Toggle to show/hide archived conversations

- 2024-12-30: Configured for Replit environment
  - Updated Vite to use port 5000 and allow all hosts
  - Set up proxy for API calls to backend
  - Updated CORS configuration
  - Added static file serving for production deployment
  - Installed dependencies via uv and npm
