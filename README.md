# Cypher - Self-Hosted PaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cypher is an open-source, **self-hosted Platform-as-a-Service (PaaS)** designed to simplify the deployment and management of applications directly from your Git repositories. It integrates with GitHub for authentication and repository access, uses Docker for building and running applications, and provides a web interface for managing your deployments.

*(This project uses a monorepo structure, containing both the backend and frontend code in a single repository for easier management and contribution.)*

**Note:** The initial development of this project was accelerated using AI-assisted coding ("Vibe coding") to establish a Minimum Viable Product (MVP). The current codebase serves as a functional foundation but may not fully reflect the final intended architecture or core essence of the envisioned product. Further refinement and development are ongoing.

## Features

*   **GitHub Integration:** Authenticate using your GitHub account, list accessible repositories, and configure specific branches for automatic builds via webhooks.
*   **Automated Docker Builds:** Trigger builds manually or automatically on push events to configured branches. View build status and logs in real-time via Server-Sent Events (SSE).
*   **Container Management:** View the status of running application containers, manage scaling (number of instances), and access container logs via WebSockets.
*   **Runtime Configuration:** Configure environment variables, port mappings, volumes, labels, and network settings for your deployed applications.
*   **Web UI:** A user-friendly interface (built with React/TypeScript and Shadcn UI) for managing repositories, builds, and containers.
*   **Notifications:** Get build status updates via Discord webhooks (optional).
*   **Real-time Updates:** Container status updates are pushed to the UI via WebSockets.

## Architecture

Cypher consists of two main components located within this monorepo:

1.  **Backend (`cypher-backend`):** A Python application built with FastAPI. It handles:
    *   API endpoints for the frontend.
    *   GitHub OAuth authentication and API interaction.
    *   Webhook processing for automated builds.
    *   Interaction with the Docker daemon (via `docker-py`) for building images and managing containers (start, stop, remove, scale, logs).
    *   Database operations (MongoDB via `pymongo`) for storing user data, repository configurations, build status/logs, container runtime configs, etc.
    *   Real-time updates via WebSockets (container status) and Server-Sent Events (build logs).
2.  **Frontend (`cypher-frontend`):** A single-page application built with React, TypeScript, Vite, Tailwind CSS, and Shadcn UI. It provides the user interface for interacting with the backend API.

## Getting Started

### Prerequisites

