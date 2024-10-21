// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // To hash passwords

// Initialize the app
const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this based on your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Your MySQL password
  database: 'user_auth', // Your MySQL database
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1); // Gracefully shut down the server if the database connection fails
  }
  console.log('MySQL connected...');
});

// Helper function to hash passwords
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Registration route
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash the password
  const hashedPassword = hashPassword(password);

  // SQL query to insert user data
  const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [firstName, lastName, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).json({ message: 'Error inserting data' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

// Login route with password comparison
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // SQL query to find user by email
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error querying data:', err.message);
      return res.status(500).json({ message: 'Error querying data' });
    }
    if (results.length > 0) {
      const user = results[0];

      // Compare password hash
      if (bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: 'Login successful', userId: user.id });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Backend route for saving assignments
app.post('/assignments', (req, res) => {
  const { product, tasks, assignmentName, startDate, endDate, selectedClasses, selectedLearners, isEExam, attempts } = req.body;

  // Validation to check required fields
  if (!assignmentName || !startDate || !endDate || !tasks || tasks.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const insertAssignmentQuery = `
    INSERT INTO assignments (product, assignment_name, start_date, end_date, is_e_exam, attempts)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(insertAssignmentQuery, [product, assignmentName, startDate, endDate, isEExam, attempts], (err, result) => {
    if (err) {
      console.error('Error inserting assignment:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to save assignment' });
    }

    const assignmentId = result.insertId;

    // Insert selected tasks
    const taskQueries = tasks.map((task) => {
      return new Promise((resolve, reject) => {
        const taskQuery = `INSERT INTO assignment_tasks (assignment_id, task_name) VALUES (?, ?)`;
        db.query(taskQuery, [assignmentId, task], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    // Insert selected learners
    const learnerQueries = selectedLearners.map((learner) => {
      return new Promise((resolve, reject) => {
        const learnerQuery = `INSERT INTO assignment_learners (assignment_id, learner_name) VALUES (?, ?)`;
        db.query(learnerQuery, [assignmentId, learner], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    // Execute task and learner queries
    Promise.all([...taskQueries, ...learnerQueries])
      .then(() => {
        res.status(200).json({ success: true, message: 'Assignment saved successfully' });
      })
      .catch((error) => {
        console.error('Error saving tasks or learners:', error.message);
        res.status(500).json({ success: false, message: 'Failed to save tasks or learners' });
      });
  });
});

// Backend route for fetching assignments with learners
app.get('/assignments', (req, res) => {
  const getAssignmentsQuery = `
    SELECT a.*, 
           GROUP_CONCAT(l.learner_name) AS learners, 
           GROUP_CONCAT(t.task_name) AS tasks
    FROM assignments a
    LEFT JOIN assignment_learners l ON a.id = l.assignment_id
    LEFT JOIN assignment_tasks t ON a.id = t.assignment_id
    GROUP BY a.id;
  `;

  db.query(getAssignmentsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching assignments:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
    }

    // Parse learners and tasks as arrays
    const assignments = results.map(assignment => ({
      ...assignment,
      selectedLearners: assignment.learners ? assignment.learners.split(',') : [],
      tasks: assignment.tasks ? assignment.tasks.split(',') : [],
    }));
    res.status(200).json(assignments);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
