const pool = require('../config/db');

exports.getFiles = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM file_paths');
        conn.release();  // Release connection back to the pool

        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};
