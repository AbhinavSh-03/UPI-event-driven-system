import { InitiatePaymentCommand } from "../../../shared/domain/commands/payment.commands";

export class CommandValidator {
  static validateInitiatePayment(cmd: InitiatePaymentCommand) {
    if (!cmd.payload.paymentId) {
      throw new Error("paymentId is required");
    }
    if (cmd.payload.amount <= 0) {
      throw new Error("amount must be greater than zero");
    }
    if (cmd.payload.fromAccountId === cmd.payload.toAccountId) {
      throw new Error("cannot transfer to same account");
    }
  }
}
