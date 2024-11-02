import { Chat, Notifications, Search } from "@mui/icons-material";
import "./Topbar.css";
import { useContext } from "react";
import { AuthContext } from "../../state/AuthContext";
import axios from "axios";
import { logoutCall } from "../../actionCalls";
import { useNavigate } from "react-router-dom";

function Topbar({ prompt, setPrompt, setAnswerLoading, setResponse }) {
  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setAnswerLoading(true);
    axios.post("https://syukatu-app-backend.onrender.com/api/chat", { prompt }).then((res) => {
      setAnswerLoading(false);
      setResponse(res.data);
    }
    ).catch((err) => {
      console.log(err);
    });
  };

  const logout = async () => {
    await logoutCall({
      email: user.email,
    }, dispatch);
    navigate("/login");
  };

  const deleteAccount = async () => {
    axios.delete(`https://syukatu-app-backend.onrender.com/api/users/${user._id}`, {
      userId: user._id,
      isAdmin: user.isAdmin,
    }).then(() => {
      localStorage.removeItem("user");
      navigate("/login");
    }).catch((err) => {
      console.log(err);
    });
  };

  const { user } = useContext(AuthContext);

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <span className="logo">就活支援</span>
      </div>
      <div className="topbarCenter">
        <form onSubmit={handleSubmit}>
          <div className="searchbar">
            <Search className="searchIcon" />
            <input type="text" className="searchInput" placeholder="知りたい会社はなんですか？" value={prompt} onChange={(e) => { setPrompt(e.target.value) }} />
          </div>
        </form>
      </div>
      <div className="topbarRight">
        {/* <div className="topbarIconItem">
          <Chat />
          <span className="topbarIconBadge">1</span>
        </div>
        <div className="topbarIconItem">
          <Notifications />
          <span className="topbarIconBadge">2</span>
        </div> */}
      </div>
      <button type="button" onClick={logout}>ログアウト</button>
      <button type="button" onClick={deleteAccount}>アカウントを削除</button>
    </div>
  )
}

export default Topbar