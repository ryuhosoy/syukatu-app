import { useContext, useRef } from "react";
import "./Login.css";
import { loginCall } from "../../actionCalls";
import { AuthContext } from "../../state/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const email = useRef();
  const password = useRef();
  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginCall({
      email: email.current.value,
      password: password.current.value,
    }, dispatch);
  }

  const TransitionToRegister = () => {
    navigate("/register");
  };

  // console.log(user);

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">就活支援</h3>
          <span className="loginDesc">就活で役立つ情報を効率よく入手。</span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={(e) => handleSubmit(e)}>
            <p className="loginMsg">ログインはこちら</p>
            <input type="email" className="loginInput" placeholder="Email" required ref={email} />
            <input type="password" className="loginInput" placeholder="パスワード" required minLength={6} ref={password} />
            <button className="loginButton">ログイン</button>
            <span className="loginForgot">パスワードを忘れた方へ</span>
            <button className="loginRegisterButton" onClick={TransitionToRegister}>アカウント作成</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login