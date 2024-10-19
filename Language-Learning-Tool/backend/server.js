const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000; // You can change the port to 5000 if you prefer

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'user_auth' // Your MySQL database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message); 
    throw err;
  }
  console.log('MySQL connected...');
});

// Registration route
app.post('/register', (req, res) => {
  console.log('Register route hit'); // Debug log
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // SQL query to insert user data
  const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [firstName, lastName, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).json({ message: 'Error inserting data' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

// Login route
app.post('/login', (req, res) => {
  console.log('Login route hit'); // Debug log
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // SQL query to find user
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying data:', err.message);
      return res.status(500).json({ message: 'Error querying data' });
    }
    if (results.length > 0) {
      // User exists, send success response
      res.status(200).json({ message: 'Login successful' });
    } else {
      // User does not exist, send error response
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Report Data
const assignmentReport = [
  { assignment: "Grammar 101", score: 85, status: "Completed", dueDate: "2024-01-15" },
  { assignment: "Verb Tenses", score: 90, status: "Completed", dueDate: "2024-01-20" },
  { assignment: "Vocabulary Test", score: 78, status: "In Progress", dueDate: "2024-01-25" }
];

const learnerReport = {
  learner: "John Doe",
  progress: 78,
  totalSessions: 50,
  completedSessions: 45,
  timeSpent: "30 hours"
};

const readerReport = [
  { book: "English Essentials", timeSpent: "2 hours", date: "2024-01-10" },
  { book: "Grammar Advanced", timeSpent: "3 hours", date: "2024-01-12" }
];

const insightReport = {
  strengths: ["Grammar", "Listening"],
  improvementAreas: ["Speaking", "Pronunciation"],
  recommendations: [
    "Focus on speaking exercises",
    "Practice pronunciation with native speakers",
    "Take part in group discussions"
  ]
};

// API to fetch assignment report
app.get('/api/assignment-report', (req, res) => {
  res.json(assignmentReport);
});

// API to fetch learner report
app.get('/api/learner-report', (req, res) => {
  res.json(learnerReport);
});

// API to fetch reader report
app.get('/api/reader-report', (req, res) => {
  res.json(readerReport);
});

// API to fetch insight report
app.get('/api/insight-report', (req, res) => {
  res.json(insightReport);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
