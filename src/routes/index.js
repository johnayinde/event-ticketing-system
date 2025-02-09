const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../utils/validator");
const { EventService, TicketService } = require("../services");

module.exports = (models) => {
  const eventService = new EventService(models);
  const ticketService = new TicketService(models);

  router.post(
    "/initialize",
    validate(schemas.eventInitialize),
    async (req, res, next) => {
      try {
        const event = await eventService.initializeEvent(req.body);
        res.status(201).json(event);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post("/book", validate(schemas.bookTicket), async (req, res, next) => {
    try {
      const result = await ticketService.bookTicket(
        req.body.eventId,
        req.body.identifier,
        req.body.quantity
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/cancel",
    validate(schemas.cancelTicket),
    async (req, res, next) => {
      try {
        const result = await ticketService.cancelTicket(
          req.body.eventId,
          req.body.identifier
        );
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/status/:eventId", async (req, res, next) => {
    try {
      const status = await eventService.getEventStatus(req.params.eventId);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
