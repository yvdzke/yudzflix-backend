const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header (Format biasanya: "Bearer <token>")
  const authHeader = req.headers["authorization"];

  // Kalau gak ada header Authorization
  if (!authHeader) {
    return res.status(401).json({ message: "Akses Ditolak! Token tidak ada." });
  }

  // Pisahkan kata "Bearer" dan token aslinya
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses Ditolak! Format token salah." });
  }

  try {
    // 2. Cek Validitas Token (Sesuai instruksi 'jwt.verify')
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user yang ada di token ke dalam request biar bisa dipake di controller
    req.user = verified;

    // 3. Lanjut ke proses berikutnya (Controller)
    next();
  } catch (err) {
    res.status(400).json({ message: "Token Invalid!" });
  }
};

module.exports = verifyToken;
