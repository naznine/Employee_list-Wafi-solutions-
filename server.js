const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_db'
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Fetch employees with pagination
app.get('/api/employees', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    db.query(`SELECT * FROM employees LIMIT ${limit} OFFSET ${offset}`, (err, results) => {
        if (err) throw err;

        db.query(`SELECT COUNT(*) AS total FROM employees`, (err, countResults) => {
            if (err) throw err;
            res.json({
                employees: results,
                totalPages: Math.ceil(countResults[0].total / limit)
            });
        });
    });
});

// Add new employee
app.post('/api/employees', upload.single('photo'), (req, res) => {
    const { firstName, lastName, email, mobile, dob } = req.body;
    const fullName = `${firstName} ${lastName}`;
    
    // Resize and save photo
    const photoPath = `uploads/${Date.now()}-${req.file.originalname}`;
    sharp(req.file.buffer)
        .resize(100, 100)
        .toFile(`public/${photoPath}`, (err) => {
            if (err) throw err;

            // Insert employee data into database
            db.query(`INSERT INTO employees (fullName, email, mobile, dob, photo) VALUES (?, ?, ?, ?, ?)`, 
            [fullName, email, mobile, dob, photoPath], 
            (err) => {
                if (err) throw err;
                res.sendStatus(200);
            });
        });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
    db.query(`DELETE FROM employees WHERE id = ?`, [req.params.id], (err) => {
        if (err) throw err;
        res.sendStatus(200);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
