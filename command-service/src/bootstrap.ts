import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});
import { InMemoryEventBus } from "./event-bus/inMemoryEventBus";
import { PaymentConsumer } from "../../event-consumers/src/paymentConsumer";

import { EventStore } from "./event-store/eventStore";
import { RedisIdempotencyStore } from "./idempotency/redisIdempotencyStore";
import { CommandHandler } from "./commands/commandHandler";

import { Pool } from "pg";
import { PostgresEventRepository } from "./event-store/postgresEventRepository";

import { AccountBalanceProjection } from "../../event-consumers/src/projections/accountBalanceProjection";
import { TransactionHistoryProjection } from "../../event-consumers/src/projections/transactionHistoryProjection";

import { AccountReadRepository } from "../../query-service/src/repositories/accountReadRepository";
import { TransactionReadRepository } from "../../query-service/src/repositories/transactionReadRepository";

// ---------- DB ----------
const pool = new Pool({
  host: process.env.POSTGRES_HOST!,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!
});


// ---------- exports (late init) ----------
export let commandHandler: CommandHandler;
export let accountReadRepository: AccountReadRepository;
export let transactionReadRepository: TransactionReadRepository;
export let balanceProjection: AccountBalanceProjection;
export let transactionProjection: TransactionHistoryProjection;

// ---------- init ----------
export async function initCommandService() {
  // infra
  const eventBus = new InMemoryEventBus();
  const eventRepo = new PostgresEventRepository(pool);
  const eventStore = new EventStore(eventRepo);

  const idempotencyStore = new RedisIdempotencyStore();
  await idempotencyStore.connect();

  // projections (CREATE FIRST)
  balanceProjection = new AccountBalanceProjection();
  transactionProjection = new TransactionHistoryProjection();

  // read repositories (MUST use same projection instances)
  accountReadRepository = new AccountReadRepository(balanceProjection);
  transactionReadRepository = new TransactionReadRepository(transactionProjection);

  // REPLAY STEP
  const allEvents = await eventStore.loadAllEvents();
  for (const event of allEvents) {
    balanceProjection.handle(event);
    transactionProjection.handle(event);
  }
  // END REPLAY

  // consumers (for NEW events only)
  const paymentConsumer = new PaymentConsumer();
  eventBus.subscribe(async (event) => {
    balanceProjection.handle(event);
    transactionProjection.handle(event);
    await paymentConsumer.handle(event);
  });

  // command handler
  commandHandler = new CommandHandler(
    eventStore,
    idempotencyStore,
    eventBus
  );
}
