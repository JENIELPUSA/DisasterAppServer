const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const path = require("path");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const AdminRoute = require("./Routes/AdminRoute");
const Notification = require("./Routes/NotificationRoute");
const Logs = require("./Routes/LogsRoute");
const authentic = require("./Routes/authRouter");
const Organizer = require("./Routes/OrganizerRoute");
const Evacuation = require("./Routes/EvacuationRoute");
const Barangay = require("./Routes/BarangayRoute");
const HouseholdLead = require("./Routes/HouseholdLead");

let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.set("trust proxy", true);

app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONN_STR,
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);
app.use(
  cors({
     origin: true,
    //origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(ErrorController);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/authentication", authentic);
app.use("/api/v1/Admin", AdminRoute);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/LogsAudit", Logs);
app.use("/api/v1/Organizer", Organizer);
app.use("/api/v1/Evacuation", Evacuation);
app.use("/api/v1/Barangay", Barangay);
app.use("/api/v1/HouseholdLead", HouseholdLead);

app.use(ErrorController);

module.exports = app;
