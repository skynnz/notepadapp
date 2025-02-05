const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Ruta del tablón público
router.get('/', async (req, res) => {
    const documents = await pool.query('SELECT * FROM documents WHERE is_public = TRUE');
    res.render('public-board', { documents: documents.rows });
});

module.exports = router;