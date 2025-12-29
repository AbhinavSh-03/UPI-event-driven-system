CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY,
  aggregate_id VARCHAR(64) NOT NULL,
  aggregate_type VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  version INT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (aggregate_id, version)
);
