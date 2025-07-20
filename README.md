# Task Management API

A RESTful API for managing tasks, built with Hono.js and designed for Cloudflare Workers deployment. Features type-safe operations, automatic OpenAPI documentation, and SQLite database integration.

## Architecture

This API implements a clean, modular architecture with:
- Type-safe route handlers using Zod validation
- Database operations through Drizzle ORM
- OpenAPI 3.0 specification for documentation
- Middleware for logging and error handling

## Technology Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: SQLite with Turso
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Documentation**: OpenAPI 3.0 with Scalar UI
- **Language**: TypeScript

## API Endpoints

### Tasks Resource

| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/tasks`      | Retrieve all tasks             |
| POST   | `/tasks`      | Create a new task              |
| GET    | `/tasks/:id`  | Retrieve a specific task       |
| PATCH  | `/tasks/:id`  | Update an existing task        |
| DELETE | `/tasks/:id`  | Remove a task                  |

### Documentation

| Endpoint | Description              |
|----------|--------------------------|
| `/doc`   | Interactive API documentation |

## Data Model

### Task Schema

```
id: number (auto-increment, primary key)
name: string (1-500 characters, required)
done: boolean (default: false)
createdAt: timestamp (auto-generated)
updatedAt: timestamp (auto-updated)
```

## Installation

Install dependencies:
```bash
npm install
```

## Configuration

Create environment configuration:
```bash
cp .env.example .env
```

Configure database connection:
```
DATABASE_URL=your_database_url
DATABASE_AUTH_TOKEN=your_auth_token
```

## Development

Start development server:
```bash
npm run dev
```

Start local database:
```bash
npm run dev:db
```

Access the API at `http://localhost:8787`

## Available Commands

| Command              | Purpose                        |
|---------------------|--------------------------------|
| `npm run dev`       | Start development server       |
| `npm run deploy`    | Deploy to Cloudflare Workers   |
| `npm run build`     | Build for production           |
| `npm run typecheck` | Run TypeScript validation      |
| `npm run lint`      | Check code quality             |
| `npm run lint:fix`  | Fix linting issues             |
| `npm run test`      | Execute test suite             |

## Database Management

This project uses Drizzle ORM for database operations with SQLite as the database engine. Turso provides the development database environment.

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

Ensure your Cloudflare Workers environment includes the required database credentials.

## Response Format

All API responses follow standard HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `404` - Not Found
- `422` - Unprocessable Entity

Error responses include structured error messages with validation details when applicable.

## Documentation Access

Interactive API documentation is available at the `/doc` endpoint when the server is running. This provides a complete interface for testing all available endpoints.

## License

MIT
