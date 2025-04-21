import { API_URL } from '@/config';
import { User } from '@/interfaces/auth';

/**
 * Checks the current authentication status by fetching user data from the /auth/me endpoint.
 * Includes credentials (cookies) in the request.
 *
 * @returns {Promise<User | null>} A promise that resolves with the User object if authenticated, or null otherwise.
 */
export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const userData: User = await response.json();
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    // Network errors or other issues during fetch
    return null;
  }
};

/**
 * Logs the user out by sending a POST request to the backend /auth/logout endpoint.
 * Includes credentials (cookies) to ensure the correct session is terminated.
 * Errors are caught and logged, but not re-thrown to allow frontend cleanup.
 *
 * @returns {Promise<void>} A promise that resolves when the request is complete.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    // Log error but don't prevent frontend logout flow
    console.error('Error calling backend logout:', error);
  }
};
