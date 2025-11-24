# Invoice Service

A RESTful API for managing invoices, built with Node.js, Fastify, and PostgreSQL.

## Quick Start

1.  **Start the services:**
    ```bash
    docker compose up --build
    ```
    The API will be available at `http://localhost:3000`.
    Database migrations run automatically on startup.

2.  **Run tests:**
    ```bash
    pnpm test
    ```

## API Endpoints

### Invoices

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/invoices` | Create a new invoice |
| `GET` | `/invoices` | List all invoices (supports filtering) |
| `GET` | `/invoices/:id` | Get invoice by ID |
| `GET` | `/invoices/:id?includeItems=true` | Get invoice with line items |

### Search & Filtering

You can filter invoices using query parameters:

- `query`: Search term (invoice number, external ID, customer name/email)
- `invoiceDateFrom` / `invoiceDateTo`: Filter by invoice date (YYYY-MM-DD)
- `dueDateFrom` / `dueDateTo`: Filter by due date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response:**
```json
{
  "invoices": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Examples:**

```bash
# Get all invoices
curl http://localhost:3000/invoices

# Search by customer name
curl "http://localhost:3000/invoices?query=Solar"

# Filter by date range
curl "http://localhost:3000/invoices?invoiceDateFrom=2024-01-01&invoiceDateTo=2024-01-31"

# Get specific invoice with items
curl "http://localhost:3000/invoices/YOUR_INVOICE_ID?includeItems=true"
```

## Design Notes

*   **Database**: PostgreSQL with Drizzle ORM.
*   **Validation**: Fastify internal schema validation (AJV).
*   **Error Handling**: Returns standard HTTP status codes.
*   **Dates**: All dates use ISO 8601 format (`YYYY-MM-DD`).

## Limitations

*   **Denormalization**: No denormalization of customer and item data in the invoice table.
