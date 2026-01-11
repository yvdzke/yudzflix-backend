const pool = require("../config/database");

// 1. ADD FAVORITE (Buat mindahin data TMDB ke DB Lokal)
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id; // Dari Token
    const { title, poster_path, release_date, vote_average, genre } = req.body;

    // Cek biar gak double
    const check = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1 AND title = $2",
      [userId, title]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Film sudah ada" });
    }

    const result = await pool.query(
      "INSERT INTO favorites (user_id, title, poster_path, release_date, vote_average, genre) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, title, poster_path, release_date, vote_average, genre]
    );

    res.status(201).json({ message: "Disimpan!", data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. GET FAVORITES (TUGAS UTAMA: SEARCH, SORT, FILTER)
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    // Ambil params dari URL
    const { search, genre, sort = "desc" } = req.query;

    let query = "SELECT * FROM favorites WHERE user_id = $1";
    let queryParams = [userId];

    // --- LOGIC SEARCH (Cari Judul) ---
    if (search) {
      query += ` AND title ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${search}%`);
    }

    // --- LOGIC FILTER (Filter Genre) ---
    if (genre) {
      query += ` AND genre ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${genre}%`);
    }

    // --- LOGIC SORT (Urutkan Rating) ---
    const sortOrder = sort.toLowerCase() === "asc" ? "ASC" : "DESC";
    query += ` ORDER BY vote_average ${sortOrder}`;

    const result = await pool.query(query, queryParams);

    res.json({
      message: "Data berhasil diambil",
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. DELETE FAVORITE (Hapus Film)
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Ini ID Postgres (Primary Key), bukan ID TMDB!

    // Cek dulu: Filmnya ada gak? Dan punya user ini gak?
    const check = await pool.query(
      "SELECT * FROM favorites WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Film tidak ditemukan atau bukan milikmu." });
    }

    // Eksekusi Hapus
    await pool.query("DELETE FROM favorites WHERE id = $1", [id]);

    res.json({ message: "Berhasil dihapus dari favorit!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
