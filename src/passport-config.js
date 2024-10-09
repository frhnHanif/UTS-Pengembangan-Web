const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql');

// Konfigurasi Database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'crudnodejsmysql'
};

const connection = mysql.createConnection(dbConfig);

// Fungsi utama untuk mengatur Passport.js
function initialize(passport) {
    // Fungsi untuk memverifikasi pengguna berdasarkan email dan password
    const authenticateUser = (email, password, done) => {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return done(err);
            }
            if (results.length === 0) {
                return done(null, false, { message: 'No user with that email' });
            }

            const user = results[0];

            try {
                // Membandingkan password yang diinput dengan password yang tersimpan di database
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (e) {
                return done(e);
            }
        });
    };
    
    // Menggunakan strategi lokal untuk autentikasi
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    
    // Menentukan bagaimana data pengguna disimpan dalam sesi
    passport.serializeUser((user, done) => done(null, user.id));
    
    // Menentukan bagaimana data pengguna diambil dari sesi
    passport.deserializeUser((id, done) => {
        // Query untuk mengambil data pengguna
        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                return done(err);
            }
            return done(null, results[0]);
        });
    });
}

module.exports = initialize;