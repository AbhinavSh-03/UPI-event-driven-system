import { BaseEvent } from "../../../shared/domain/events/payment.events";

export class AccountBalanceProjection {
  private balances = new Map<string, number>();

  handle(event: BaseEvent) {
    switch (event.eventType) {
      case "AccountDebited": {
        const payload = event.payload as {
          accountId: string;
          balanceAfterDebit: number;
        };

        this.balances.set(payload.accountId, payload.balanceAfterDebit);
        break;
      }

      case "AccountCredited": {
        const payload = event.payload as {
          accountId: string;
          balanceAfterCredit: number;
        };

        this.balances.set(payload.accountId, payload.balanceAfterCredit);
        break;
      }
    }
  }

  getBalance(accountId: string): number {
    return this.balances.get(accountId) ?? 0;
  }
}
