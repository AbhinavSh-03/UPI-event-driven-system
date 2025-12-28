import express from "express";
import { routes } from "./routes";
import { initCommandService } from "../../command-service/src/bootstrap";

async function startServer() {
  const app = express();

  // 🔒 REQUIRED to parse JSON bodies
  app.use(express.json());

  // Routes
  app.use("/", routes);

  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
  });
}

// 🔥 Bootstrap infra FIRST, then start server
initCommandService()
  .then(startServer)
  .catch((err) => {
    console.error("❌ Failed to start API Gateway", err);
    process.exit(1);
  });
