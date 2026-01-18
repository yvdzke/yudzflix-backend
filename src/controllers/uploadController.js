const cloudinary = require("cloudinary").v2;

// 1. Konfigurasi Cloudinary dengan ENV Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (req, res) => {
  // A. Cek: Ada file masuk gak dari Middleware?
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded! Pastikan key-nya 'file'",
    });
  }

  try {
    // B.  PROSES UTAMA: Kirim Buffer ke Cloudinary
    // Kita bungkus logic upload stream jadi Promise biar bisa pake 'await'
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "yudzflix_avatars" }, // Nama folder di Cloudinary
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      // 'req.file.buffer' berasal dari MemoryStorage di middleware tadi
      uploadStream.end(req.file.buffer);
    });

    // C. Ambil URL Online
    const imageUrl = result.secure_url; // URL https aman dari Cloudinary

    // D. Kirim Respon ke Frontend
    res.status(200).json({
      message: "Upload Berhasil ke Cloud! ☁️",
      imageUrl: imageUrl, // <-- URL INI YANG DISIMPAN KE DB
      fileName: result.public_id,
      format: result.format,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    res.status(500).json({
      message: "Gagal upload ke Cloudinary",
      error: error.message,
    });
  }
};

module.exports = { uploadImage };
