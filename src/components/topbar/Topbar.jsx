import { Chat, Notifications, Search } from "@mui/icons-material";
import "./Topbar.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../state/AuthContext";
import axios from "axios";
import { logoutCall } from "../../actionCalls";
import { useNavigate } from "react-router-dom";

function Topbar({ prompt, setPrompt, setAnswerLoading, setResponse }) {
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [resultCompaniesNames, setResultCompaniesNames] = useState([]);

  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  // useEffect(第2引数[])でマウント時に毎回apiを叩く(mongodbのcompaniesからデータを取っきて、localstorageに入れとく)

  // useEffect(第2引数[searchCompanyName])でsearchCompanyNameが変わるごとに毎回localstorageの会社から探し、その結果(point: どう結果を出すか?→その時点でのsearchCompanyNameを漢字で会社名に含む会社名をすべてsetResultCompaniesNamesに格納)をすべてsetResultCompaniesNamesに格納する

  const handleSubmit = (e) => {
    e.preventDefault();
    setAnswerLoading(true);
    axios.post("https://syukatu-app-backend.vercel.app/api/chat", { prompt }).then((res) => {
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
    await logoutCall({
      email: user.email,
    }, dispatch);

    try {
      await axios.delete(`https://syukatu-app-backend.vercel.app/api/users/${user._id}`, {
        data: {
          userId: user._id,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      console.log(err);
    }
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
            {/* onChangeでsetSearchCompanyNameに値を格納 */}
            <input type="text" className="searchInput" placeholder="知りたい会社名を入力しEnter！" value={prompt} onChange={(e) => { setPrompt(e.target.value) }} />
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