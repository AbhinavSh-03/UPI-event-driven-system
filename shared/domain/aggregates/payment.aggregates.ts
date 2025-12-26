import {
  PaymentInitiated,
  PaymentCompleted,
  PaymentFailed
} from "../events/payment.events";
import { BaseEvent } from "../events/payment.events";

type PaymentEvent =
  | PaymentInitiated
  | PaymentCompleted
  | PaymentFailed;

export class PaymentAggregate {
  private paymentId!: string;
  private status:
    | "NOT_STARTED"
    | "INITIATED"
    | "COMPLETED"
    | "FAILED" = "NOT_STARTED";

  constructor(eventHistory: BaseEvent[] = []) {
    eventHistory.forEach(event => {
      if (event.aggregateType === "PAYMENT") {
        this.apply(event as PaymentEvent);
      }
    });
  }

  initiatePayment(command: {
    paymentId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }): PaymentInitiated {
    if (this.status !== "NOT_STARTED") {
      throw new Error("Payment already initiated");
    }

    return {
      eventId: crypto.randomUUID(),
      aggregateId: command.paymentId,
      aggregateType: "PAYMENT",
      eventType: "PaymentInitiated",
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        paymentId: command.paymentId,
        fromAccountId: command.fromAccountId,
        toAccountId: command.toAccountId,
        amount: command.amount,
        currency: "INR"
      }
    };
  }

  completePayment(): PaymentCompleted {
    if (this.status !== "INITIATED") {
      throw new Error("Payment cannot be completed");
    }

    return {
      eventId: crypto.randomUUID(),
      aggregateId: this.paymentId,
      aggregateType: "PAYMENT",
      eventType: "PaymentCompleted",
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        paymentId: this.paymentId,
        status: "SUCCESS"
      }
    };
  }

  failPayment(reason: string): PaymentFailed {
    if (this.status === "COMPLETED") {
      throw new Error("Completed payment cannot fail");
    }

    return {
      eventId: crypto.randomUUID(),
      aggregateId: this.paymentId,
      aggregateType: "PAYMENT",
      eventType: "PaymentFailed",
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        paymentId: this.paymentId,
        reason
      }
    };
  }

  private apply(event: PaymentEvent) {
    switch (event.eventType) {
      case "PaymentInitiated":
        this.paymentId = event.aggregateId;
        this.status = "INITIATED";
        break;
      case "PaymentCompleted":
        this.status = "COMPLETED";
        break;
      case "PaymentFailed":
        this.status = "FAILED";
        break;
    }
  }
}
