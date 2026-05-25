# MultiPlayer Tic-Tac-Toe

A real-time, multiplayer Tic-Tac-Toe game featuring user authentication, matchmaking, and game history. Built with a modern full-stack architecture.

## 🚀 Features

- **Real-time Multiplayer:** Play against other users online using Socket.io.
- **Matchmaking:** Automated waiting room to pair players.
- **User Authentication:** Secure signup and login using JWT and Bcrypt.
- **Game History:** Track your past games, moves, and results.
- **Rejoin Active Games:** Automatically reconnect to ongoing matches if disconnected.
- **Responsive UI:** Modern design built with React and Tailwind CSS 4.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **Real-time:** Socket.io-client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Real-time:** Socket.io
- **Auth:** JSON Web Tokens (JWT) & Bcrypt

## 📁 Project Structure

```text
TicTacToe/
├── Backend/          # Node.js Express server & Prisma configuration
│   ├── prisma/       # Database schema and migrations
│   ├── middleware/   # Auth middleware
│   └── server.js     # Entry point & Socket.io logic
└── Frontend/         # React application
    ├── src/
    │   ├── Components/ # UI components (Board, Square)
    │   ├── Pages/      # Page views (Login, Lobby, Game, etc.)
    │   └── socket.js   # Socket.io client configuration
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 1. Clone the repository
```bash
git clone <repository-url>
cd TicTacToe
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tictactoe?schema=public"
   JWT_SECRET="your_secure_secret_here"
   ```
4. Run Prisma migrations to set up your database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play
1. Open your browser to `http://localhost:5173`.
2. Sign up for a new account or log in.
3. In the Lobby, click "Join Game" to find an opponent.
4. Once paired, the game begins!
5. View your past matches in the History section.

## 📄 License
This project is licensed under the ISC License.
