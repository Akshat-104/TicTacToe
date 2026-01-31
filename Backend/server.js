// server.js
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "./generated/prisma/client.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// In-memory map: socket.id → userId
const activeSockets = new Map();
let waitingPlayer = null;

/* ------------------- AUTH ROUTES ------------------- */

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Name and password required" });
  }

  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { name, password: hashedPassword },
  });

  res.json({ success: true, user: { id: newUser.id, name: newUser.name } });
});

// Login
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ success: true, token, user: { id: user.id, name: user.name } });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Get all games for logged-in user
app.get("/api/games", authenticateToken, async (req, res) => {
  const games = await prisma.game.findMany({
    where: {
      players: {
        some: { id: req.user.userId },
      },
    },
  });
  res.json(games);
});

// ✅ New route: get single game by ID
app.get("/api/games/:id", authenticateToken, async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(game);
});

/* ------------------- SOCKET.IO ------------------- */

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join", async (name) => {
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      socket.emit("error", "User not found. Please signup first.");
      return;
    }

    activeSockets.set(socket.id, user.id);

    // Check if user is already in an active game
    const activeGame = await prisma.game.findFirst({
      where: {
        status: "in-progress",
        players: { some: { id: user.id } },
      },
    });

    if (activeGame) {
      socket.join(activeGame.roomId);
      socket.roomId = activeGame.roomId;
      socket.gameId = activeGame.id;
      socket.emit("resumeGame", { gameId: activeGame.id, roomId: activeGame.roomId });
      console.log(`Player ${user.name} rejoined game ${activeGame.id}`);
      return;
    }

    // Normal matchmaking
    if (waitingPlayer) {
      const opponent = waitingPlayer;
      waitingPlayer = null;

      const roomId = `${opponent.socket.id}-${socket.id}`;
      socket.join(roomId);
      opponent.socket.join(roomId);

      socket.roomId = roomId;
      opponent.socket.roomId = roomId;

      const game = await prisma.game.create({
        data: {
          roomId,
          status: "in-progress",
          players: {
            connect: [{ id: user.id }, { id: opponent.userId }],
          },
          moves: [],
        },
      });

      socket.gameId = game.id;
      opponent.socket.gameId = game.id;

      socket.emit("startGame", { opponent: opponent.name, symbol: "O" });
      opponent.socket.emit("startGame", { opponent: name, symbol: "X" });

      console.log(`Game ${game.id} started in room ${roomId}`);
    } else {
      waitingPlayer = { socket, name, userId: user.id };
      socket.emit("waiting");
      console.log(`${name} is waiting for an opponent...`);
    }
  });

  socket.on("move", async ({ idx, symbol, nextTurn }) => {
    if (socket.roomId && socket.gameId) {
      try {
        const game = await prisma.game.findUnique({ where: { id: socket.gameId } });
        const currentMoves = Array.isArray(game.moves) ? game.moves : [];
        const updatedMoves = [...currentMoves, { idx, symbol, nextTurn }];

        await prisma.game.update({
          where: { id: socket.gameId },
          data: { moves: updatedMoves },
        });

        io.to(socket.roomId).emit("move", { idx, symbol, nextTurn });
      } catch (err) {
        console.error("Error saving move:", err);
      }
    }
  });

  socket.on("gameOver", async ({ winner }) => {
    if (socket.roomId && socket.gameId) {
      await prisma.game.update({
        where: { id: socket.gameId },
        data: {
          status: "finished",
          winner,
        },
      });

      io.to(socket.roomId).emit("gameOverSaved", { winner });
      console.log(`Game ${socket.gameId} finished. Winner: ${winner ?? "Draw"}`);
    }
  });

  socket.on("reset", async () => {
    if (socket.roomId && socket.gameId) {
      await prisma.game.update({
        where: { id: socket.gameId },
        data: { status: "finished" },
      });
      io.to(socket.roomId).emit("reset");
    }
  });

  socket.on("disconnect", () => {
    activeSockets.delete(socket.id);

    if (waitingPlayer?.socket.id === socket.id) {
      waitingPlayer = null;
    }
    if (socket.roomId) {
      io.to(socket.roomId).emit("opponentDisconnected");
    }
    console.log("Player disconnected:", socket.id);
  });
});

/* ------------------- START SERVER ------------------- */

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});