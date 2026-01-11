const pool = require("../config/database");

exports.getAllUsers = async (req, res) => {
  try {
    // Ambil data query dari URL (Search & Sort)
    const { search, sort = "asc", page = 1, limit = 10 } = req.query;

    let query = "SELECT id, fullname, username, email FROM users";
    let queryParams = [];
    let conditions = [];

    // Logic Search
    if (search) {
      conditions.push(
        `(fullname ILIKE $${queryParams.length + 1} OR username ILIKE $${
          queryParams.length + 1
        })`
      );
      queryParams.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Logic Sort
    const sortOrder = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";
    query += ` ORDER BY fullname ${sortOrder}`;

    // Logic Pagination
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limitNum, offset);

    const result = await pool.query(query, queryParams);

    // Hitung total data
    const countQuery = "SELECT COUNT(*) FROM users";
    const totalResult = await pool.query(countQuery);

    res.json({
      message: "Data user berhasil diambil",
      meta: {
        total: parseInt(totalResult.rows[0].count),
        page: parseInt(page),
        limit: limitNum,
      },
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
