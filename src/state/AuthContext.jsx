import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

export const AuthContext = createContext();

const initialState = {
  user: (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  })(),
  isFetching: false,
  error: false,
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user))
  }, [state.user]);

  return (
    <AuthContext.Provider value={{
      user: state.user,
      isFetching: state.isFetching,
      error: state.error,
      dispatch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}