# How to setup bbdb

This project consists of:
- **Server** — NestJS + Prisma + MongoDB (Docker)
- **Client** — Vike (React)

Both parts use **pnpm** as the package manager.

---

## Prerequisites

Make sure you have installed:
- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/installation)
- [Node.js](https://nodejs.org/) (v20+ recommended)

---

## Server Setup (NestJS + Prisma + MongoDB)

### 1. Start the containers
```bash
docker-compose up -d
```

This will start MongoDB and the NestJS server.

### 2. Install dependencies

```bash
cd bb-db-backend
pnpm install
```

### 3. Generate Prisma client

```bash
pnpm prisma generate
```

### 4. Start the server

```bash
pnpm start:prod
```

The API should now be running and connected to MongoDB in Docker.

---

## Client Setup (Vike)

### 1. Install dependencies

```bash
cd bb-db-frontend
pnpm install
```

### 2. Build and start the server

```bash
pnpm build
pnpm preview
```

---

## Useful Commands

### Stop containers

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f
```

### Rebuild containers

```bash
docker-compose up -d --build
```
