import { BaseEvent } from "../../../shared/domain/events/payment.events";

export interface IEventRepository {
  getEventsByAggregateId(aggregateId: string): Promise<BaseEvent[]>;
  appendEvent(event: BaseEvent): Promise<void>;
  // for replay
  getAllEvents(): Promise<BaseEvent[]>;
}