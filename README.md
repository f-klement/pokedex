# Pokédex Project (React, Express, Bun & Postgres)

This is a personal side project to build a full-stack Pokédex application. It serves as a practical exercise for combining a modern web stack: React (with Vite) on the frontend, and Express/Prisma on the backend, all powered by Bun and containerized with Docker.

## Tech Stack

  * **Frontend:** React, TypeScript, Vite, React Router
  * **Backend:** Express, TypeScript, Prisma
  * **Database:** Postgres
  * **Runtime:** Bun
  * **Containerization:** Docker & Docker Compose
  * **DB Management:** pgadmin

-----

## Project Structure

This project uses a monorepo-style structure, with separate folders for the client and server.

```
/pokemon_app
├── client/          # React + Vite Frontend (localhost:5173)
│   ├── public/      # Static assets (logos, icons)
│   └── src/         # React source code
├── server/          # Express + Prisma Backend (localhost:3000)
│   ├── prisma/      # Prisma schema and migrations
│   ├── src/         # Server source code (routes, scripts)
│   └── data/        # Raw Pokémon CSV data for seeding
├── .env             # Root environment variables for Docker
└── docker-compose.yml # Main Docker orchestration file
```

-----

## Getting Started

Follow these instructions to get the entire application stack running locally.

### 1\. Prerequisites

  * [Docker](https://www.docker.com/products/docker-desktop/) (Docker Desktop is recommended)
  * [Bun](https://bun.sh/) (for local dependency management)

### 2\. Configuration

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/pokemon_app.git
    cd pokemon_app
    ```

2.  **Create Root `.env` File**
    Create a `.env` file in the project's root directory. This file configures Docker Compose.

    # .env (at project root)

    # Postgres Settings
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_DB=pokedex

    # Port Settings
    SERVER_PORT=3000
    CLIENT_PORT=5173
    PGADMIN_PORT=5050

    # pgAdmin Credentials
    PGADMIN_DEFAULT_EMAIL=admin@pokedex.com
    PGADMIN_DEFAULT_PASSWORD=admin

    # This URL is for local Prisma CLI commands (e.g., bunx prisma db pull)
    # It connects to the database via the port exposed by Docker.
    DATABASE_URL="postgresql://postgres:password@localhost:5432/pokedex?schema=public"

    # DB Storage
    DATA_DIR=/Path/To/DB

3.  **Configure Prisma `.env`**
    Prisma's local CLI tools (like `db pull` or `studio`) need their own `.env` file inside the `server` directory to connect to the database from your *host* machine. For this purpose a symlink is set to the root env file. 

    ```bash
    cd server
    ln -s ../.env ./.env

    ```

4.  **Install Dependencies**
    (This is optional for Docker but good practice for local IDEs and TypeScript support)

    ```bash
    # Install client dependencies
    cd client && bun install && cd ..

    # Install server dependencies
    cd server && bun install && cd ..
    ```

### 3\. Running the Application

1.  **Start All Services**
    From the project root, run:

    ```bash
    docker-compose up --build
    ```

      * `--build` is only needed the first time or after changing a `Dockerfile`.
      * This will start the `client`, `server`, `db`, and `pgadmin` containers.

2.  **Seed the Database** (UNDER CONSTRUCTION)
    Once the containers are running, open a **new terminal window** and execute the seed script. This will populate the Postgres database with data from the CSV files.

    ```bash
    docker-compose exec server bun run seed
    ```

    You should see log output in your terminal indicating that the data is being read and inserted into the database.

-----

## Available Services

Once `docker-compose up` is running, the following services will be available:

  * **React Client (Frontend):**

      * `http://localhost:5173`

  * **Express Server (Backend):**

      * `http://localhost:3000`

  * **pgAdmin (Database GUI):**

      * `http://localhost:5050`
      * **Login:** Use the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env` file.
      * **Server Setup:**
          * Click "Add New Server".
          * **Host:** `db` (This is the service name from `docker-compose.yml`)
          * **Port:** `5432`
          * **User/Password:** Your `POSTGRES_USER` and `POSTGRES_PASSWORD`.

### API Endpoints

The server provides the following API endpoints:

  * `GET /api/pokemon`: Retrieves a JSON list of all Pokémon.
  * `GET /api/pokemon/:id`: Retrieves a single Pokémon by its `pokedex_id`.

## 🚧 Next Steps / To-Do
  * Process the Pokemon data for db import and seeding.
  * Fetch and display Pokémon data on the `/pokedex` page.
  * Implement search and filtering functionality.
  * Build a detailed view page for individual Pokémon.
  * Add unit and integration tests.