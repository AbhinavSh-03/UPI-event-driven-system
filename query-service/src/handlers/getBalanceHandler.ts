// query-service/src/handlers/getBalanceHandler.ts
export class GetBalanceHandler {
  constructor(private readonly repo: any) {}

  execute(accountId: string) {
    return { balance: this.repo.getBalance(accountId) };
  }
}
