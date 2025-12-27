// query-service/src/repositories/transactionReadRepository.ts
import { TransactionHistoryProjection } from "../../../event-consumers/src/projections/transactionHistoryProjection";

export class TransactionReadRepository {
  constructor(
    private readonly projection: TransactionHistoryProjection
  ) {}

  getTransactions(paymentId: string) {
    return this.projection.getTransactions(paymentId);
  }
}
