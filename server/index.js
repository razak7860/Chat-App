const express = require("express");
const app = express();
const connectDB = require("./utils/dbConnect");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const PORT = 4000;
const userRoutes = require("./routes/userRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// const socketIO = require("socket.io")(http, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });
// Initialize environment variables
dotenv.config();
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:3000", // React's port
  credentials: true, // Allows cookies to be sent
};

app.use(cors(corsOptions));
app.use(cookieParser());
connectDB();

// WebSocket setup
const server = http.createServer(app);
const socketIO = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = [];

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("message", (data) => {
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  socket.on("newUser", (data) => {
    users.push(data);
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

// API Routes
app.use("/api/users", userRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
