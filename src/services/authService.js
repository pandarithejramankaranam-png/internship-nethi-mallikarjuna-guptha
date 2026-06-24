import api, { isOfflineError } from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expected payload: { token, user }
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Falling back to mock authentication.");
      // Return custom mock JWT token matching role details based on email patterns
      if (email === 'admin@ironforge.com' && password === 'password123') {
        return {
          token: 'mock-jwt-token-admin',
          user: { id: 1, name: 'Dev Admin', email: 'admin@ironforge.com', role: 'Admin' }
        };
      } else if (email === 'manager@ironforge.com') {
        return {
          token: 'mock-jwt-token-manager',
          user: { id: 2, name: 'Sarah Manager', email: 'manager@ironforge.com', role: 'Manager' }
        };
      } else {
        // Fallback for staff or generic user input
        return {
          token: 'mock-jwt-token-staff',
          user: { id: 4, name: 'Robert Staff', email: email, role: 'Staff' }
        };
      }
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('gym_auth_token');
};
