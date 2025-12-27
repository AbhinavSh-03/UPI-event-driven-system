import { BaseEvent } from "../../../shared/domain/events/payment.events";

export interface IEventBus {
  publish(events: BaseEvent[]): Promise<void>;
  subscribe(
    handler: (event: BaseEvent) => Promise<void>
  ): void;
}
