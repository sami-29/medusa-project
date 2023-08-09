import { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authenticate, ConfigModule } from "@medusajs/medusa";
import { getConfigFile } from "medusa-core-utils";
import { attachStoreRoutes } from "./routes/store";
import { attachAdminRoutes } from "./routes/admin";
import { registerLoggedInUser } from "./middlewares/logged-in-user"; // Assuming this is the correct import path

export default (rootDirectory: string): Router | Router[] => {
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;

  const adminCorsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  const router = Router();

  router.use("/store", cors(adminCorsOptions), bodyParser.json());
  router.use("/admin", cors(adminCorsOptions), bodyParser.json());

  // Add authentication and registerLoggedInUser middleware to all admin routes *except* auth ones
  router.use(/\/admin\/[^(auth)].*/, authenticate(), registerLoggedInUser);

  const storeRouter = Router();
  const adminRouter = Router();

  router.use("/store", storeRouter);
  router.use("/admin", adminRouter);

  attachStoreRoutes(storeRouter);
  attachAdminRoutes(adminRouter);

  return router;
};
