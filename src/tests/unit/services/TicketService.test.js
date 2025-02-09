const TicketService = require("../../../services/TicketService");
const { v4: uuidv4 } = require("uuid");

describe("TicketService", () => {
  let ticketService;
  let mockModels;
  let testEventId;
  let testUserId;
  let testTicketId;
  let testWaitingId;

  beforeEach(() => {
    testEventId = uuidv4();
    testUserId = uuidv4();
    testTicketId = uuidv4();
    testWaitingId = uuidv4();

    mockModels = {
      Ticket: {
        create: jest.fn(),
        findOne: jest.fn(),
      },
      Event: {
        findByPk: jest.fn(),
      },
      User: {
        findOrCreate: jest.fn(),
        findOne: jest.fn(),
      },
      WaitingList: {
        create: jest.fn(),
        count: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
      },
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
          LOCK: { UPDATE: "UPDATE" },
        })),
      },
    };
    ticketService = new TicketService(mockModels);
  });

  describe("bookTicket", () => {
    it("should book a ticket successfully when available", async () => {
      const eventId = testEventId;
      const identifier = "user@test.com";

      const mockUser = { id: testUserId, identifier };
      const mockEvent = {
        id: eventId,
        availableTickets: 5,
        save: jest.fn(),
      };
      const mockTicket = {
        id: testTicketId,
        eventId,
        userId: mockUser.id,
        status: "BOOKED",
      };

      mockModels.User.findOrCreate.mockResolvedValue([mockUser, false]);
      mockModels.Event.findByPk.mockResolvedValue(mockEvent);
      mockModels.Ticket.create.mockResolvedValue(mockTicket);

      const result = await ticketService.bookTicket(eventId, identifier);

      expect(result).toEqual({
        tickets: [mockTicket],
        waitlisted: false,
      });
      expect(mockEvent.availableTickets).toBe(4);
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it("should add to waiting list when no tickets available", async () => {
      const eventId = testEventId;
      const identifier = "user@test.com";

      const mockUser = { id: testUserId };
      const mockEvent = {
        id: eventId,
        availableTickets: 0,
        save: jest.fn(),
      };
      const mockWaitingEntry = {
        id: testWaitingId,
        eventId,
        userId: mockUser.id,
        position: 1,
      };

      mockModels.User.findOrCreate.mockResolvedValue([mockUser, false]);
      mockModels.Event.findByPk.mockResolvedValue(mockEvent);
      mockModels.WaitingList.count.mockResolvedValue(0);
      mockModels.WaitingList.create.mockResolvedValue(mockWaitingEntry);

      const result = await ticketService.bookTicket(eventId, identifier);

      expect(result).toEqual({
        waitingEntry: mockWaitingEntry,
        waitlisted: true,
      });
    });
  });

  describe("cancelTicket", () => {
    it("should cancel ticket successfully", async () => {
      const identifier = "user@test.com";

      const mockUser = { id: testUserId, identifier };
      const mockTicket = {
        id: testTicketId,
        status: "BOOKED",
        save: jest.fn(),
      };
      const mockEvent = {
        id: testEventId,
        availableTickets: 0,
        save: jest.fn(),
      };

      mockModels.User.findOne.mockResolvedValue(mockUser); // Use findOne instead of findOrCreate
      mockModels.Event.findByPk.mockResolvedValue(mockEvent);
      mockModels.Ticket.findOne.mockResolvedValue(mockTicket);
      mockModels.WaitingList.findOne.mockResolvedValue(null);

      await ticketService.cancelTicket(testEventId, testUserId);

      expect(mockTicket.status).toBe("CANCELLED");
      expect(mockEvent.availableTickets).toBe(1);
    });

    it("should reassign ticket to waiting list user", async () => {
      const identifier = "user@test.com";
      const user2Id = uuidv4();

      const mockUser = { id: testUserId, identifier };
      const mockTicket = {
        id: testTicketId,
        status: "BOOKED",
        save: jest.fn(),
      };

      const mockEvent = {
        id: testEventId,
        availableTickets: 0,
        save: jest.fn(),
      };

      const mockWaitingUser = {
        id: testWaitingId,
        userId: user2Id,
        position: 1,
        quantity: 1,
        destroy: jest.fn(),
      };

      mockModels.User.findOne.mockResolvedValue(mockUser);
      mockModels.Ticket.findOne.mockResolvedValue(mockTicket);
      mockModels.Event.findByPk.mockResolvedValue(mockEvent);
      mockModels.WaitingList.findOne.mockResolvedValue(mockWaitingUser);
      mockModels.Ticket.create.mockResolvedValue({ id: uuidv4() });

      await ticketService.cancelTicket(testEventId, identifier);

      expect(mockTicket.status).toBe("CANCELLED");
      expect(mockWaitingUser.destroy).toHaveBeenCalled();
      expect(mockModels.Ticket.create).toHaveBeenCalled();
    });
  });
});
