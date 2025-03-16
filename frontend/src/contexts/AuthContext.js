import { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/auth.service';

const AuthContext = createContext();

export function useAuth() {
  	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
		getMe()
			.then(data => {
				setCurrentUser(data);
			})
			.catch(() => {
				localStorage.removeItem('token');
			})
			.finally(() => {
				setLoading(false);
			});
		} else {
			setLoading(false);
		}
	}, []);

	const login = async (email, password) => {
		try {
			setError('');
			const data = await apiLogin(email, password);
			localStorage.setItem('token', data.token);
			setCurrentUser(data.user);
			return data;
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to login');
			throw err;
		}
	};

	const register = async (username, email, password) => {
		try {
			setError('');
			const data = await apiRegister(username, email, password);
			localStorage.setItem('token', data.token);
			setCurrentUser(data.user);
			return data;
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to register');
			throw err;
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setCurrentUser(null);
	};

	const value = {
		currentUser,
		login,
		register,
		logout,
		error,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
}