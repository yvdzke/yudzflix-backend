const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Library buat bikin token acak
const { sendVerificationEmail } = require("../services/emailService"); // Import tukang pos kita

// --- 1. REGISTER USER ---
const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    // A. Cek apakah email sudah terdaftar?
    // A & B. Cek Email ATAU Username sekaligus (Lebih Hemat Resource)
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userExist.rows.length > 0) {
      const foundUser = userExist.rows[0];

      // Kita cek manual di sini biar pesan errornya tetep spesifik
      if (foundUser.email === email) {
        return res.status(400).json({ message: "Email already registered!" });
      }

      if (foundUser.username === username) {
        return res
          .status(400)
          .json({ message: "Username already registered!" });
      }
    }

    // B. Enkripsi Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // C. Generate Token Unik (Tiket Verifikasi)
    const verificationToken = uuidv4();

    // D. Masukkan ke Database
    // Penting: is_verified default-nya FALSE (Belum aktif)
    const newUser = await pool.query(
      `INSERT INTO users (fullname, username, email, password, verification_token, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fullname, username, email, hashedPassword, verificationToken, false]
    );

    // E. Kirim Email Verifikasi
    // (Proses ini kita 'await' biar user tau kalau email gagal dikirim)
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        message:
          "Registered but failed to send verification email. Please contact support.",
      });
    }

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        is_verified: newUser.rows[0].is_verified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 2. LOGIN USER ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Cari User
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    const user = userResult.rows[0];

    // B.  CEK STATUS VERIFIKASI
    // Kalau is_verified masih FALSE, tolak loginnya!
    if (!user.is_verified) {
      return res.status(401).json({
        message: "Please verify your email first.",
      });
    }

    // C. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // D. Bikin Token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login Berhasil",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        avatar: user.avatar, // Kalau ada kolom avatar
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 3. VERIFIKASI EMAIL (Dipanggil saat klik link di email) ---
const verifyEmail = async (req, res) => {
  try {
    // Ambil token dari URL (contoh: /api/auth/verify?token=abc-123)
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("<h1>Token tidak ditemukan! ❌</h1>");
    }

    // A. Cari user yang punya token ini
    const userResult = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).send("<h1>Token Invalid atau Kadaluarsa! ❌</h1>");
    }

    const user = userResult.rows[0];

    // B. Aktifkan User (Update DB)
    // - Set is_verified jadi TRUE
    // - Hapus verification_token jadi NULL (biar link gak bisa dipake 2x)
    await pool.query(
      "UPDATE users SET is_verified = $1, verification_token = $2 WHERE id = $3",
      [true, null, user.id]
    );

    // C. Tampilkan Halaman HTML Sederhana
    res.status(200).send(`
      <body>
      <div style="text-align: center; padding: 50px; font-family: Arial;">
        <h1 style="color: green;">Email Verified Successfully! ✅</h1>
        <p>Halo <b>${user.fullname}</b>, akun kamu sudah aktif.</p>
        <p>Silakan kembali ke aplikasi YudzFlix untuk login.</p>
        <a href="https://yudzflix.vercel.app/login" style="background: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Sekarang</a>
      </div>
      </body>
    `);
  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).send("<h1>Server Error ❌</h1>");
  }
};

module.exports = { register, login, verifyEmail };
