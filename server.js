import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import UserRouter from "./routes/user.routes.js";
import AdminRouter from "./routes/admin.routes.js";
import connectToDB from "./DB/DB/DB.js";
import Support from "./models/support.model.js";
import compression from "compression";
import helmet from "helmet";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());  
app.use(compression());
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use("/api/users", UserRouter);
app.use("/api/admin", AdminRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});


io.on("connection", (socket) => {

  socket.on("joinTicket", async (ticketId) => {
    const ticket = await Support.findById(ticketId);
    if (!ticket || ticket.status === "Closed") {
      return socket.emit("error", "Ticket not found or closed");
    }

    socket.join(ticketId);
  });

  socket.on("sendMessage", async ({ ticketId, sender, message }) => {
    const ticket = await Support.findById(ticketId);
    if (!ticket || ticket.status === "Closed") {
      return socket.emit("error", "Cannot send message to closed ticket");
    }
    io.to(ticketId).emit("receiveMessage", {
      sender,
      message,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
  });
});

connectToDB()
  .then(() => {
    import("./utils/cronJobs.js");
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      // console.log("Private Key:", process.env.PRIVATE_KEY);
      //console.log("🔍 Connecting to:", process.env.MONGO_URI);
      console.log(`🚀  Server running on port ${PORT}`);
    });
  })  
  .catch((err) => {
    process.exit(1);
  });
