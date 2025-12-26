// shared/domain/commands/payment.commands.ts

export interface BaseCommand {
  commandId: string;
  aggregateId: string;   // paymentId
  timestamp: string;
}

/**
 * Client-facing command
 */
export interface InitiatePaymentCommand extends BaseCommand {
  commandType: "InitiatePayment";
  payload: {
    paymentId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: "INR";
  };
}

/**
 * Internal command
 */
export interface DebitAccountCommand extends BaseCommand {
  commandType: "DebitAccount";
  payload: {
    accountId: string;
    paymentId: string;
    amount: number;
  };
}

export interface CreditAccountCommand extends BaseCommand {
  commandType: "CreditAccount";
  payload: {
    accountId: string;
    paymentId: string;
    amount: number;
  };
}

export interface FailPaymentCommand extends BaseCommand {
  commandType: "FailPayment";
  payload: {
    paymentId: string;
    reason: string;
  };
}
