const uploadImage = (req, res) => {
  // 1. Cek: Ada file yang nyangkut gak di req?
  // (Multer otomatis naruh data file di req.file kalau sukses)
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded! Pastikan key-nya 'file'",
    });
  }

  // 2. Bikin URL Gambar Dinamis
  // req.protocol = 'http'
  // req.get('host') = 'localhost:5000' (atau domain vercel nanti)
  // Hasil: http://localhost:5000/uploads/178282_foto.jpg
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  // 3. Kirim Respon Sukses
  res.status(200).json({
    message: "Upload Berhasil! 📸",
    imageUrl: imageUrl, // <-- INI YANG PENTING BUAT FRONTEND
    fileName: req.file.filename,
    fileSize: req.file.size,
  });
};

module.exports = { uploadImage };
