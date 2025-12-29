
---

# Deployment Guide (Docker + AWS EC2)

This document describes how to deploy the **UPI Event-Driven Payment System**
using **Docker Compose**, both locally and on **AWS EC2**.

> **Note**  
> The EC2 instance used during initial verification and testing is **no longer running**.
> The steps below describe a **reproducible deployment process** that can be executed
> on any new EC2 instance at any time.

---

## Deployment Model

- **Single runtime container**
  - API Gateway (imports command, query, and projection modules as libraries)
- **Supporting infrastructure containers**
  - PostgreSQL (Event Store)
  - Redis (Idempotency)

All services communicate using **Docker internal networking** (Docker DNS),
not `localhost`.

---

## Prerequisites

### Local / EC2 Requirements

- Docker
- Docker Compose
- Git

### AWS EC2 Requirements

- OS: **Ubuntu 22.04 LTS**
- Instance type: `t2.micro` (or equivalent)
- Security Group rules:
  - SSH (22) → your IP
  - TCP (3000) → `0.0.0.0/0`

---

## Environment Configuration

Create a `.env` file in the project root:

```env
API_PORT=3000

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=upi_event_store
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres (your superuser password)

REDIS_HOST=redis
REDIS_PORT=6379

NODE_ENV=production
````

---

## Local Deployment (Docker Compose)

### Steps

```bash
git clone <repository-url>
cd upi-event-driven-system
docker compose up -d --build
```

### Verification

* Health check:

  ```
  GET http://localhost:3000/health
  ```
* Command endpoint:

  ```
  POST http://localhost:3000/payments
  ```

---

## PostgreSQL Initialization

* Event store schema is defined in `db/init.sql`
* Automatically executed on first container startup
* No manual database setup required

The database is **append-only** and persists across container restarts.

---

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

* Ubuntu 22.04 LTS
* Instance type: `t2.micro` (Free Tier compatible)

---

### Step 2: Install Docker

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

---

### Step 3: Deploy the Application

```bash
git clone <repository-url>
cd upi-event-driven-system
docker compose up -d --build
```

---

## Verifying the Deployment

### Health Check

```bash
curl http://<EC2_PUBLIC_IP>:3000/health
```

### Test Command (Idempotency Verified)

```bash
curl -X POST http://<EC2_PUBLIC_IP>:3000/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-1" \
  -d '{
    "paymentId": "p-test-1",
    "fromAccountId": "a1",
    "toAccountId": "a2",
    "amount": 100
  }'
```

Repeating the same request with the same idempotency key
returns the same result without creating duplicate events.

---

## Restart and Persistence

* PostgreSQL data persists across restarts
* Redis maintains idempotency keys (TTL-based)
* Services are stateless and safe to restart

```bash
docker compose restart
```

---

## Operational Notes

* The system does **not depend on a permanently running EC2 instance**
* Any new instance can be provisioned and deployed using the steps above
* This ensures reproducibility and avoids environment lock-in

---

## Summary

This deployment strategy provides:

* Reproducible environments
* Cloud portability
* Safe restarts
* Minimal operational overhead

The system has been **previously deployed and verified on AWS EC2**, and
can be redeployed at any time using the documented steps.

```

