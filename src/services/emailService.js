const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // my email
    pass: process.env.SMTP_PASS, // app password
  },
});

const sendVerificationEmail = async (userEmail, token) => {
  // Tentukan link verifikasi berdasarkan environment
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://yudzflix-backend.vercel.app"
      : "http://localhost:5000";

  const verificationLink = `${BASE_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: '"YudzFlix Admin (yvdzke)" <no-reply@yudzflix.com>',
    to: userEmail,
    subject: "Verifikasi Akun YudzFlix Guysssssssssss 🎬",
    html: `
      <h3>Halo! 👋</h3>
      <p>Klik ae linglung dibawah yahhh huhuhuhu:</p>
      <a href="${verificationLink}">Nihhhh Verif dulu kocak baru login kwkwkw pencet ae yah</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to: " + userEmail);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
