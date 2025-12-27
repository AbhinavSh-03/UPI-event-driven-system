export class GetTransactionHandler {
  constructor(private readonly repo: {
    getTransactions: (id: string) => any[];
  }) {}

  execute(paymentId: string) {
    return this.repo.getTransactions(paymentId);
  }
}