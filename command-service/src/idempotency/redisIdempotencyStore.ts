import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

import { createClient } from "redis";
import { IIdempotencyStore } from "./IIdempotencyStore";


export class RedisIdempotencyStore implements IIdempotencyStore {
  private client = createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379
    }
  });

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async mark(
    key: string,
    value: string,
    ttlSeconds = 3600
  ): Promise<void> {
    await this.client.set(key, value, {
      EX: ttlSeconds
    });
  }
}
