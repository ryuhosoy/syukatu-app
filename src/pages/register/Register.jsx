import { useRef } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordConfirmation = useRef();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.current.value !== passwordConfirmation.current.value) {
      passwordConfirmation.current.setCustomValidity("パスワードが違います。");
    } else {
      try {
        const user = {
          username: username.current.value,
          email: email.current.value,
          password: password.current.value,
        };

        await axios.post("https://https://syukatu-app-backend.onrender.com/api/auth/register", user);
        navigate("/login");
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">就活支援</h3>
          <span className="loginDesc">就活で役立つ情報を効率よく入手。</span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={(e) => handleSubmit(e)}>
            <p className="loginMsg">新規登録はこちら</p>
            <input type="text" className="loginInput" placeholder="ユーザー名" required ref={username} />
            <input type="email" className="loginInput" placeholder="Email" required ref={email} />
            <input type="password" className="loginInput" placeholder="パスワード" required minLength={6} ref={password} />
            <input type="password" className="loginInput" placeholder="確認用パスワード" required minLength={6} ref={passwordConfirmation} />
            <button className="loginButton" type="submit">サインアップ</button>
            <button className="loginRegisterButton">ログイン</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register