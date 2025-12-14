# Task Management API

A feature-rich RESTful API for managing tasks, built with Hono.js and designed for Cloudflare Workers deployment. Features categories, tags, subtasks, priority levels, due dates, and comprehensive filtering capabilities.

## Features

- **Task Management**: CRUD operations with priority levels, due dates, and descriptions
- **Categories**: Organize tasks into color-coded categories
- **Tags**: Flexible tagging system with many-to-many relationships
- **Subtasks**: Nested subtasks with ordering and completion tracking
- **Bulk Operations**: Update or delete multiple tasks at once
- **Filtering & Search**: Filter by status, priority, category, tags, overdue items
- **Pagination**: Configurable page-based pagination
- **Statistics**: Dashboard and productivity analytics
- **Type-safe**: Full TypeScript with Zod validation
- **Auto Documentation**: OpenAPI 3.0 spec with Scalar UI

## Technology Stack

- **Runtime**: Cloudflare Workers / Node.js
- **Framework**: Hono.js
- **Database**: SQLite with Turso
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Documentation**: OpenAPI 3.0 with Scalar UI

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (with filtering, sorting, pagination) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/{id}` | Get a specific task with relations |
| PATCH | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |
| POST | `/tasks/{id}/toggle` | Toggle task completion |
| PATCH | `/tasks/bulk` | Bulk update multiple tasks |
| DELETE | `/tasks/bulk` | Bulk delete multiple tasks |
| POST | `/tasks/{id}/tags` | Add tags to a task |
| DELETE | `/tasks/{id}/tags` | Remove tags from a task |

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/{taskId}/subtasks` | List subtasks |
| POST | `/tasks/{taskId}/subtasks` | Create a subtask |
| GET | `/tasks/{taskId}/subtasks/{id}` | Get a subtask |
| PATCH | `/tasks/{taskId}/subtasks/{id}` | Update a subtask |
| DELETE | `/tasks/{taskId}/subtasks/{id}` | Delete a subtask |
| POST | `/tasks/{taskId}/subtasks/{id}/toggle` | Toggle subtask |
| POST | `/tasks/{taskId}/subtasks/reorder` | Reorder subtasks |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create a category |
| GET | `/categories/{id}` | Get a category |
| PATCH | `/categories/{id}` | Update a category |
| DELETE | `/categories/{id}` | Delete a category |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tags` | List all tags |
| POST | `/tags` | Create a tag |
| GET | `/tags/{id}` | Get a tag |
| PATCH | `/tags/{id}` | Update a tag |
| DELETE | `/tags/{id}` | Delete a tag |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/dashboard` | Dashboard overview |
| GET | `/stats/productivity` | Productivity over time |

### Documentation

| Endpoint | Description |
|----------|-------------|
| `/` | Interactive API documentation (Scalar UI) |
| `/doc` | OpenAPI 3.0 JSON specification |

## Installation

```bash
pnpm install
```

## Configuration

1. Create a database on [Turso](https://turso.tech):
   ```bash
   turso db create tasks-api
   turso db show tasks-api --url
   turso db tokens create tasks-api
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your Turso credentials to `.env`

4. Push the database schema:
   ```bash
   pnpm db:push
   ```

## Development

Start development server:
```bash
pnpm dev
```

Access the API documentation at `http://localhost:9999/`
