Events are never edited or deleted
New behavior → new event
Services never modify past events
State = replay(events)


## Command Flow

1. Client sends InitiatePayment command
2. Command Service validates request
3. Payment Aggregate decides next event
4. Events are appended to Event Store
5. Events drive further state transitions