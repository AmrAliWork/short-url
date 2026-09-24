const mongoose = require("mongoose");

require("dotenv").config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected");

    const server = app.listen(port, () => {
      console.log(`The server starts listening on port ${port}`);
    });

    const shutdown = (exitCode) => {
      const forceShutdown = setTimeout(() => {
        console.error("Graceful shutdown timed out. Forcing shutdown...");
        process.exit(1);
      }, 5000);

      server.close(async () => {
        try {
          await mongoose.disconnect();
          clearTimeout(forceShutdown);
          process.exit(exitCode);
        } catch (err) {
          clearTimeout(forceShutdown);
          console.error("Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => {
      shutdown(0);
    });

    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION! Shutting down...");
      console.error(err);
      shutdown(1);
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(err);
      shutdown(1);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
