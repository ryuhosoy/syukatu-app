import './App.css';
import { useContext, useState } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./state/AuthContext";
import Posts from './pages/posts/posts';

function App() {
  // const [prompt, setPrmpt] = useState("");
  // const [response, setResponse] = useState("");
  // const [favoriteCompanies, setFavoriteCompanies] = useState(firstfavoriteCompanies);
  // const [answerLoading, setAnswerLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // const handleSubmit = () => {
  //   setAnswerLoading(true);
  //   axios.post("http://localhost:8080/api/chat", { prompt }).then((res) => {
  //     setAnswerLoading(false);
  //     setResponse(res.data);
  //   }
  //   ).catch((err) => {
  //     console.log(err);
  //   });
  // };

  // const addTofavoriteCompanies = () => {
  //   const newfavoriteCompanies = [...favoriteCompanies, {
  //     companyName: prompt,
  //     companyAbout: response
  //   }];
  //   setFavoriteCompanies(newfavoriteCompanies);
  //   console.log(newfavoriteCompanies);
  // };

  // console.log(favoriteCompanies);

  return (
    <>
      {/* <div>
        <label>
          知りたい会社名を入力してください。
        </label>
      </div>
      <div>
        <input type="text" value={prompt} onChange={(e) => { setPrompt(e.target.value) }} />
      </div>
      {response ?
        <div>
          <button onClick={addTofavoriteCompanies}>お気に入り</button>
        </div>
        : ""}
      <div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <div>
        {answerLoading ? <p>回答を作っています...</p> : response}
      </div>
      <div>
        {favoriteCompanies.map((object, index) =>
          <div key={index}>
            <p>{object.companyName}</p>
            <p>{object.companyAbout}</p>
          </div> 
        )}
      </div> */}
      <Router>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/posts" element={user ? <Posts /> : <Register />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
