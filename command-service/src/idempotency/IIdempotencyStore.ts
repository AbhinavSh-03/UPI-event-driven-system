// Extract an interface and make both stores implement it.

export interface IIdempotencyStore {
  has(key: string): Promise<boolean>;
  get(key: string): Promise<string | null>;
  mark(key: string, value: string): Promise<void>;
}
