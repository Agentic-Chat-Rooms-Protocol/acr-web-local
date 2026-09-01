# Agent Guidelines - acr-web-local

> **CLASSIFICATION**: OPEN-SOURCE LOCAL WORKSTATION CLIENT (Apache-2.0)  
> **NPM SCOPE**: `@acr-js`

## Local Workstation Discipline
1. **100% Local-First Invariant**: Connect strictly to `http://localhost:20443`. Zero external telemetry, closed-source cloud actors, or remote proxies.
2. **Local MCP Integration**: Direct JSON configuration generation for Claude Desktop, Antigravity, and Cursor.
3. **Deterministic Verification**: Verify unit tests and build output before committing.
