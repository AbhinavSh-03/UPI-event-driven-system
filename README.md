# UPI Event-Driven Payment System

This project is a **UPI-like payment system** built using **Event-Driven Architecture**,  
**CQRS**, and **Event Sourcing** principles.

## Architecture Overview

- API Gateway routes requests to Command / Query services
- Command Service handles writes and emits domain events
- Events are published to a message broker
- Query Service builds read models from events
- Event Consumers build projections and trigger side effects


## Folder Structure

upi-event-driven-system/
├── docs/ # Architecture docs and design decisions
├── shared/ # Domain contracts (events, commands)
├── command-service/ # Write side (CQRS)
├── query-service/ # Read side (CQRS)
├── event-consumers/ # Projection builders and async handlers


## Status

🚧 **Work in progress**  
Currently setting up domain contracts and service boundaries.