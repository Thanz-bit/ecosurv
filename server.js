const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "auth")));
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hts_db"
});

db.connect((err) => {
  if (err) console.log("Database belum konek, lanjut dulu...");
  else console.log("Database terhubung!");
});

/*
  Dummy user storage
  (nanti bisa ganti database)
*/

// ===================
// REGISTER
// ===================
app.post("/register", (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });
  if (!email.endsWith("@student.president.ac.id")) return res.json({ success: false, message: "Use your campus email" });

  db.query("INSERT INTO users (email) VALUES (?)", [email], (err) => {
    if (err) return res.json({ success: false, message: "Email already registered" });
    res.json({ success: true, message: "Registered successfully" });
  });
});

// ===================
// LOGIN
// ===================
app.post("/login", (req, res) => {
  const { email } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0) return res.json({ success: false, message: "Email not registered" });
    res.json({ success: true, message: "Login successful" });
  });
});

// ===================
// START SERVER
// ===================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

// ===================
// CHAT REALTIME
// ===================

// Simpan user online: { email -> socketId }
const onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User register diri saat buka chat
    socket.on("user_online", (email) => {
        onlineUsers[email] = socket.id;
        console.log(`${email} online`);
    });

    // Kirim pesan
    socket.on("send_message", async (data) => {
        const { fromEmail, toEmail, message } = data;

        // Simpan ke database
        db.query(
            "INSERT INTO messages (from_email, to_email, message) VALUES (?, ?, ?)",
            [fromEmail, toEmail, message],
            (err, result) => {
                if (err) return console.log("DB error:", err);

                const msgData = {
                    id: result.insertId,
                    fromEmail,
                    toEmail,
                    message,
                    created_at: new Date()
                };

                // Kirim ke penerima (kalau online)
                const receiverSocketId = onlineUsers[toEmail];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", msgData);
                }

                // Kirim balik ke pengirim (konfirmasi)
                socket.emit("receive_message", msgData);
            }
        );
    });

    // Ambil history chat
    socket.on("get_history", (data) => {
        const { fromEmail, toEmail } = data;
        db.query(
            `SELECT * FROM messages 
             WHERE (from_email = ? AND to_email = ?) 
                OR (from_email = ? AND to_email = ?)
             ORDER BY created_at ASC`,
            [fromEmail, toEmail, toEmail, fromEmail],
            (err, results) => {
                if (err) return;
                socket.emit("chat_history", results);
            }
        );
    });

    // User disconnect
    socket.on("disconnect", () => {
        // Hapus dari onlineUsers
        for (const email in onlineUsers) {
            if (onlineUsers[email] === socket.id) {
                delete onlineUsers[email];
                break;
            }
        }
    });
});