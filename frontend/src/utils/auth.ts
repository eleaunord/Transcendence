// src/utils/auth.ts

export function isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
  