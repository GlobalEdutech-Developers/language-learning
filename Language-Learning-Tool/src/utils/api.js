import axios from 'axios';

// Function to register the user
export const registerUser = async (firstName, lastName, email, password) => {
    try {
        // Send a POST request to the backend API for user registration
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            firstName,
            lastName,
            email,
            password: hashPassword(password) // Hash the password before sending
        });
        
        return response.data;
    } catch (error) {
        console.error('There was an error registering the user!', error);
        throw error;
    }
};

// Function to login the user
export const loginUser = async (email, password) => {
    try {
        // Send a POST request to the backend API for user login
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password: hashPassword(password) // Hash the password before sending
        });
        
        // If login is successful, store the token
        if (response.data.token) {
            localStorage.setItem('userToken', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        console.error('There was an error logging in!', error);
        throw error;
    }
};

// Function to check if user is logged in
export const isUserLoggedIn = () => {
    return localStorage.getItem('userToken') !== null;
};

// Function to hash password (simple example - use a proper hashing library in production)
const hashPassword = (password) => {
    // This is a placeholder. In a real app, use a proper hashing library
    // For example, you might use bcrypt in the backend
    return password; // The actual hashing should happen on the server side
};

// Function to save the assignment data
export const saveAssignment = async (assignmentData) => {
    try {
        // Check if user is logged in before saving assignment
        if (!isUserLoggedIn()) {
            throw new Error('User must be logged in to save assignments');
        }

        const token = localStorage.getItem('userToken');
        
        const dataToSend = {
            product: assignmentData.product,
            tasks: assignmentData.tasks,
            assignmentName: assignmentData.assignmentName,
            startDate: assignmentData.startDate,
            endDate: assignmentData.endDate,
            selectedClasses: assignmentData.selectedClasses,
            selectedLearners: assignmentData.selectedLearners,
            isEExam: assignmentData.isEExam,
            attempts: assignmentData.attempts
        };
        
        // Send a POST request with authorization header
        const response = await axios.post(
            'http://localhost:5000/api/auth/save_assignment.php', 
            dataToSend,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('There was an error saving the assignment!', error);
        throw error;
    }
};