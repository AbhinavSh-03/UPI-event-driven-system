import { BaseEvent } from "../../../shared/domain/events/payment.events";

export class TransactionHistoryProjection {
  private history = new Map<string, any[]>();

  handle(event: BaseEvent) {
    switch (event.eventType) {
      case "PaymentInitiated":
      case "PaymentCompleted":
      case "PaymentFailed": {
        const list = this.history.get(event.aggregateId) ?? [];

        list.push({
          type: event.eventType,
          timestamp: event.timestamp,
          payload: event.payload
        });

        this.history.set(event.aggregateId, list);
        break;
      }
    }
  }

  getTransactions(paymentId: string) {
    return this.history.get(paymentId) ?? [];
  }
}
