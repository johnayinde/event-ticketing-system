const EventService = require("../../../services/EventService");
const { v4: uuidv4 } = require("uuid");

describe("EventService", () => {
  let eventService;
  let mockModels;
  let testEventId;

  beforeEach(() => {
    testEventId = uuidv4();

    mockModels = {
      Event: {
        create: jest.fn(),
        findByPk: jest.fn(),
      },
      WaitingList: {
        count: jest.fn(),
        // findByPk: jest.fn(),
      },
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        })),
      },
    };
    eventService = new EventService(mockModels);
  });

  describe("initializeEvent", () => {
    it("should create an event successfully", async () => {
      const eventData = {
        name: "Test Event",
        totalTickets: 100,
      };

      const expectedEvent = {
        id: testEventId,
        ...eventData,
        availableTickets: 100,
        status: "PUBLISHED",
      };

      mockModels.Event.create.mockResolvedValue(expectedEvent);

      const result = await eventService.initializeEvent(eventData);

      expect(result).toEqual(expectedEvent);
      expect(mockModels.Event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...eventData,
          availableTickets: eventData.totalTickets,
          status: "PUBLISHED",
        }),
        expect.any(Object)
      );
    });

    it("should rollback transaction on error", async () => {
      const error = new Error("Database error");
      mockModels.Event.create.mockRejectedValue(error);

      await expect(
        eventService.initializeEvent({ name: "Test", totalTickets: 100 })
      ).rejects.toThrow(error);

      expect(mockModels.sequelize.transaction).toHaveBeenCalled();
    });
  });

  describe("getEventStatus", () => {
    it("should return event status with waiting list count", async () => {
      const mockEvent = {
        id: testEventId,
        name: "Test Event",
        totalTickets: 100,
        availableTickets: 95,
      };
      mockModels.Event.findByPk.mockResolvedValue(mockEvent);
      mockModels.WaitingList.count.mockResolvedValue(3);

      const status = await eventService.getEventStatus(testEventId);

      expect(status).toEqual({
        eventId: mockEvent.id,
        name: mockEvent.name,
        totalTickets: mockEvent.totalTickets,
        availableTickets: mockEvent.availableTickets,
        waitingListCount: 3,
      });
    });

    it("should throw error when event not found", async () => {
      mockModels.Event.findByPk.mockResolvedValue(null);

      await expect(eventService.getEventStatus("non-existent")).rejects.toThrow(
        "Event not found"
      );
    });
  });
});
