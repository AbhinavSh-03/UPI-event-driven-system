import { Pool } from "pg";
import {
  BaseEvent,
  AggregateType
} from "../../../shared/domain/events/payment.events";
import { IEventRepository } from "./IEventRepository";

type EventRow = {
  event_id: string;
  aggregate_id: string;
  aggregate_type: AggregateType;
  event_type: string;
  version: number;
  payload: unknown;
  created_at: Date;
};

export class PostgresEventRepository implements IEventRepository {
  constructor(private readonly pool: Pool) {}

  async getEventsByAggregateId(
    aggregateId: string
  ): Promise<BaseEvent[]> {
    const result = await this.pool.query<EventRow>(
      `SELECT event_id,
              aggregate_id,
              aggregate_type,
              event_type,
              version,
              payload,
              created_at
       FROM events
       WHERE aggregate_id = $1
       ORDER BY version ASC`,
      [aggregateId]
    );

    return result.rows.map((row): BaseEvent => ({
      eventId: row.event_id,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      eventType: row.event_type,
      version: row.version,
      payload: row.payload,
      timestamp: row.created_at.toISOString()
    }));
  }

  async getAllEvents(): Promise<BaseEvent[]> {
  const result = await this.pool.query<EventRow>(
    `SELECT event_id,
            aggregate_id,
            aggregate_type,
            event_type,
            version,
            payload,
            created_at
     FROM events
     ORDER BY created_at ASC`
  );

  return result.rows.map(row => ({
    eventId: row.event_id,
    aggregateId: row.aggregate_id,
    aggregateType: row.aggregate_type,
    eventType: row.event_type,
    version: row.version,
    payload: row.payload,
    timestamp: row.created_at.toISOString()
  }));
}


  async appendEvent(event: BaseEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO events
       (event_id,
        aggregate_id,
        aggregate_type,
        event_type,
        version,
        payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        event.eventId,
        event.aggregateId,
        event.aggregateType,
        event.eventType,
        event.version,
        event.payload
      ]
    );
  }
}
