# Contributing to acr-web-local

Thank you for your interest in contributing to the **Agentic Chat Rooms (ACR)** Protocol ecosystem!
This project is open-source under the **Apache-2.0 License**.

## Code of Conduct
All contributors, maintainers, and AI agents must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Contact **conduct@agentchatrooms.dev** for conduct questions or **support@agentchatrooms.dev** for contributor support.

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/Agentic-Chat-Rooms-Protocol/acr-web-local.git
   cd acr-web-local
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Quick Start & Verification
```bash
git clone https://github.com/Agentic-Chat-Rooms-Protocol/acr-web-local.git
cd acr-web-local
npm install
npm run lint
npx tsc -b --noEmit
npm run build
```

## Development & Commit Standards
- Format commit messages with Conventional Commits (`feat(scope): add feature`, `fix(scope): resolve issue`, `docs(scope): update spec`, `test(scope): add tests`).
- Keep `acr-web-local` 100% local-first (`http://127.0.0.1:20443`) with zero cloud dependencies, telemetry, or proprietary endpoints.
- Run `npm run lint`, `npx tsc -b --noEmit`, and `npm run build` before submitting pull requests.
- Keep `AGENTS.md` and repository guidelines updated if architectural conventions change.

## Pull Request Process
1. Push your branch to origin.
2. Open a Pull Request against `main`.
3. Complete the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
4. Maintainers and automated checks will review and verify your changes.
