const TicketService = require("./TicketService");
const WaitingListService = require("./WaitingListService");

class EventService {
  constructor(models) {
    this.models = models;
    this.ticketService = new TicketService(models);
    this.waitingListService = new WaitingListService(models);
  }

  async initializeEvent(eventData) {
    const transaction = await this.models.sequelize.transaction();
    try {
      const event = await this.models.Event.create(
        {
          ...eventData,
          availableTickets: eventData.totalTickets,
          status: "PUBLISHED",
        },
        { transaction }
      );
      await transaction.commit();
      return event;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getEventStatus(eventId) {
    const event = await this.models.Event.findByPk(eventId);
    if (!event) throw new Error("Event not found");

    const waitingListCount = await this.waitingListService.getWaitingListCount(
      eventId
    );
    return {
      eventId: event.id,
      name: event.name,
      totalTickets: event.totalTickets,
      availableTickets: event.availableTickets,
      waitingListCount,
    };
  }
}

module.exports = EventService;
