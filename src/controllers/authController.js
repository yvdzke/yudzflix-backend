const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register Controller
exports.register = async (req, res) => {
  try {
    // Tangkap data sesuai ENTITAS USER di tugas
    const { fullname, username, email, password } = req.body;

    // Cek user ganda
    const check = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (check.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username atau Email sudah terdaftar!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke DB
    const newUser = await pool.query(
      "INSERT INTO users (fullname, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, fullname, username",
      [fullname, username, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "Register Berhasil!", data: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi Input (Hemat resource DB)
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan Password wajib diisi!" });
    }

    // 2. Cari User Berdasarkan Email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    // 3. Cek User & Password Sekaligus
    // Teknik "Short-circuit": Kalau user gak ada, bcrypt gak bakal dijalankan (aman dari error)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email atau Password Salah" });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Data User yang mau dikirim (kecuali password)
    const userData = {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
    };

    // 6. Response
    res.status(200).json({
      message: "Login Berhasil",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
