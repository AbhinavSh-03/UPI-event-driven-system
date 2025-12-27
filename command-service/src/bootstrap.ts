import { InMemoryEventBus } from "./event-bus/inMemoryEventBus";
import { PaymentConsumer } from "../../event-consumers/src/paymentConsumer";
import { InMemoryEventRepository } from "./event-store/inMemoryEventRepository";
import { EventStore } from "./event-store/eventStore";
import { IdempotencyStore } from "./idempotency/idempotencyStore";
import { CommandHandler } from "./commands/commandHandler";

import { AccountBalanceProjection } from "../../event-consumers/src/projections/accountBalanceProjection";
import { TransactionHistoryProjection } from "../../event-consumers/src/projections/transactionHistoryProjection";

import { AccountReadRepository } from "../../query-service/src/repositories/accountReadRepository";
import { TransactionReadRepository } from "../../query-service/src/repositories/transactionReadRepository";

// infra
const eventBus = new InMemoryEventBus();
const eventRepo = new InMemoryEventRepository();
const eventStore = new EventStore(eventRepo);
const idempotencyStore = new IdempotencyStore();

// projections
export const balanceProjection = new AccountBalanceProjection();
export const transactionProjection = new TransactionHistoryProjection();

// read repositories ✅
export const accountReadRepository =
  new AccountReadRepository(balanceProjection);

export const transactionReadRepository =
  new TransactionReadRepository(transactionProjection);

// consumers
const paymentConsumer = new PaymentConsumer();

eventBus.subscribe(async (event) => {
  balanceProjection.handle(event);
  transactionProjection.handle(event);
  await paymentConsumer.handle(event);
});

// command handler
export const commandHandler = new CommandHandler(
  eventStore,
  idempotencyStore,
  eventBus
);
