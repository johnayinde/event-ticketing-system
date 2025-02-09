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
git clone https://github.com/yourusername/ticket-booking-system.git
cd ticket-booking-system
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

Production:

```bash
yarn start
```

Tests:

```bash
yarn test
```

## API Documentation

### Initialize Event

```http
POST /api/v1/initialize
Content-Type: application/json

{
  "name": "Concert",
  "description": "Annual music festival",
  "date": "2025-12-31",
  "venue": "Stadium",
  "totalTickets": 1000,
  "ticketPrice": 99.99
}
```

### Book Ticket

```http
POST /api/v1/book
Content-Type: application/json

{
  "eventId": "uuid",
  "userId": "user123"
}
```

### Cancel Ticket

```http
POST /api/v1/cancel
Content-Type: application/json

{
  "eventId": "uuid",
  "userId": "user123"
}
```

### Get Event Status

```http
GET /api/v1/status/:eventId
```
