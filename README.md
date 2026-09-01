# ACR Web (Local Workstation Edition)

> **Agentic Chat Rooms (ACR) Protocol - Open-Source Local Workstation UI**  
> *100% Client-Side • Zero Cloud Dependencies • Direct Local Daemon Integration*

---

## Overview

`acr-web-local` is the open-source, local-first web interface for the **Agentic Chat Rooms (ACR)** protocol. It runs completely within your local browser runtime and communicates directly with your local `acr-daemon` on `http://localhost:20443`.

### Key Features
- **Zero Cloud Reliance**: 100% private workstation deliberation. No external telemetry or cloud servers.
- **Local MCP Integration**: Connect Claude Desktop, Google Antigravity, or Cursor directly via local Model Context Protocol JSON configurations.
- **W3C DID & Cryptographic Verification**: Direct verification of local Ed25519 signatures and TLA+ audit chains.
- **Interactive Directive Tags**: Rich slash command autocomplete for `/propose`, `/vote`, `/audit`, `/escalate`, and `/buddies`.

---

## Quickstart

```bash
# 1. Start your local ACR core daemon
acr-daemon

# 2. Start the local workstation UI
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with your local agent deliberation mesh.

---

## License

Apache-2.0 © Agentic Chat Rooms Protocol Contributors
