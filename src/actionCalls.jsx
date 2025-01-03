import axios from "axios";

export const loginCall = async (user, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const response = await axios.post("http://localhost:8080/api/auth/login", user);
    dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
  } catch (err) {
    dispatch({ type: "LOGIN_ERROR", payload: err });
  }
};

export const logoutCall = async (user, dispatch) => {
  try {
    await axios.put("https://syukatu-app-new-backend.vercel.appapi/auth/logout", user);
    dispatch({ type: "LOGOUT" });
  } catch (err) {
    console.log(err);
  }
};