if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express");
const morgan = require("morgan");
const mysql = require("mysql");
const myConnection = require("express-myconnection");
const path = require('path');
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require("express-flash");
const session = require('express-session')

// inisialisasi passport untuk autentikasi
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
require('dotenv').config();

// Importing routes
const customerRoutes = require('./routes/customer');

// settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk database
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'crudnodejsmysql'
}, 'single'));
app.use(express.urlencoded({extended: false}));

// Middleware untuk flash message dan session
app.use(flash())
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } //Sesi akan berakhir setelah 1 menit tidak aktif
}))
app.use(passport.initialize())
app.use(passport.session())

// Rute yang tidak dilindungi
app.get('/login', (req, res) => {
    res.render('login.ejs', { messages: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        req.getConnection((err, connection) => {
            if (err) throw err;
            connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
                if (err) {
                    req.flash('error', 'Email already in use');
                    res.redirect('/register');
                } else {
                    res.redirect('/login');
                }
            });
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
    console.log
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

// Middleware untuk memeriksa autentikasi
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Terapkan middleware autentikasi pada rute yang dilindungi
app.use(checkAuthenticated);

// Rute yang dilindungi
app.use('/', customerRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})