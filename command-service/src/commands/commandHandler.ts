import { EventStore } from "../event-store/eventStore";
import { IdempotencyStore } from "../idempotency/idempotencyStore";
import { CommandValidator } from "./commandValidator";
import { InitiatePaymentCommand } from "../../../shared/domain/commands/payment.commands";
import { PaymentAggregate } from "../../../shared/domain/aggregates/payment.aggregates";

export class CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly idempotencyStore: IdempotencyStore
  ) {}

  async handleInitiatePayment(
    command: InitiatePaymentCommand,
    idempotencyKey: string
  ): Promise<string> {

    // 1️⃣ Idempotency check
    if (this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)!;
    }

    // 2️⃣ Validate command
    CommandValidator.validateInitiatePayment(command);

    // 3️⃣ Load past events
    const pastEvents = await this.eventStore.loadEvents(
      command.payload.paymentId
    );

    // 4️⃣ Rehydrate aggregate
    const payment = new PaymentAggregate(pastEvents);

    // 5️⃣ Decide new event
    const event = payment.initiatePayment(command.payload);

    // 6️⃣ Append event
    await this.eventStore.append([event]);

    // 7️⃣ Mark idempotency AFTER successful append
    this.idempotencyStore.mark(
      idempotencyKey,
      command.payload.paymentId
    );

    return command.payload.paymentId;
  }
}
