export class IdempotencyStore {
  private processed = new Map<string, string>(); 
  // idempotencyKey → paymentId

  has(key: string): boolean {
    return this.processed.has(key);
  }

  get(key: string): string | undefined {
    return this.processed.get(key);
  }

  mark(key: string, aggregateId: string): void {
    this.processed.set(key, aggregateId);
  }
}

//replacable with redis later