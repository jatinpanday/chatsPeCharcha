export const reduxLocalStorage = "persistStore";

export const getToken = () => {
  try {
    // First try to get token from localStorage
    const authToken = localStorage.getItem('authToken');
    if (authToken) return authToken;
    
    // Fallback to Redux store if localStorage doesn't have it
    const serialState = localStorage.getItem(reduxLocalStorage);
    if (!serialState) return null;
    
    const state = JSON.parse(serialState);
    // The token is directly in the user object in the state
    return state?.user?.token || null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};
