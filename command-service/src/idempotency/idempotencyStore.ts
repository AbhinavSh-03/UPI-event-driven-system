import { IIdempotencyStore } from "./IIdempotencyStore";

export class IdempotencyStore implements IIdempotencyStore {
  private processed = new Map<string, string>();

  async has(key: string): Promise<boolean> {
    return this.processed.has(key);
  }

  async get(key: string): Promise<string | null> {
    return this.processed.get(key) ?? null;
  }

  async mark(key: string, value: string): Promise<void> {
    this.processed.set(key, value);
  }
}


//replacable with redis later