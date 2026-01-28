# VIVERSE AI Agent

VIVERSE AI Agent is a specialized, context-aware metaverse assistant designed to bridge the gap between AI discovery and 3D immersive environments. It serves as an intelligent scout for VIVERSE worlds and a helpful collaborator for metaverse development.

## 🚀 Features

- **Discovery Chat**: A natural language interface to search for VIVERSE worlds, spaces, and landmarks.
- **Multi-Tab Dashboard**: Seamlessly explore worlds and manage portals without leaving the dashboard.
- **Smart World Preview**: Instant iframe-based exploration for VIVERSE content.
- **Portal Knowledge Base**: Built-in awareness of official VIVERSE creator tools (Studio, Create, Avatar).
- **Contextual Search**: Leverages the VIVERSE CMS Room Search API for real-time content discovery.
- **External Request Support**: Built to be discoverable and accessible by other AI systems or remote clients.

## 🛠️ Project Structure

- `src/`: Backend server logic (Express, Node.js).
  - `services/`: Core logic for Gemini AI, Content Search, and File Management.
  - `routes/`: API endpoint definitions.
- `public/`: Frontend dashboard (HTML/CSS/JS).
  - `app.js`: Contains the `TabManager` and dynamic UI logic.
- `docs/`: Knowledge base documents (SDK info, Portal URLs).

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- Google Gemini API Key

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GOOGLE_API_KEY=your_gemini_api_key_here
   VIVERSE_AGENT_ENDPOINT=http://localhost:3000/api/ai/chat
   API_HUB_BASE_URL=https://api.viverse.com
   ```

### Running the Agent

- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

## 📖 Knowledge Base

The agent's intelligence is augmented by the documents in the `docs/` folder. To update its knowledge about VIVERSE portals or SDKs, simply edit the corresponding `.md` file.

## 🔒 Security

- Sensitive keys should always be stored in `.env` (already added to `.gitignore`).
- External access is controlled via environment variable binding (`0.0.0.0`).
