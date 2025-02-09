class WaitingListService {
  constructor(models) {
    this.models = models;
  }

  async getNextPosition(eventId) {
    return (await this.models.WaitingList.count({ where: { eventId } })) + 1;
  }
  async getWaitingListCount(eventId) {
    return await this.models.WaitingList.count({ where: { eventId } });
  }
}
module.exports = WaitingListService;
