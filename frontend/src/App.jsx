import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Boards from './pages/Boards';

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/boards" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/boards" element={isAuthenticated() ? <Boards /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
