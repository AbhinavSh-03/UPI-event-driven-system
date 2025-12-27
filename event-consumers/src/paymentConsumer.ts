import { BaseEvent } from "../../shared/domain/events/payment.events";

export class PaymentConsumer {
  async handle(event: BaseEvent): Promise<void> {
    switch (event.eventType) {
      case "PaymentInitiated":
        console.log("Payment initiated:", event.aggregateId);
        // later:
        // update read model
        // trigger debit
        break;

      case "AccountDebited":
        console.log("Account debited:", event.payload);
        break;

      case "PaymentCompleted":
        console.log("Payment completed:", event.aggregateId);
        break;
    }
  }
}
