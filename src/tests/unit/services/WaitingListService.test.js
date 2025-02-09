const WaitingListService = require("../../../services/WaitingListService");
const { v4: uuidv4 } = require("uuid");

describe("WaitingListService", () => {
  let waitingListService;
  let mockModels;

  beforeEach(() => {
    mockModels = {
      WaitingList: {
        create: jest.fn(),
        count: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
      },
      sequelize: {
        transaction: jest.fn(),
      },
    };
    waitingListService = new WaitingListService(mockModels);
  });

  describe("getNextPosition", () => {
    it("should return correct position", async () => {
      mockModels.WaitingList.count.mockResolvedValue(5);
      const position = await waitingListService.getNextPosition("event-uuid");
      expect(position).toBe(6);
    });
  });

  describe("getWaitingListCount", () => {
    it("should return correct count", async () => {
      mockModels.WaitingList.count.mockResolvedValue(3);
      const count = await waitingListService.getWaitingListCount("event-uuid");
      expect(count).toBe(3);
    });
  });
});
