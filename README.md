# Global History App

An interactive world map for discovering history and culture through Wikipedia — one country at a time.

The core loop is exploration: click any country on the map, read a randomly selected Wikipedia article about it, and reload for a different one. The app is designed for curiosity-driven browsing — jumping between countries, surfacing unexpected topics, and following threads wherever they lead.

Notes are an optional layer on top. When something catches your attention, you can save the article (or just the parts that matter) as a note, write your own summary alongside the article, and tag it for later. Over time this builds a personal knowledge base tied to the world map — but exploring without saving anything is equally valid.

---

## Goal

Most history and geography learning happens in structured, linear formats. This app inverts that: start anywhere on the map, follow your curiosity, and let Wikipedia's breadth do the work. The goal is to make browsing global history feel like wandering — low friction, high serendipity.

---

## Features

- **Interactive world map** — click any country to pull up a random Wikipedia article about it
- **Wikipedia drawer** — reads the article inline without leaving the app; reload for a different article on the same country
- **Notes panel** — optionally open a side-by-side panel to write your own summaries or extract key points while reading
- **Save as note** — capture the full article or just your own sections into a structured note with one click
- **Tags** — label notes with custom tags for easy filtering later
- **All Notes page** — browse, search, filter by country or tag, and manage every note you've saved
- **Sidebar** — quick-access panel showing recent notes while staying on the map

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI | MUI (Material UI) v7 |
| Map | react-simple-maps |
| Backend / API | Express + Mongoose |
| Database | MongoDB |
| Testing | Cypress |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local install or a free [Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root. **This file is git-ignored and should never be committed.**

**Local MongoDB** (default port, no auth):
```
MONGO_URI=mongodb://localhost:27017/global-history-app
```

**MongoDB Atlas** (cloud):
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/global-history-app
```

The database and collections are created automatically on first use — no setup script needed.

### 3. Start the backend server

```bash
npm run server
```

The Express API will be available at `http://localhost:3000`.

### 4. Start the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Run in preview mode (Cloudflare Pages)

```bash
npm run preview
```

This builds the project and serves it locally through Wrangler, matching the production Cloudflare Pages environment.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run server` | Start the Express + MongoDB API server on :3000 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Build and serve locally via Wrangler |
| `npm run deploy` | Build and deploy to Cloudflare Pages |
| `npm run lint` | Run ESLint |
| `npm run cy:open` | Open the Cypress test runner |
| `npm run cy:run` | Run Cypress tests headlessly (waits for dev server on port 5173) |

---

## Running Tests

Start the dev server first, then open Cypress:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run cy:open
```

Or run tests headlessly in a single command (the test script waits for the server automatically):

```bash
npm run dev &
npm run cy:run
```

---

## Deployment

The app deploys to **Cloudflare Pages**. Make sure you have Wrangler authenticated (`wrangler login`) and a Pages project configured in `wrangler.jsonc`, then:

```bash
npm run deploy
```