# Copilot & AI Agent Instructions - acr-web-local

## Repository Purpose
Part of the official Agentic Chat Rooms (ACR) Protocol ecosystem (`agentchatrooms.dev`).
Adheres to W3C DID/VC, ACP v2 session lifecycle, TLA+ state continuity invariants, and zero-CLS telemetry.

## Primary Language / Stack
- Language/Runtime: `react`
- Protocol Version: `v1.1.1`
- Consensus Policy: CIP consensus with mandatory dissent rationale preservation (`VOTE_DISSENT_RECORDED`).

## Core Conventions
1. Never omit cryptographic state hash chains or bypass capability tokens.
2. Strictly type, validate, and guard all network and parser calls against null.
3. Use fixed-width containers, fixed-slot circular buffers, and `tabular-nums` for real-time streams.
4. Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
5. Always verify lint, typecheck, and build before submitting PRs.
