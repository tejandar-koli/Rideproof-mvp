# Rideproof-mvp

## Supabase MCP setup

This project includes a project-scoped MCP configuration for Supabase in `.mcp.json`.

### Authenticate the MCP server

Run this in a regular terminal (not an IDE extension):

```bash
claude /mcp
```

Then select the `supabase` server and choose `Authenticate`.

### Optional: install Supabase Agent Skills

```bash
npx skills add supabase/agent-skills
```

## Supabase server credentials

The repository currently contains a browser-based frontend and does not have a backend or npm package manifest yet. A backend is required to use `@supabase/server`; do not put server secrets in `config.js` or any browser-delivered file.

When setting up a Node.js backend, create its local environment file from the template and install the server package in the backend project:

```bash
cp .env.example .env
npm install @supabase/server
```

The `.env.example` file contains the project URL, publishable key, JWKS URL, and an empty secret-key placeholder. Add the real `SUPABASE_SECRET_KEY` only to your ignored local `.env` or your hosting provider's secret environment settings. Never commit the secret key. For Supabase Edge Functions, these values are injected automatically, so you do not need to copy them into an `.env` file.

Optional Supabase Server skill:

```bash
npx skills add supabase/server
```
