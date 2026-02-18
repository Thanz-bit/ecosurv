// =====================
// REGISTER
// =====================
function register() {
    const email = document.getElementById("regEmail").value.trim();

    if (!email) {
        alert("Email is required");
        return;
    }

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            window.location.href = "login.html";
        }
    })
    .catch(() => alert("Server error"));
}

// =====================
// CAPTCHA (CANVAS)
// =====================
let captchaCode = "";

function generateCaptcha() {
    const canvas = document.getElementById("captcha");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    captchaCode = "";

    for (let i = 0; i < 5; i++) {
        captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    ctx.font = "22px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(captchaCode, 15, 28);
}

// =====================
// LOGIN
// =====================
function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const captchaInput = document.getElementById("captchaInput").value.trim();

    if (!email || !captchaInput) {
        alert("All fields are required");
        return;
    }

    if (captchaInput !== captchaCode) {
        alert("Captcha incorrect");
        generateCaptcha();
        return;
    }

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("userEmail", email);
            window.location.href = "/home.html";
        } else {
            alert(data.message);
            generateCaptcha();
        }
    })
    .catch(() => alert("Server error"));
}

// auto generate captcha
window.onload = generateCaptcha;