*   **Docker & Docker Compose:** Required for building and running application containers. [Install Docker](https://docs.docker.com/engine/install/)
*   **Python:** Version 3.10+ (check `cypher-backend/pyproject.toml` for specifics). [Poetry](https://python-poetry.org/) is used for dependency management.
*   **Node.js & Bun:** Required for the frontend. Check `cypher-frontend/package.json` for version specifics. [Install Node.js](https://nodejs.org/), [Install Bun](https://bun.sh/)
*   **MongoDB:** A running MongoDB instance is required for the backend database. [Install MongoDB](https://www.mongodb.com/try/download/community) or use a cloud provider/Docker container.
*   **Git:** Required for cloning the repository.

### Setup

1.  **Clone the repository:**
    ```bash
    # Replace <repository-url> with the actual URL
    git clone <repository-url>
    cd cypher
    ```

2.  **Backend Setup (`cypher-backend`):**
    *   Navigate to the backend directory:
        ```bash
        cd cypher-backend
        ```
    *   Install dependencies using Poetry:
        ```bash
        poetry install
        ```
    *   Configure environment variables:
        *   Copy the example environment file:
            ```bash
            cp .env.example .env
            ```
        *   Edit the `.env` file with your specific settings (see Configuration section below).
    *   Activate the virtual environment:
        ```bash
        poetry shell
        ```
    *   Run the backend server (usually with uvicorn):
        ```bash
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ```
        *(Adjust host/port as needed)*

3.  **Frontend Setup (`cypher-frontend`):**
    *   Navigate to the frontend directory (from the project root):
        ```bash
        cd cypher-frontend
        ```
    *   Install dependencies using Bun:
        ```bash
        bun install
        ```
    *   Configure environment variables (if necessary). The primary variable is usually the backend API URL. Check `src/config.ts` or look for `.env` file usage in `vite.config.ts`. Ensure `VITE_API_BASE_URL` (or similar) points to your running backend (e.g., `http://localhost:8000`).
    *   Run the frontend development server:
        ```bash
        bun run dev
        ```
        *(This usually starts the server on `http://localhost:5173` or similar)*

4.  **Access the Application:** Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

### Configuration (`cypher-backend/.env`)

The backend requires several environment variables set in the `.env` file:

*   `MONGO_URI`: Connection string for your MongoDB instance (e.g., `mongodb://localhost:27017/`).
*   `MONGO_DB_NAME`: Name of the database to use (e.g., `cypher_paas`).
*   `SECRET_KEY`: **Required.** A strong, random secret key for JWT token signing. Generate one using `openssl rand -hex 32`.
*   `GITHUB_CLIENT_ID`: **Required.** Your GitHub OAuth Application Client ID.
*   `GITHUB_CLIENT_SECRET`: **Required.** Your GitHub OAuth Application Client Secret.
*   `GITHUB_CALLBACK_URL`: **Required.** The callback URL configured in your GitHub OAuth App (must match the backend endpoint, e.g., `http://localhost:8000/auth/callback`).
*   `FRONTEND_URL`: **Required.** The base URL of your running frontend application (e.g., `http://localhost:5173`). Used for redirects after login/logout.
*   `GITHUB_WEBHOOK_SECRET`: **Required for auto-builds.** A secret string used to verify incoming GitHub webhooks. Create a strong secret and configure it in your GitHub repository webhooks.
*   `DOCKER_REGISTRY_URL` (Optional): URL of your private Docker registry if pushing images.
*   `DOCKER_REGISTRY_USERNAME` (Optional): Username for your Docker registry.
*   `DOCKER_REGISTRY_PASSWORD` (Optional): Password or access token for your Docker registry.
*   `DISCORD_WEBHOOK_URL` (Optional): URL for the Discord webhook to send build notifications.
*   `ALLOWED_ORIGINS`: Comma-separated list of origins allowed for CORS (e.g., `http://localhost:5173,http://127.0.0.1:5173`). Adjust based on your frontend URL.

**Important:**
*   Create a [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). Set the "Authorization callback URL" to your backend's callback endpoint (e.g., `http://localhost:8000/auth/callback`).
*   For automatic builds, configure webhooks in your GitHub repositories. Point them to `<your-backend-url>/webhooks/github`, select the `push` event, set the content type to `application/json`, and enter the same secret you defined in `GITHUB_WEBHOOK_SECRET`.

## Usage

1.  **Login:** Access the frontend URL and click the login button to authenticate via GitHub.
2.  **Dashboard:** View configured repositories and recent builds.
3.  **Repositories:**
    *   View repositories accessible via your GitHub account.
    *   Configure repositories for Cypher by selecting branches for automatic builds.
4.  **Builds:**
    *   Trigger manual builds for configured repositories/branches.
    *   View build history, status, and logs (including real-time streaming).
5.  **Containers:**
    *   View the status of running containers grouped by repository.
    *   Manage container instances (start, stop, remove, scale).
    *   Configure runtime settings (ports, environment variables, volumes, labels, network).
    *   View container logs (real-time streaming).

## Contributing

Contributions are welcome! Please feel free to open an issue to discuss bugs or feature requests, or submit a pull request.

Please adhere to the following guidelines:

*   **Code Style:**
    *   **Python (Backend):** Follow PEP 8 guidelines and use the [Black](https://github.com/psf/black) code formatter. Ensure code is formatted before committing.
    *   **TypeScript/React (Frontend):** Follow standard TypeScript/React best practices and use the configured ESLint and [Prettier](https://prettier.io/) setup. Ensure code is formatted before committing (e.g., using `bun run format`).
*   **Commit Messages:** Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for clear and automated commit history (e.g., `feat:`, `fix:`, `chore:`, `docs:`).
*   **Coding Standards:** Follow established design patterns and conventions within the project. Keep code clean, readable, and maintainable.
*   **Testing:** Add relevant tests for new features or bug fixes.
*   **Pull Requests:** Ensure your PRs are focused, well-described, and pass any configured CI checks.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
