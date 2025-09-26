import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import './Login.css';

function Login({ setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Login attempt:', { email });
      
      // Use absolute URL in development, relative in production
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:5000/api' 
        : '/api';
      
      const res = await axios.post(
        `${apiUrl}/users/auth`,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        console.log('Token stored in localStorage');
        showToast.success('Login successful!');
        
        if (res.data.role) {
          console.log('Setting user role:', res.data.role);
          setUserRole(res.data.role);
          
          if (res.data.role === 'admin') {
            console.log('Navigating to /admin');
            navigate('/admin');
          } else {
            console.log('Navigating to /user');
            navigate('/user');
          }
        } else {
          console.error('No role in response');
          throw new Error('No role received from server');
        }
      } else {
        console.error('No token in response');
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          const errorMsg = 'Invalid email or password';
          showToast.error(errorMsg);
        } else if (err.response.data?.message) {
          showToast.error(err.response.data.message);
        } else {
          const errorMsg = `Server error: ${err.response.status}`;
          showToast.error(errorMsg);
        }
      } else if (err.request) {
        // The request was made but no response was received
        const errorMsg = 'Cannot connect to the server. Please check your connection.';
        showToast.error(errorMsg);
      } else {
        // Something happened in setting up the request
        const errorMsg = 'An error occurred. Please try again.';
        showToast.error(errorMsg);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label> <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don’t have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;