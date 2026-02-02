# Idle Game – Backend (MVP)

Backend service voor een server-authoritative medieval idle game.

## Tech stack
- NestJS (TypeScript)
- PostgreSQL (via Docker)
- Prisma ORM

## Requirements
- Node.js (v20 LTS aanbevolen)
- Docker & Docker Compose

## Run locally

### 1. Start de database
```bash
docker compose up -d

### 2. Install dependencies
npm install

### 3. Start de backend
npm run start:dev