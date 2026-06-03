# Project Context & Deployment Rules

This file contains critical instructions for AI agents working on this project or its remixes. These rules ensure that the application remains functional and deployable via GitHub Actions.

## 1. GitHub Actions Deployment (Vite + GitHub Pages)
- **Workflow File**: Always use the optimized `.github/workflows/deploy.yml`.
- **Nuance**: Do NOT include `cache: 'npm'` in the `setup-node` step unless a `package-lock.json` is explicitly present in the repository, as it will cause the build to fail.
- **Permissions**: Ensure the workflow has `pages: write` and `id-token: write` permissions.
- **GitHub Settings**: The user must manually set **Settings > Pages > Build and deployment > Source** to **"GitHub Actions"**.
- **Workflow Permissions**: In **Settings > Actions > General**, "Workflow permissions" must be set to **"Read and write permissions"**.

## 2. Vite & Path Configuration
- **Base Path**: Use `base: '/'` in `vite.config.ts` for projects using custom domains (like `bidflow.ae`).
- **HTML Scripts**: In `index.html`, always reference the entry point as `<script type="module" src="/index.tsx"></script>` (absolute path) to avoid MIME type errors during deployment.

## 3. Firebase Integration
- **Config Files**: Maintain `firebase-applet-config.json` as the source of truth for Firebase credentials.
- **Blueprint**: Use `firebase-blueprint.json` to define the Firestore schema and security rules logic.
- **Real-time Counters**: The app uses a specific pattern in `services/trackingService.ts` for real-time buyer/supplier counters. Ensure `initializeCounters()` is called on app load.

## 5. Manual Workflow Restoration
- **The Problem**: AI Studio's push mechanism often tracks the local `.github` folder or modifies it, causing issues during sync/push operations.
- **The Process**: To avoid synchronization conflicts or leaving files in a "Modified" state, the agent MUST delete the `.github/workflows/deploy.yml` file from the workspace before the user pushes changes to GitHub.
- **Agent Action**: The agent MUST summarize the changes ("What changes did you make?" description) and provide the exact, full code of `.github/workflows/deploy.yml` in the final response so the user can easily copy and paste it back into GitHub.
- **User Action**: The user will manually recreate this file on GitHub (or restore it locally) after pushing from AI Studio to ensure the deployment continues to work.

