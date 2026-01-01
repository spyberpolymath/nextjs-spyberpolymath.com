/**
 * Client-side utility to handle authentication token validation and cleanup
 */

/**
 * Validates if a JWT token has the correct structure
 * @param token - The JWT token to validate
 * @returns boolean indicating if the token structure is valid
 */
export function validateTokenStructure(token: string | null): boolean {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = parts[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(b64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const obj = JSON.parse(json);
    
    // Check if the token has a problematic buffer object for id
    if (obj.id && typeof obj.id === 'object' && obj.id.buffer) {
      console.warn('Detected problematic token with buffer object, clearing...');
      return false;
    }
    
    // Check if token is expired
    if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) {
      console.warn('Token is expired, clearing...');
      return false;
    }
    
    return true;
  } catch (e) {
    console.warn('Invalid token structure, clearing...');
    return false;
  }
}

/**
 * Clears authentication data from localStorage if token is invalid
 */
export function clearInvalidToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = window.localStorage.getItem('token');
  
  if (!validateTokenStructure(token)) {
    console.log('Clearing invalid authentication data...');
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('userRole');
    window.localStorage.removeItem('tempUserId');
    window.localStorage.removeItem('tempUserRole');
    return true; // Token was cleared
  }
  
  return false; // Token is valid
}

/**
 * Safe token retrieval with automatic cleanup
 * @returns The valid token or null if invalid/missing
 */
export function getSafeToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = window.localStorage.getItem('token');
  
  if (!validateTokenStructure(token)) {
    clearInvalidToken();
    return null;
  }
  
  return token;
}