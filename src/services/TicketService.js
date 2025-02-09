const { Transaction, Op, literal } = require("sequelize");

class TicketService {
  constructor(models) {
    this.models = models;
  }

  async bookTicket(eventId, identifier, quantity = 1) {
    const transaction = await this.models.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const [user] = await this.models.User.findOrCreate({
        where: { identifier },
        transaction,
        lock: true,
      });

      const event = await this.models.Event.findByPk(eventId, {
        lock: true,
        transaction,
      });

      if (!event) throw new Error("Event not found");

      // if (event.availableTickets < quantity) {
      //   throw new Error("Not enough tickets available");
      // }

      const tickets = [];
      if (event.availableTickets >= quantity) {
        for (let i = 0; i < quantity; i++) {
          tickets.push(
            await this.models.Ticket.create(
              {
                eventId,
                userId: user.id,
                status: "BOOKED",
              },
              { transaction }
            )
          );
        }

        event.availableTickets -= quantity;
        await event.save({ transaction });
        await transaction.commit();
        return { tickets, waitlisted: false };
      } else {
        const waitingEntry = await this.models.WaitingList.create(
          {
            eventId,
            userId: user.id,
            quantity,
            position: await this.getNextPosition(eventId),
          },
          { transaction }
        );
        await transaction.commit();
        return { waitingEntry, waitlisted: true };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cancelTicket(eventId, identifier) {
    const transaction = await this.models.sequelize.transaction();
    try {
      console.log({ eventId, identifier });

      const user = await this.models.User.findOne({
        where: { identifier },
        transaction,
      });

      if (!user) throw new Error("User not found");

      const ticket = await this.models.Ticket.findOne({
        where: { eventId, userId: user.id, status: "BOOKED" },
        lock: true,
        transaction,
      });

      if (!ticket) throw new Error("Ticket not found");

      const event = await this.models.Event.findByPk(eventId, {
        lock: true,
        transaction,
      });

      await this.processCancellation(ticket, event, transaction);
      await transaction.commit();
      return ticket;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getNextPosition(eventId) {
    return (await this.models.WaitingList.count({ where: { eventId } })) + 1;
  }

  async processCancellation(ticket, event, transaction) {
    ticket.status = "CANCELLED";
    await ticket.save({ transaction });

    event.availableTickets += 1;
    await event.save({ transaction });

    const nextInLine = await this.models.WaitingList.findOne({
      where: { eventId: event.id },
      order: [["position", "ASC"]],
      transaction,
    });

    if (nextInLine && event.availableTickets >= nextInLine.quantity) {
      // Process waiting list entry
      const newTickets = [];
      for (let i = 0; i < nextInLine.quantity; i++) {
        newTickets.push(
          await this.models.Ticket.create(
            {
              eventId: event.id,
              userId: nextInLine.userId,
              status: "BOOKED",
            },
            { transaction }
          )
        );
      }

      event.availableTickets -= nextInLine.quantity;
      await event.save({ transaction });
      await nextInLine.destroy({ transaction });

      // Update remaining positions
      await this.models.WaitingList.update(
        { position: literal("position - 1") },
        {
          where: {
            eventId: event.id,
            position: { [Op.gt]: nextInLine.position },
          },
          transaction,
        }
      );
    }
  }
}

module.exports = TicketService;
