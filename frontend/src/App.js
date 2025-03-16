import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AnalyzerPage from './pages/AnalyzerPage';
import HistoryPage from './pages/HistoryPage';
import Header from './components/layout/Header';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/analyzer" element={<PrivateRoute><AnalyzerPage /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
              <Route path="/history/:id" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;