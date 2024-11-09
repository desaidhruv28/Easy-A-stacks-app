import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const userService = {
    getUsers: () => axios.get(`${API_URL}/users`),
    createUser: (userData) => axios.post(`${API_URL}/users`, userData)
};
