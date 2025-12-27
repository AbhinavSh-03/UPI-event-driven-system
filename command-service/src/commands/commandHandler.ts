import { EventStore } from "../event-store/eventStore";
import { IdempotencyStore } from "../idempotency/idempotencyStore";
import { CommandValidator } from "./commandValidator";
import { InitiatePaymentCommand } from "../../../shared/domain/commands/payment.commands";
import { PaymentAggregate } from "../../../shared/domain/aggregates/payment.aggregates";
import { IEventBus } from "../event-bus/IEventBus";

export class CommandHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly idempotencyStore: IdempotencyStore,
    private readonly eventBus: IEventBus
  ) {}

  async handleInitiatePayment(
    command: InitiatePaymentCommand,
    idempotencyKey: string
  ): Promise<string> {

    // Idempotency check
    if (this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)!;
    }

    // Validate command
    CommandValidator.validateInitiatePayment(command);

    // Load past events
    const pastEvents = await this.eventStore.loadEvents(
      command.payload.paymentId
    );

    // Rehydrate aggregate
    const payment = new PaymentAggregate(pastEvents);

    // Decide new event
    const event = payment.initiatePayment(command.payload);

    // Append event
    await this.eventStore.append([event]);

    // Publish event
    await this.eventBus.publish([event]);

    // Mark idempotency AFTER successful append
    this.idempotencyStore.mark(idempotencyKey,command.payload.paymentId);

    return command.payload.paymentId;
  }
}
