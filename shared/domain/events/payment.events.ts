// shared/domain/events/payment.events.ts
export type AggregateType = "PAYMENT" | "ACCOUNT";

export interface BaseEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: AggregateType;
  eventType: string;
  timestamp: string;
  version: number;
  payload: unknown;
}

/**
 * Payment lifecycle starts here
 */
export interface PaymentInitiated extends BaseEvent {
  eventType: "PaymentInitiated";
  payload: {
    paymentId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: "INR";
  };
}

export interface AccountDebited extends BaseEvent {
  eventType: "AccountDebited";
  payload: {
    accountId: string;
    amount: number;
    balanceAfterDebit: number;
  };
}

export interface AccountCredited extends BaseEvent {
  eventType: "AccountCredited";
  payload: {
    accountId: string;
    amount: number;
    balanceAfterCredit: number;
  };
}

export interface PaymentCompleted extends BaseEvent {
  eventType: "PaymentCompleted";
  payload: {
    paymentId: string;
    status: "SUCCESS";
  };
}

export interface PaymentFailed extends BaseEvent {
  eventType: "PaymentFailed";
  payload: {
    paymentId: string;
    reason: string;
  };
}
