const request = require("supertest");
const app = require("../../app");
const setupTestDB = require("../helpers/db");

describe("API Integration Tests", () => {
  setupTestDB();

  describe("POST /initialize", () => {
    it("should create new event", async () => {
      const response = await request(app).post("/initialize").send({
        name: "Test Event",
        totalTickets: 100,
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: "Test Event",
        totalTickets: 100,
        availableTickets: 100,
      });
    });

    it("should validate event data", async () => {
      const response = await request(app).post("/initialize").send({
        name: "",
        totalTickets: -1,
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /book", () => {
    let eventId;

    beforeEach(async () => {
      const event = await request(app).post("/initialize").send({
        name: "Test Event",
        totalTickets: 2,
      });
      eventId = event.body.id;
    });

    it("should book ticket successfully", async () => {
      const response = await request(app).post("/book").send({
        eventId,
        identifier: "user@test.com",
      });

      expect(response.status).toBe(201);
      expect(response.body.tickets).toBeDefined();
      expect(response.body.waitlisted).toBe(false);
    });

    it("should handle concurrent bookings correctly", async () => {
      const bookings = Array(3)
        .fill()
        .map(() =>
          request(app)
            .post("/book")
            .send({
              eventId,
              identifier: `user${Math.random()}@test.com`,
            })
        );

      const results = await Promise.all(bookings);

      const bookedTickets = results.filter((r) => !r.body.waitlisted).length;
      const waitlistedUsers = results.filter((r) => r.body.waitlisted).length;
      console.log({ bookedTickets, waitlistedUsers });

      expect(bookedTickets).toBe(2);
      expect(waitlistedUsers).toBe(1);
    });
  });

  describe("POST /cancel", () => {
    let eventId, ticketId;

    beforeEach(async () => {
      // Create event and book ticket
      const event = await request(app).post("/initialize").send({
        name: "Test Event",
        totalTickets: 1,
      });
      eventId = event.body.id;

      const booking = await request(app).post("/book").send({
        eventId,
        identifier: "user@test.com",
      });

      ticketId = booking.body.tickets[0]?.id;
    });

    it("should cancel ticket successfully", async () => {
      const response = await request(app).post("/cancel").send({
        eventId,
        identifier: "user@test.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("CANCELLED");
    });

    it("should handle non-existent ticket cancellation", async () => {
      const response = await request(app).post("/cancel").send({
        eventId,
        identifier: "nonexistent@test.com",
      });

      expect(response.status).toBe(500);
    });
  });

  describe("Concurrent Booking Tests", () => {
    it("should handle multiple concurrent bookings", async () => {
      const eventResponse = await request(app).post("/initialize").send({
        name: "Limited Concert",
        totalTickets: 2,
      });

      const bookingPromises = Array(4)
        .fill()
        .map((_, index) =>
          request(app)
            .post("/book")
            .send({
              eventId: eventResponse.body.id,
              identifier: `user${index}@example.com`,
            })
        );

      const results = await Promise.all(bookingPromises);

      const successfulBookings = results.filter((r) => !r.body.waitlisted);
      const waitlistedBookings = results.filter((r) => r.body.waitlisted);

      expect(successfulBookings).toHaveLength(2);
      expect(waitlistedBookings).toHaveLength(2);

      successfulBookings.forEach((booking) => {
        expect(booking.body.tickets).toBeDefined();
        expect(booking.body.tickets[0].status).toBe("BOOKED");
      });

      waitlistedBookings.forEach((booking, index) => {
        expect(booking.body.waitingEntry).toBeDefined();
      });

      const statusResponse = await request(app).get(
        `/status/${eventResponse.body.id}`
      );

      expect(statusResponse.body.availableTickets).toBe(0);
      expect(statusResponse.body.waitingListCount).toBe(2);
    });
  });

  describe("GET /status/:eventId", () => {
    let eventId;

    beforeEach(async () => {
      const event = await request(app).post("/initialize").send({
        name: "Test Event",
        totalTickets: 5,
      });
      eventId = event.body.id;
    });

    it("should return correct event status", async () => {
      const response = await request(app).get(`/status/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        eventId,
        totalTickets: 5,
        availableTickets: 5,
        waitingListCount: 0,
      });
    });

    it("should handle non-existent event", async () => {
      const response = await request(app).get("/status/fake-id-32-3-23mfkf");

      expect(response.status).toBe(500);
    });
  });
});
