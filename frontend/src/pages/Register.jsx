import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import "../App.css";

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await api.post('/register', { username, password });
      localStorage.setItem('token', res.data.token);
      alert('Register success');
      navigate('/boards');
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div>
      <h2 className='header'>Register</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
