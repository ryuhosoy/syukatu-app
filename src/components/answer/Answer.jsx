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
      const res = await axios.post(`http://localhost:8080/api/news`, { companyName });

      setNews((prevNews) => ({
        ...prevNews,
        [companyName]: res.data, // 会社ごとにニュースを保存
      }));
    } catch (err) {
      console.error("ニュース取得エラー:", err);
    }
  };

  const deleteNewsForCompany = (companyName) => {
    setNews((prevNews) => {
      const newNews = { ...prevNews };
      delete newNews[companyName];
      return newNews;
    });
  };

  const fetchFavoriteCompanies = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${user._id}/fetchFavoriteCompanies`);
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
      await axios.put(`http://localhost:8080/api/users/${user._id}/addToFavoriteCompanies`, { userId: user._id, addFavoriteCompanyContent });
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
      await axios.delete(`http://localhost:8080/api/users/${user._id}/deleteFromFavoriteCompanies`, {
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
      {response ?
        <div>
          <button onClick={addToFavoriteCompanies}>お気に入り</button>
        </div>
        : ""}
      <div>
        {answerLoading ? <p>回答を作っています...</p> : response}
      </div>
      <div className="favoriteCompanies-wrp">
        <p>お気に入り企業一覧</p>
        {favoriteCompanies ? (
          favoriteCompanies.map((object, index) => (
            <div key={index}>
              <p>{object.companyName}</p>
              <p>{object.companyAbout}</p>
              <button
                onClick={() =>
                  deleteFromFavoriteCompanies(object.companyName, object.companyAbout)
                }
              >
                お気に入りから削除する
              </button>

              <div className="news-section">
                <p>{object.companyName}に関するニュース一覧</p>
                {news[object.companyName] ? (
                  news[object.companyName].articles.map((article, i) => (
                    <div key={i}>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <h4>{article.title}</h4>
                      </a>
                      <p>{article.description}</p>
                    </div>
                  ))
                ) : (
                  <p>関連するニュースがありません。</p>
                )}
              </div>
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