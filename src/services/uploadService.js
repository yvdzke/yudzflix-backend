const multer = require("multer");
const path = require("path");

// rules penyimpanan file
const storage = multer.diskStorage({
  // 1. Simpan di folder 'uploads'
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  // 2. Namain file pake Timestamp biar unik (biar gak bentrok nama)
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// filter file cuma gambar ae
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Maaf, hanya boleh upload gambar!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: fileFilter,
});

module.exports = upload;
