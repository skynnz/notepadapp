// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length > 0) {
            const isValid = await bcrypt.compare(password, user.rows[0].password);
            if (isValid) {
                return done(null, user.rows[0]);
            } else {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
        } else {
            return done(null, false, { message: 'Usuario no encontrado' });
        }
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, user.rows[0]);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;