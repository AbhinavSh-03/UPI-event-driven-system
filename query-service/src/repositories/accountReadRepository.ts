// query-service/src/repositories/accountReadRepository.ts
export class AccountReadRepository {
  constructor(private readonly projection: any) {}

  getBalance(accountId: string): number {
    return this.projection.getBalance(accountId);
  }
}
