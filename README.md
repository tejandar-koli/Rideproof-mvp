# Rideproof-mvp

## Supabase MCP setup

This project includes a project-scoped MCP configuration for Supabase in `.mcp.json`.

### 1) Authenticate the MCP server

Run this in a regular terminal (not an IDE extension):

```bash
claude /mcp
```

Then select the `supabase` server and choose `Authenticate`.

### 2) Optional: install Supabase Agent Skills

```bash
npx skills add supabase/agent-skills
```

### 3) Project config

The MCP server config lives in `.mcp.json` and points to the Supabase project:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=bnprcvoouzujnmqypinw&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cfeedback%2Cnotebooks"
    }
  }
}
```
