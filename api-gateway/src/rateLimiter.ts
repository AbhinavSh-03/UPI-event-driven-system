import { Request, Response, NextFunction } from "express";

const requests = new Map<string, number>();

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Normalize IP (req.ip can be undefined)
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
  const count = requests.get(key) ?? 0;

  if (count >= 10) {
    return res.status(429).json({ error: "Too many requests" });
  }

  requests.set(key, count + 1);

  setTimeout(() => {
    requests.set(key, (requests.get(key) ?? 1) - 1);
  }, 1000);

  next();
}
