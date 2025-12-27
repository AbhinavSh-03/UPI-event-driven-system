import { IEventBus } from "./IEventBus";
import { BaseEvent } from "../../../shared/domain/events/payment.events";

export class InMemoryEventBus implements IEventBus {
  private handlers: Array<(event: BaseEvent) => Promise<void>> = [];

  async publish(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      for (const handler of this.handlers) {
        await handler(event);
      }
    }
  }

  subscribe(handler: (event: BaseEvent) => Promise<void>): void {
    this.handlers.push(handler);
  }
}
