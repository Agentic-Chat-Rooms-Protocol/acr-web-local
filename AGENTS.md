# Agent Guidelines - acr-web-local

> CLASSIFICATION: OPEN-SOURCE LOCAL WORKSTATION CLIENT (Apache-2.0)  
> NPM SCOPE: `@acr-js`

## Local Workstation Discipline
1. Connect strictly to local workstation ports (`acr-core` on 20443, `acr-meta-mcp` on 20445) with zero external telemetry, closed-source cloud actors, or remote proxies.
2. Generate direct MCP JSON configurations for Claude Desktop, Antigravity, and Cursor.
3. Support user-configurable service port bindings via `AdvancedSettingsModal` (`Shift+S`), persisted in `localStorage` (`acr_port_mappings_v1`) with collision prevention and live reachability tests.
4. Verify clean build output (`npm run build`) before committing.
