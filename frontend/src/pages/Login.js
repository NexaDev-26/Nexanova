import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');
  const handle = async (e) => { e.preventDefault(); try { await login(email,pw); alert('Logged in'); } catch(e){ alert('Login failed'); } };
  return (
    <form onSubmit={handle} style={{ padding:20 }}>
      <h2>Login</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} /><br/>
      <button type="submit">Login</button>
    </form>
  );
}
