# DevQuotes API 🌐

> A tiny, self-contained HTTP API that serves random developer/programming quotes. Zero dependencies, pure Node.js.

## Quick Start

```bash
node server.js
# Server running at http://localhost:3000
```

## Endpoints

### `GET /`

Home page with a random quote.

### `GET /quote`

Returns a random developer quote as JSON.

```json
{
  "id": 1,
  "text": "Debugging is twice as hard as writing the code in the first place.",
  "author": "Brian Kernighan",
  "tags": ["debugging", "code-quality"]
}
```

### `GET /quote?author=Martin Fowler`

Filter quotes by author.

### `GET /all`

Returns all quotes as JSON.

### `GET /stats`

Returns quote statistics.

```json
{
  "total": 25,
  "authors": 15
}
```

### `GET /health`

Health check endpoint.

```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2026-09-27T10:45:00.000Z"
}
```

## Deploy

Works great on Railway, Render, Fly.io, or any Node.js host:

```bash
# Railway
railway up

# Render
# Just connect GitHub and set start command: node server.js
```

## License

MIT
