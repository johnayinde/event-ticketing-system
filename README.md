# Event Ticket Booking System

A Node.js application for managing event ticket bookings with concurrent request handling and waiting list management.

## Features

- Event management (create, update, cancel)
- Ticket booking with automatic waiting list
- Concurrent booking handling
- Real-time ticket availability tracking
- Comprehensive error handling
- API rate limiting
- Request logging

## Prerequisites

- Node.js >= 20.x
- MySQL >= 8.0
- yarn >= 1.x

## Installation

1. Clone the repository:

```bash
git clone https://github.com/johnayinde/event-ticketing-system.git
cd event-ticketing-system
```

2. Install dependencies:

```bash
yarn install
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:

```bash
yarn run migrate
```

## Running the Application

Development:

```bash
yarn run dev
```

Tests:

```bash
yarn run test
```

## API Documentation

### Initialize Event

```http
POST /initialize
Content-Type: application/json

Request:
{
  "name": "Concert 2025",
  "totalTickets": 100
}

Response: (201 Created)
{
  "id": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
  "name": "Concert 2025",
  "totalTickets": 100,
  "availableTickets": 100,
  "status": "PUBLISHED"
}
```

### Book Ticket

```http
POST /book
Content-Type: application/json

Request:
{
  "eventId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
  "identifier": "user@example.com",
  "quantity": 1  // optional, defaults to 1
}

Response (Success): (201 Created)
{
  "tickets": [{
    "id": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "eventId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "userId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "status": "BOOKED"
  }],
  "waitlisted": false
}

Response (Waitlisted):
{
  "waitingEntry": {
    "id": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "eventId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "userId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "position": 1
  },
  "waitlisted": true
}
```

### Cancel Ticket

```http
POST /cancel
Content-Type: application/json

Request:
{
  "eventId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
  "identifier": "user@example.com"
}

Response: (200 OK)
{
  "ticket": {
    "id": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
    "status": "CANCELLED"
  }
}
```

### Get Event Status

```http
GET /status/:eventId

Response: (200 OK)
{
  "eventId": "6c2528c6-7b44-4274-97f4-d98ad525ea9f",
  "name": "Concert 2025",
  "totalTickets": 100,
  "availableTickets": 95,
  "waitingListCount": 2
}
```

## Design Choices

### Database Design

- Used UUID for primary keys to prevent sequential ID prediction
- Implemented proper indexing for frequent queries
- Used ENUM types for status fields to ensure data integrity

### Concurrency Handling

- Implemented row-level locking to prevent race conditions
- Used SERIALIZABLE transaction isolation level for ticket bookings
- Added retry mechanism for handling deadlocks

### Error Handling

- Comprehensive error handling with meaningful messages
- Transaction rollback on failures
- Proper HTTP status codes for different scenarios

### Testing

- Unit tests for core business logic
- Integration tests for API endpoints
- Concurrent booking tests
- Database cleanup between tests
