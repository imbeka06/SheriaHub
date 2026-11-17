const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async register(data: any) {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async getMe(token: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }
};