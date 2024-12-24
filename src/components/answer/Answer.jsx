import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../state/AuthContext";
import "./Answer.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import {
  setDefaults,
  fromAddress,
} from "react-geocode";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

setDefaults({
  key: "AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg",
  language: "jp",
  region: "jp",
});

function Answer({ prompt, response, favoriteCompanies, setFavoriteCompanies, answerLoading, resultCompanyData }) {
  const [news, setNews] = useState([]);
  const [resultComLocation, setResultComLocation] = useState(null);
  const [resultComLat, setResultComLat] = useState("");
  const [resultComLng, setResultComLng] = useState("");

  useEffect(() => {
    if (resultCompanyData[0]?.location) {
      setResultComLocation(resultCompanyData[0].location)
      console.log("resultCompanyData location is changed", resultCompanyData[0].location);
    }
  }, [resultCompanyData]);

  const center = {
    lat: resultComLat, lng: resultComLng
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg',
  })

  if (resultComLocation) {
    fromAddress(resultComLocation)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;
        console.log(lat, lng);
        setResultComLat(lat);
        setResultComLng(lng);
      })
      .catch(console.error);
  }

  const containerStyle = {
    width: '100%',
    height: '400px',
  }

  console.log("resultCompanyData", resultCompanyData);

  useEffect(() => {
    fetchFavoriteCompanies();
  }, []);

  useEffect(() => {
    if (favoriteCompanies) {
      favoriteCompanies.forEach((company) => {
        fetchNewsForCompany(company.companyName);
      });
    }
  }, [favoriteCompanies]);

  const fetchNewsForCompany = async (companyName) => {
    try {
      const res = await axios.post(`https://syukatu-app-backend.vercel.app/api/news`, { companyName });
      console.log("res", res);

      setNews((prevNews) => ({
        ...prevNews,
        [companyName]: res.data.webPages,
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
      if (localStorage.getItem("user")) {
        const res = await axios.get(`https://syukatu-app-backend.vercel.app/api/users/${user._id}/fetchFavoriteCompanies`);
        setFavoriteCompanies(res.data);
      }
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
      await axios.put(`https://syukatu-app-backend.vercel.app/api/users/${user._id}/addToFavoriteCompanies`, { userId: user._id, addFavoriteCompanyContent });
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
      await axios.delete(`https://syukatu-app-backend.vercel.app/api/users/${user._id}/deleteFromFavoriteCompanies`, {
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

  let netsalesYearsLabels;
  let netsales;
  let numOfEmployeesYearsLabels;
  let numOfEmployees;

  if (resultCompanyData[0]) {
    if (resultCompanyData[0]?.netsales) {
      netsalesYearsLabels = resultCompanyData[0].netsales.map((netsalesByYear) => (
        netsalesByYear[0]
      )).reverse();
      netsales = resultCompanyData[0].netsales.map((netsalesByYear) => (
        Number(netsalesByYear[1])
      )).reverse();
    }
    if (resultCompanyData[0]?.numberOfEmployees) {
      numOfEmployeesYearsLabels = resultCompanyData[0].numberOfEmployees.map((numberOfEmployeesByYear) => (
        numberOfEmployeesByYear[0]
      )).reverse();
      numOfEmployees = resultCompanyData[0].numberOfEmployees.map((numberOfEmployeesByYear) => (
        Number(numberOfEmployeesByYear[1])
      )).reverse();
    }
  }

  console.log("netsalesYearsLabels", netsalesYearsLabels);
  console.log("netsales", netsales);

  const netsalesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "売上の推移"
      }
    }
  };

  const netsalesBarData = {
    labels: netsalesYearsLabels,
    datasets: [
      {
        label: "売上",
        data: netsales,
        backgroundColor: "rgba(53, 162, 235, 0.5)"
      }
    ]
  };

  const numOfEmployeesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "従業員数の推移"
      }
    }
  };

  const numOfEmployeesBarData = {
    labels: numOfEmployeesYearsLabels,
    datasets: [
      {
        label: "従業員数",
        data: numOfEmployees,
        backgroundColor: "rgba(235, 147, 53, 0.5)"
      }
    ]
  };

  return (
    <div className="Answer-wrp">
      <p className="welcomeText">{user.username}さん、ようこそ就活支援へ！</p>
      <div className="answer">
        {!answerLoading && response ? <p className="answer-head">AIによる企業概要説明</p> : ""}
        {answerLoading ? <p>AIによる企業概要を作成中...</p> : <p className="company-detail">{response}</p>}
        {response ?
          <div>
            <button onClick={addToFavoriteCompanies}>この会社をお気に入り登録する</button>
          </div>
          : ""}
        {netsalesYearsLabels && netsales ? <Bar options={netsalesOptions} data={netsalesBarData} /> : ""}
        {numOfEmployeesYearsLabels && numOfEmployees ? <Bar options={numOfEmployeesOptions} data={numOfEmployeesBarData} /> : ""}
        {resultCompanyData?.[0]?.averageAge ? <p>平均年齢：{resultCompanyData[0].averageAge}</p> : ""}
        {resultCompanyData?.[0]?.averageAnnualSalary ? <p>平均年間給与：{resultCompanyData[0].averageAnnualSalary}</p> : ""}
        {resultCompanyData?.[0]?.averageLengthOfService ? <p>平均勤続年数：{resultCompanyData[0].averageLengthOfService}</p> : ""}
        {resultCompanyData?.[0]?.descriptionOfBusiness ? <p>{resultCompanyData[0].descriptionOfBusiness}</p> : ""}
        {resultCompanyData?.[0]?.location ? <p>所在地：{resultCompanyData[0].location}</p> : ""}
        {isLoaded && resultComLat && resultComLng ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : (
          <></>
        )}
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
                      <p className="news-description">・　{news.snippet}</p>
                      {/* {/* {news.image?.contentUrl && <img className="news-image" src={news.image.contentUrl} alt="" />} */}
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