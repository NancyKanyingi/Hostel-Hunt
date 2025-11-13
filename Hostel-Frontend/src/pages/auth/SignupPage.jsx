// Import React's useContext hook to access context values
import { useContext } from "react";
// Import the AuthContext from the context folder
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Custom hook: useAuth
 * ---------------------
 * This hook provides access to authentication data and methods
 * (user, login, signup, logout, loading) from the AuthContext.
 * 
 * It should only be used inside components that are wrapped by <AuthProvider>.
 */
export const useAuth = () => {
  // Get the authentication context
  const context = useContext(AuthContext);

  // Safety check — ensures the hook is used inside AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Return all auth values and functions from context
  return context;
};
