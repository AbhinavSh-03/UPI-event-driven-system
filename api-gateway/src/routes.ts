import express, { Request, Response } from "express";
import crypto from "crypto";

import { rateLimiter } from "./rateLimiter";
import {
  commandHandler,
  accountReadRepository,
  transactionReadRepository
} from "../../command-service/src/bootstrap";

import { GetBalanceHandler } from "../../query-service/src/handlers/getBalanceHandler";
import { GetTransactionHandler } from "../../query-service/src/handlers/getTransactionHandler";

export const routes = express.Router();

// Query handlers
const getBalanceHandler = new GetBalanceHandler(accountReadRepository);
const getTransactionHandler = new GetTransactionHandler(transactionReadRepository);

//
// WRITE SIDE — COMMANDS
//
routes.post(
  "/payments",
  rateLimiter,
  async (req: Request, res: Response) => {
    const rawKey = req.headers["idempotency-key"];

    if (typeof rawKey !== "string") {
      return res
        .status(400)
        .json({ error: "Idempotency-Key header is required" });
    }

    const paymentId = await commandHandler.handleInitiatePayment(
      {
        commandId: crypto.randomUUID(),
        aggregateId: req.body.paymentId,
        commandType: "InitiatePayment",
        timestamp: new Date().toISOString(),
        payload: req.body
      },
      rawKey
    );

    return res.status(202).json({ paymentId });
  }
);

//
// READ SIDE — QUERIES
//
routes.get(
  "/accounts/:id/balance",
  rateLimiter,
  (req: Request, res: Response) => {
    return res.json(
      getBalanceHandler.execute(req.params.id)
    );
  }
);

routes.get(
  "/payments/:id/history",
  rateLimiter,
  (req: Request, res: Response) => {
    return res.json(
      getTransactionHandler.execute(req.params.id)
    );
  }
);
