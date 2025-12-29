# Architecture Overview

This system is a **UPI-style event-driven payments backend** built using **CQRS and Event Sourcing** principles.  
It is designed for **correctness, replayability, and failure recovery**, rather than direct state mutation.

---

## Core Architectural Principles

- **Events are immutable**
  - Events are **never edited or deleted**
  - Any new behavior results in **new events**
- **Services never modify past events**
- **State is derived**
  - System state is reconstructed by replaying events
- **Clear write/read separation**
  - Commands change state
  - Queries read derived projections
- **Stateless services**
  - All services can restart safely without data loss

---

## High-Level System Flow

Client
↓
API Gateway
↓
Command Service
↓
Event Store (PostgreSQL)
↓
Event Bus
↓
Consumers / Projections
↓
Read Models

---

## Components

### API Gateway

- Single entry point for all client requests
- Responsibilities:
  - Request validation
  - Idempotency enforcement
  - Rate limiting
  - Routing commands and queries
- Does **not** contain business logic

---

### Command Service (Write Side)

- Handles all **state-changing requests**
- Stateless and idempotent
- Never returns derived state

---

### Event Store

- PostgreSQL used as an **append-only event store**
- Guarantees:
  - Events are written once
  - Strict ordering per aggregate
  - Optimistic concurrency via versioning
- Source of truth for the system

---

### Event Bus

- Delivers events to consumers
- Currently implemented as an **in-memory event bus**
- Designed to be replaceable with Kafka/RabbitMQ without changing business logic

---

### Consumers & Projections (Read Side)

- Consume events emitted by the command service
- Build **denormalized read models**
- Replay-safe and idempotent
- Can be rebuilt at any time by replaying events

---

### Read Models

- Optimized for fast queries
- No business logic
- Fully derived from events

---

## Command Flow (Write Path)

1. Client sends an `InitiatePayment` command
2. API Gateway validates request and checks idempotency
3. Command Service loads past events for the aggregate
4. Payment Aggregate reconstructs state from event history
5. Aggregate decides the next event (`PaymentInitiated`)
6. Event is appended to the Event Store
7. Event is published to the Event Bus
8. Consumers react to the event asynchronously

Command → Aggregate → Event → Store → Publish



## Event-Driven State Transitions

- Events represent **facts that already happened**
- State transitions occur only through events
- Future behavior (e.g., debit/credit) will be driven by consuming existing events

Example:

PaymentInitiated
↓
(AccountDebited) [future]
↓
(AccountCredited) [future]
↓
PaymentCompleted

---

## Read Flow (Query Path)

1. Client issues a query (e.g., account balance)
2. API Gateway routes request to Query Service
3. Query Service reads from pre-computed projections
4. Response is returned immediately

Query → Read Model → Response


---

## Failure Recovery & Replay

- Services are **stateless**
- On restart:
  - Event store remains intact
  - Projections are rebuilt by replaying events
- System guarantees:
  - No data loss
  - Deterministic recovery
  - Exactly-once logical processing

---

## Deployment Model

- Deployed using **Docker Compose**
- Single runtime container (API Gateway)
- Infrastructure:
  - PostgreSQL (Event Store)
  - Redis (Idempotency)
- Successfully deployed on **AWS EC2**
- Cloud-portable with no code changes

---

## What Is Intentionally Not Implemented (Yet)

- Account debit/credit execution
- External bank integrations
- Message queue (Kafka/RabbitMQ)
- Payment settlement completion

These are deliberately deferred to keep **architectural correctness** and avoid premature coupling.

---

## Architectural Guarantees

- Idempotent writes
- Replayable state
- No hidden side effects
- Clear separation of concerns
- Safe restarts
- Cloud-ready deployment

---

## Summary

This architecture prioritizes **correctness over convenience**, ensuring that every state transition is traceable, reproducible, and resilient to failures — exactly what is required for financial systems.