// server.js
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");

app.set("trust proxy", true);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // allow all for testing / RN
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // only websocket
  pingInterval: 25000,
  pingTimeout: 60000,
});

app.set("io", io);

global.connectedUsers = {};

// Socket connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register-user", (linkId, role, municipalityId) => {
    global.connectedUsers[linkId] = { socketId: socket.id, role, municipalityId };
    console.log(`Registered ${role} (${linkId}) => ${socket.id}`);
  });

  // Notify all admins/officers in same municipality about new incident
  socket.on("incident:new", (report) => {
    const { municipalityId } = report;
    for (const userId in global.connectedUsers) {
      const user = global.connectedUsers[userId];
      if (user.municipalityId === municipalityId && (user.role === "admin" || user.role === "officer")) {
        io.to(user.socketId).emit("incident:new", report);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (const linkId in global.connectedUsers) {
      if (global.connectedUsers[linkId].socketId === socket.id) {
        delete global.connectedUsers[linkId];
        break;
      }
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.CONN_STR)
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
