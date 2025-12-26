//Use InMemoryEventRepository now
//Add PostgresEventRepository later
//Swap via dependency injection

import { BaseEvent } from "../../../shared/domain/events/payment.events";
import { IEventRepository } from "./IEventRepository";

export class InMemoryEventRepository implements IEventRepository {
  private events: BaseEvent[] = [];

  async getEventsByAggregateId(aggregateId: string): Promise<BaseEvent[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId)
      .sort((a, b) => a.version - b.version);
  }

  async appendEvent(event: BaseEvent): Promise<void> {
    const conflict = this.events.find(
      e =>
        e.aggregateId === event.aggregateId &&
        e.version === event.version
    );

    if (conflict) {
      throw new Error("Optimistic lock failure");
    }

    this.events.push(event);
  }
}

