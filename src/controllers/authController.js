const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Library buat bikin token acak
const { sendVerificationEmail } = require("../services/emailService"); // Import tukang pos kita

// register new user
const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    // A. Cek Email ATAU Username sekaligus
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userExist.rows.length > 0) {
      const foundUser = userExist.rows[0];

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

    // C. Generate Token Unik
    const verificationToken = uuidv4();

    // D. Masukkan ke Database
    const newUser = await pool.query(
      `INSERT INTO users (fullname, username, email, password, verification_token, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fullname, username, email, hashedPassword, verificationToken, false]
    );

    // E. Kirim Email Verifikasi
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

// login user
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

    // B. cek Verifikasi Email
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
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("<h1>Token tidak ditemukan! ❌</h1>");
    }

    // A. Cari user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).send("<h1>Token Invalid atau Kadaluarsa! ❌</h1>");
    }

    const user = userResult.rows[0];

    // B. Aktifkan User
    await pool.query(
      "UPDATE users SET is_verified = $1, verification_token = $2 WHERE id = $3",
      [true, null, user.id]
    );

    // C. Tampilkan Halaman Sukses ini kalo udah verified bakal muncul ini guys
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

// update user profile
const updateProfile = async (req, res) => {
  try {
    // req.user.id didapat dari Middleware Auth (verifyToken)
    const userId = req.user.id;
    const { username, avatar } = req.body;

    // Update Database
    const updatedUser = await pool.query(
      "UPDATE users SET username = $1, avatar = $2 WHERE id = $3 RETURNING *",
      [username, avatar, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // Hapus password sebelum dikirim ke frontend
    const userResult = updatedUser.rows[0];
    delete userResult.password;

    res.json({
      message: "Updated Profile Successfully!",
      user: userResult,
    });
  } catch (err) {
    console.error("Update Profile Error:", err.message);
    res.status(500).json({ message: "Server Error When Updating Profile" });
  }
};

module.exports = { register, login, verifyEmail, updateProfile };
