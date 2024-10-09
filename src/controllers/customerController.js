const res = require("express/lib/response");

const controller = {};

// Fungsi menampilkan daftar semua mahasiswa
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer', (err, customers) => {
            if (err) {
                res.json(err);
            }

            res.render('customers', {
                data: customers
            });
        });
    });
};

// Fungsi untuk menyimpan data mahasiswa baru
controller.save = (req, res) => {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('INSERT INTO customer set ?', [data], (err, customer) => {
            if (err) {
                res.json(err);
            }

            res.redirect('/');      // Redirect ke halaman utama setelah menyimpan data
        });
    });
};

// Fungsi untuk menghapus data mahasiswa
controller.delete = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        conn.query('DELETE FROM customer WHERE id = ?', [id], (err, rows) => {
            if (err) {
                res.json(err);
            }

            res.redirect('/');
        });
    });
};

// Fungsi untuk menampilkan data mahasiswa yang akan diedit
controller.edit = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, customer) => {
            if (err) {
                res.json(err);
            }
            
            res.render('customer_edit', {
                data: customer[0]
            });
        });
    });
};

// Fungsi untuk memperbarui data mahasiswa
controller.update = (req, res) => {
    const { id } = req.params;
    const newCustomer = req.body;
    
    req.getConnection((err, conn) => {
        conn.query('UPDATE customer set ? WHERE id = ?', [newCustomer, id], (err, rows) => {
            if (err) {
                res.json(err);
            }
            
            res.redirect('/');          // Redirect ke halaman utama setelah memperbarui data
        });
    });
};
// Fungsi untuk mencari mahasiswa berdasarkan nama
controller.search = (req, res) => {
    const query = req.query.query;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE name LIKE ? OR address LIKE ? OR angkatan LIKE ? OR phone LIKE ?', [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`], (err, customers) => {
            if (err) {
                res.json(err);
            }

            res.render('customers', {
                data: customers
            });
        });
    });
};

module.exports = controller;
