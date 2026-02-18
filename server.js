const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "auth")));


/*
  Dummy user storage
  (nanti bisa ganti database)
*/
const USERS = {};

// ===================
// REGISTER
// ===================
app.post("/register", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "Email required"
    });
  }

  if (!email.endsWith("@student.president.ac.id")) {
    return res.json({
      success: false,
      message: "Use your campus email"
    });
  }

  USERS[email] = { email };

  res.json({
    success: true,
    message: "Registered successfully"
  });
});

// ===================
// LOGIN
// ===================
app.post("/login", (req, res) => {
  const { email } = req.body;

  if (!USERS[email]) {
    return res.json({
      success: false,
      message: "Email not registered"
    });
  }

  res.json({
    success: true,
    message: "Login successful"
  });
});

// ===================
// START SERVER
// ===================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "auth/login.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
