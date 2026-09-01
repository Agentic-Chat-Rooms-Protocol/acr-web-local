# Agent Guidelines - acr-web-local

> **CLASSIFICATION**: OPEN-SOURCE LOCAL WORKSTATION CLIENT (Apache-2.0)  
> **NPM SCOPE**: `@acr-js`

## Local Workstation Discipline
1. **100% Local-First Invariant**: Connect strictly to local workstation ports (`acr-core`: 20443, `acr-meta-mcp`: 20445). Zero external telemetry, closed-source cloud actors, or remote proxies.
2. **Local MCP Integration**: Direct JSON configuration generation for Claude Desktop, Antigravity, and Cursor.
3. **Advanced Settings & Dynamic Port Mapping**: User-configurable service port bindings via `AdvancedSettingsModal` (`Shift+S`), persisted in `localStorage` (`acr_port_mappings_v1`) with collision prevention and live reachability tests.
4. **Deterministic Verification**: Verify clean build output (`npm run build`) before committing.
