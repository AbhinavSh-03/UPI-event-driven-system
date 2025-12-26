import {
  AccountDebited,
  AccountCredited,
  BaseEvent
} from "../events/payment.events";

type AccountEvent =
  | AccountDebited
  | AccountCredited;

export class AccountAggregate {
  private accountId!: string;
  private balance: number = 0;

  constructor(eventHistory: BaseEvent[] = []) {
    eventHistory.forEach(event => {
      if (event.aggregateType === "ACCOUNT") {
        this.apply(event as AccountEvent);
      }
    });
  }

  debit(command: {
    accountId: string;
    amount: number;
  }): AccountDebited {
    if (this.balance < command.amount) {
      throw new Error("Insufficient balance");
    }

    return {
      eventId: crypto.randomUUID(),
      aggregateId: command.accountId,
      aggregateType: "ACCOUNT",
      eventType: "AccountDebited",
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        accountId: command.accountId,
        amount: command.amount,
        balanceAfterDebit: this.balance - command.amount
      }
    };
  }

  credit(command: {
    accountId: string;
    amount: number;
  }): AccountCredited {
    return {
      eventId: crypto.randomUUID(),
      aggregateId: command.accountId,
      aggregateType: "ACCOUNT",
      eventType: "AccountCredited",
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        accountId: command.accountId,
        amount: command.amount,
        balanceAfterCredit: this.balance + command.amount
      }
    };
  }

  private apply(event: AccountEvent) {
    switch (event.eventType) {
      case "AccountDebited":
        this.accountId = event.aggregateId;
        this.balance = event.payload.balanceAfterDebit;
        break;

      case "AccountCredited":
        this.accountId = event.aggregateId;
        this.balance = event.payload.balanceAfterCredit;
        break;
    }
  }
}
