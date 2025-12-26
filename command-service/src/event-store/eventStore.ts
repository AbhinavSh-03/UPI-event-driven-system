import { IEventRepository } from "./IEventRepository";
import { BaseEvent } from "../../../shared/domain/events/payment.events";

export class EventStore {
  constructor(private readonly repository: IEventRepository) {}

  async loadEvents(aggregateId: string): Promise<BaseEvent[]> {
    return this.repository.getEventsByAggregateId(aggregateId);
  }

  async append(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.repository.appendEvent(event);
    }
  }
}
