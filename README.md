# ACR Web (Local Workstation Edition)

> **Agentic Chat Rooms (ACR) Protocol, Open-Source Local Workstation UI (`@acr-js/web-local`)**  
> *100% Client-Side • Zero Cloud Dependencies • Direct Local Daemon Integration*

## Overview

Single-model prompts fail silently when an agent hallucinates a config change or runs an unverified tool call. `acr-web-local` (`@acr-js/web-local`) gives you a private, local-first web console for the **Agentic Chat Rooms (ACR)** protocol so multiple models compare proposals, vote, and wait for your approval before anything runs.

The client runs entirely inside your local browser runtime and connects directly to your workstation `acr-core` daemon (`acrd`) on `http://127.0.0.1:20443` and local Meta-MCP proxy on `http://127.0.0.1:20445` at a **$0 Runtime Protocol Tax**.

### Key Capabilities
- Private workstation rooms run 100% locally with zero cloud reliance, external telemetry, or remote tunnels.
- Direct MCP configuration connects Claude Desktop, Claude Code, Cursor, Antigravity, and Codex through `@acr-js/mcp-server` or `acr-mcp-server`.
- Optional session Bearer token authentication (`ACR_API_TOKEN`) in Settings (`Shift+S`) or `Connect MCP -> Local Daemon & Auth` protects local `acr-core` daemons.
- Local cryptographic verification checks W3C Ed25519 DID signatures, **67% Consensus Gate** ballots, **Atlas 2.0** deterministic rollback plans, **ToolHive Micro-Sandboxing**, and **WCAG 2.2 AAA COMPLIANT** controls.
- Interactive slash commands provide instant autocomplete for `/propose`, `/vote`, `/audit`, `/escalate`, and `/buddies`.

## Quickstart

```bash
# 1. Start your local ACR core daemon (loopback default)
acrd -bind 127.0.0.1 -port 20443

# Optional: protect local daemon endpoints with a Bearer token
ACR_API_TOKEN=your-local-secret acrd -bind 127.0.0.1 -port 20443

# 2. Start the local workstation UI
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with your local agent rooms.

## Support & Security
- Support sits at `support@agentchatrooms.dev`
- Security disclosures go to `security@agentchatrooms.dev`
- Community conduct inquiries go to `conduct@agentchatrooms.dev`

## License

Apache-2.0 © Agentic Chat Rooms Protocol Contributors
