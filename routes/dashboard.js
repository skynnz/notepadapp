const express = require('express');
const passport = require('passport');
const pool = require('../config/db');

const router = express.Router();

// Middleware para asegurar que el usuario esté autenticado
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Ruta del dashboard
router.get('/', ensureAuthenticated, async (req, res) => {
    const documents = await pool.query('SELECT * FROM documents WHERE user_id = $1', [req.user.id]);
    res.render('dashboard', { user: req.user, documents: documents.rows });
});

// Ruta para crear un nuevo documento
router.post('/create', ensureAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    await pool.query('INSERT INTO documents (user_id, title, content) VALUES ($1, $2, $3)', [req.user.id, title, content]);
    res.redirect('/dashboard');
});

// Ruta para exportar a PDF
router.get('/export/:id', ensureAuthenticated, async (req, res) => {
    const document = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${document.rows[0].title}.pdf`);
    doc.pipe(res);
    doc.text(document.rows[0].content);
    doc.end();
});

module.exports = router;