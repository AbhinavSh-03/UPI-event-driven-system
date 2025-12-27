import express from "express";
import { routes } from "./routes";

const app = express();

// 🔒 REQUIRED to parse JSON bodies
app.use(express.json());

app.use("/", routes);

app.listen(3000, () => {
  console.log("🚀 API Gateway running on port 3000");
});