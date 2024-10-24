import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../state/AuthContext";
import "./Answer.css";

function Answer({ prompt, response, favoriteCompanies, setFavoriteCompanies, answerLoading }) {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchFavoriteCompanies();
  }, []);

  useEffect(() => {
    if (favoriteCompanies) {
      favoriteCompanies.forEach((company) => {
        fetchNewsForCompany(company.companyName); // 各会社に対してニュースを取得
      });
    }
  }, [favoriteCompanies]);

  const fetchNewsForCompany = async (companyName) => {
    try {
      const res = await axios.post(`https://syukatu-app-backend.onrender.com/api/news`, { companyName });
      console.log("res", res);

      setNews((prevNews) => ({
        ...prevNews,
        [companyName]: res.data.news, // 会社ごとにニュースを保存
      }));
    } catch (err) {
      console.error("ニュース取得エラー:", err);
    }
  };

  console.log("news", news);

  const deleteNewsForCompany = (companyName) => {
    setNews((prevNews) => {
      const newNews = { ...prevNews };
      delete newNews[companyName];
      return newNews;
    });
  };

  const fetchFavoriteCompanies = async () => {
    try {
      const res = await axios.get(`https://syukatu-app-backend.onrender.com/api/users/${user._id}/fetchFavoriteCompanies`);
      setFavoriteCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const { user } = useContext(AuthContext);

  const addToFavoriteCompanies = async () => {
    const addFavoriteCompanyContent = {
      companyName: prompt,
      companyAbout: response,
    };

    try {
      await axios.put(`https://syukatu-app-backend.onrender.com/api/users/${user._id}/addToFavoriteCompanies`, { userId: user._id, addFavoriteCompanyContent });
    } catch (err) {
      console.log(err);
    }

    fetchFavoriteCompanies();
  };

  const deleteFromFavoriteCompanies = async (deleteCompanyName, deletCompanyAbout) => {
    const deleteFavoriteCompanyContent = {
      companyName: deleteCompanyName,
      companyAbout: deletCompanyAbout,
    };

    console.log("deleteFavoriteCompanyContent", deleteFavoriteCompanyContent);

    try {
      await axios.delete(`https://syukatu-app-backend.onrender.com/api/users/${user._id}/deleteFromFavoriteCompanies`, {
        data: {
          userId: user._id,
          deleteFavoriteCompanyContent,
        },
      });
    } catch (err) {
      console.log(err);
    }

    deleteNewsForCompany(deleteCompanyName);
    fetchFavoriteCompanies();
  };

  return (
    <div className="Answer-wrp">
      <div className="answer">
        <p className="answer-head">検索結果</p>
        {answerLoading ? <p>回答を作っています...</p> : <p className="company-detail">{response}</p>}
        {response ?
          <div>
            <button onClick={addToFavoriteCompanies}>この会社をお気に入り登録する</button>
          </div>
          : ""}
      </div>
      <div className="favoriteCompanies-wrp">
        <p className="favoriteCompanies-head">お気に入り企業一覧</p>
        {favoriteCompanies ? (
          favoriteCompanies.map((object, index) => (
            <div key={index} className="favoriteCompany">
              <p className="favoriteCompanies-name">{object.companyName}</p>
              <p className="favoriteCompanies-about">{object.companyAbout}</p>
              <div className="news-section">
                <p className="news-section-head">{object.companyName}に関する最近のニュース</p>
                {news[object.companyName] ? (
                  news[object.companyName].value.map((news, i) => (
                    <a key={i} className="news-item" href={news.url} target="_blank" rel="noopener noreferrer">
                      <p className="news-description">{news.description}</p>
                      {news.image?.contentUrl && <img className="news-image" src={news.image.contentUrl} alt="" />}
                    </a>
                  ))
                ) : (
                  <p>関連するニュースがありません。</p>
                )}
              </div>
              <button className="deleteFromFavoriteCompaniesButton"
                onClick={() =>
                  deleteFromFavoriteCompanies(object.companyName, object.companyAbout)
                }
              >
                {object.companyName}をお気に入りから削除する
              </button>
            </div>
          ))
        ) : (
          <p>お気に入りの会社がありません。</p>
        )}
      </div>
    </div>
  );
}

export default Answer