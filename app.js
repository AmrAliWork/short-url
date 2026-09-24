const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const userRoute = require("./routes/usersRoute");
const urlRoute = require("./routes/urlsRoute");
const openRoute = require("./routes/openRoute");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();
const connectDB = require("./utils/db");

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "DEVELOPMENT")
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });
app.use(cors());

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

app.use("/users", userRoute);

app.use("/urls", urlRoute);

app.use("/open", openRoute);

app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

app.use(errorHandler);

module.exports = app;
