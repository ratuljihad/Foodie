// Simple JWT encoding/decoding for mock authentication
// This is NOT secure - only for frontend mocking purposes

const base64UrlEncode = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64UrlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
};

export const encodeJWT = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // In a real app, this would include a signature. For mocking, we'll just return header.payload
  return `${encodedHeader}.${encodedPayload}`;
};

export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || parts.length > 3) {
      throw new Error('Invalid token format');
    }
    const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
    return decodedPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return false; // No expiration means never expires (for mock)
  }
  return Date.now() >= decoded.exp * 1000;
};
