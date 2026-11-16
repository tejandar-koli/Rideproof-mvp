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

The `.env.example` file contains the project URL, publishable key, JWKS URL, an empty secret-key placeholder, and a direct Postgres connection-string template. Replace `[YOUR-PASSWORD]` in your local `.env` with the database password. Percent-encode any special characters in the password before inserting it into the URL. Keep `.env` private; never commit real passwords or the secret key. Use the database connection string only in trusted server-side code, never in browser/client code. For Supabase Edge Functions, Supabase injects the required environment values automatically.

Optional Supabase Server skill:

```bash
npx skills add supabase/server
```
