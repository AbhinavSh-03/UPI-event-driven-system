# Failure Handling, Retries, and Recovery

This document explains how the **UPI Event-Driven Payment System** handles
failures, retries, and recovery using **CQRS** and **Event Sourcing**.

The system is designed so that **failures do not corrupt state** and
**services can restart safely**.

---

## Design Goals

- No data loss
- Safe retries from clients
- Deterministic recovery after crashes
- No partial or hidden state mutations
- Clear separation between write and read failures

---

## Failure Categories

The system handles failures at different layers:

1. Client retries
2. API Gateway failures
3. Command processing failures
4. Projection (read-model) failures
5. Service restarts and crashes

Each is handled differently.

---

## Client Retries (Idempotency)

### Problem
Clients may retry requests due to:
- Network timeouts
- Client crashes
- Uncertain responses

Without protection, retries could cause **duplicate payments**.

### Solution: Idempotency Keys

- Every write request includes an **Idempotency-Key**
- The API Gateway checks Redis before processing
- If the key already exists:
  - The previous result is returned
  - No new command is executed

### Guarantees

- Same request + same key → same result
- No duplicate events
- Safe client retries

---

## Command Failures (Write Side)

### When Can a Command Fail?

- Validation errors
- Business rule violations
- Database write failures

### Behavior

- If an event is **not appended** to the event store:
  - The command is considered failed
  - No state change occurs
- Partial execution is impossible because:
  - State is only changed by appending events

### Important Property

> **No event = no state change**

---

## Event Store Reliability

The PostgreSQL event store is the **single source of truth**.

### Guarantees

- Append-only writes
- No UPDATE or DELETE operations
- Strict ordering per aggregate
- Events are immutable once written

If the event store is unavailable:
- Commands fail immediately
- Clients can safely retry later

---

## Projection Failures (Read Side)

### Problem
Projection consumers may fail due to:
- Crashes
- Bugs
- Temporary resource issues

### Solution

- Projections are **derived data**
- They can be:
  - Rebuilt
  - Replayed
  - Discarded safely

### Behavior

- Event store remains intact
- Failed projections do not affect write-side correctness
- Consumers can resume processing events

---

## Replay and Rebuild

### What Is Replay?

Replay means:
- Reading all events from the event store
- Rebuilding aggregates or projections deterministically

### When Replay Is Used

- Service restart
- Projection schema change
- Data corruption in read models
- Debugging or auditing

### Guarantee

> Replaying the same events always produces the same state.

---

## Service Crashes and Restarts

### Stateless Services

All services are stateless:
- API Gateway
- Command Service
- Projection Consumers
- Query Service

### On Restart

- Services reconnect to Postgres and Redis
- No in-memory state is required
- Event store remains untouched
- Projections resume or rebuild

---

## Exactly-Once Logical Processing

While the system does not claim *exactly-once delivery* at the transport level,
it guarantees:

- **Exactly-once logical effects**
- No duplicate state changes
- Deterministic outcomes

This is achieved through:
- Idempotency
- Event immutability
- Replayable state

---

## Summary

This system is resilient by design:

- Failures do not corrupt data
- Retries are safe
- Restarts are predictable
- State is always reconstructable

These properties are critical for **financial systems**, where correctness
is more important than raw throughput.
