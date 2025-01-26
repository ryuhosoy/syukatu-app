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
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import {
  setDefaults,
  fromAddress,
} from "react-geocode";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

setDefaults({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  language: "jp", 
  region: "jp",
});

function Answer({ response, favoriteCompanies, setFavoriteCompanies, answerLoading, resultCompanyData, companyWorkplaceInfo }) {
  const [news, setNews] = useState([]);
  const [resultComLocation, setResultComLocation] = useState(null);
  const [resultComLat, setResultComLat] = useState("");
  const [resultComLng, setResultComLng] = useState("");
  const [futureGrowthChatRes, setFutureGrowthChatRes] = useState("");

  useEffect(() => {
    if (resultCompanyData[0]?.location) {
      setResultComLocation(resultCompanyData[0].location)
      // console.log("resultCompanyData location is changed", resultCompanyData[0].location);
    }

    if (resultCompanyData[0] && netsalesYearsLabels && netsales && numOfEmployeesYearsLabels && numOfEmployees) {
      const futureGrowthPrompt = `${resultCompanyData[0].companyName}について、次の年度別の売上と従業員数の推移データ、業界等から将来の成長度、安定度の予測について600字程度で説明して。売上:${netsalesYearsLabels.map((year, index) => `${year}: ${netsales[index]}`).join('\n')}、従業員数:${numOfEmployeesYearsLabels.map((year, index) => `${year}: ${numOfEmployees[index]}`).join('\n')}`;
      giveFutureGrowthPromptToChat(futureGrowthPrompt);
    }
  }, [resultCompanyData]);

  const center = {
    lat: resultComLat, lng: resultComLng
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  if (resultComLocation) {
    fromAddress(resultComLocation)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;
        // console.log(lat, lng);
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
      console.log("newsRes", res);

      setNews((prevNews) => ({
        ...prevNews,
        [companyName]: res.data.webPages,
      }));
    } catch (err) {
      console.error("ニュース取得エラー:", err);
    }
  };

  // console.log("news", news);

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
      companyName: resultCompanyData[0].companyName,
      companyAbout: response,
    };

    try {
      await axios.put(`https://syukatu-app-backend.vercel.app/api/users/${user._id}/addToFavoriteCompanies`, { userId: user._id, addFavoriteCompanyContent });
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }

    deleteNewsForCompany(deleteCompanyName);
    fetchFavoriteCompanies();
  };

  const giveFutureGrowthPromptToChat = async (futureGrowthPrompt) => {
    axios.post("https://syukatu-app-backend.vercel.app/api/futureGrowthChat", { prompt: futureGrowthPrompt }).then((res) => {
      console.log("chatres", res);
      setFutureGrowthChatRes(res.data);
    }
    ).catch((err) => {
      console.error(err);
    });
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

  let maleWorkersProportion;
  let femaleWorkersProportion;

  if (companyWorkplaceInfo?.women_activity_infos?.female_workers_proportion) {
    femaleWorkersProportion = companyWorkplaceInfo?.women_activity_infos?.female_workers_proportion;
    maleWorkersProportion = 100 - femaleWorkersProportion;
  }

  const sexProportionData = {
    labels: ["男性", "女性"],
    datasets: [
      {
        label: "従業員の性別の割合",
        data: [maleWorkersProportion, femaleWorkersProportion],
        backgroundColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const sexProportionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // 凡例の位置
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw; // データの値
            return `${context.label}: ${value}%`; // %を追加
          },
        },
      },
    },
  };

  const isCompanyFavorited = resultCompanyData?.[0]?.companyName && 
    favoriteCompanies.some(company => company.companyName === resultCompanyData[0].companyName);

  return (
    <div className="Answer-wrp">
      <p className="welcomeText">{user.username}さん、ようこそ就活支援へ！</p>
      
      <div className="answer">
        <h2 className="section-title">売上高の推移</h2>
        <div className="chart-container">
          {netsalesYearsLabels && netsales && netsales.some(item => item) ? (
            <Bar options={netsalesOptions} data={netsalesBarData} />
          ) : (
            <p className="no-data-message">売上高の推移データがありません</p>
          )}
        </div>

        <h2 className="section-title">従業員数の推移</h2>
        <div className="chart-container">
          {numOfEmployeesYearsLabels && numOfEmployees && numOfEmployees.some(item => item) ? (
            <Bar options={numOfEmployeesOptions} data={numOfEmployeesBarData} />
          ) : (
              <p className="no-data-message">従業員数の推移データがありません</p>
          )}
        </div>

        <h2 className="section-title">企業基本情報</h2>
        {resultCompanyData?.[0]?.averageAge && resultCompanyData?.[0]?.averageAge !== "None" && (
          <div className="data-row">
            <span className="data-label">平均年齢</span>
            <span className="data-value">{resultCompanyData[0].averageAge}歳</span>
          </div>
        )}

        {resultCompanyData?.[0]?.averageAnnualSalary && resultCompanyData?.[0]?.averageAnnualSalary !== "None" && (
          <div className="data-row">
            <span className="data-label">平均年間給与</span>
            <span className="data-value">{resultCompanyData[0].averageAnnualSalary}円</span>
          </div>
        )}

        {resultCompanyData?.[0]?.averageLengthOfService && resultCompanyData?.[0]?.averageLengthOfService !== "None" && (
          <div className="data-row">
            <span className="data-label">平均勤続年数</span>
            <span className="data-value">{resultCompanyData[0].averageLengthOfService}年</span>
          </div>
        )}

        <h2 className="section-title">従業員データ</h2>
        <div className="employee-stats">
          <div className="employee-stats-row">
            <div className="employee-stat-item">
              <span className="stat-label">女性従業員の平均勤続年数</span>
              {companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Female &&
                companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Female !== "None" ? (
                <span className="stat-value">{companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Female}年</span>
              ) : (
                <span className="stat-value no-data">データなし</span>
              )}
            </div>
            <div className="employee-stat-item">
              <span className="stat-label">男性従業員の平均勤続年数</span>
              {companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Male &&
                companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Male !== "None" ? (
                <span className="stat-value">{companyWorkplaceInfo?.base_infos?.average_continuous_service_years_Male}年</span>
              ) : (
                <span className="stat-value no-data">データなし</span>
              )}
            </div>
          </div>
          {companyWorkplaceInfo?.women_activity_infos?.female_workers_proportion && (
            <div className="chart-container pie-chart">
              <Pie data={sexProportionData} options={sexProportionOptions} />
            </div>
          )}
        </div>

        <h2 className="section-title">所在地情報</h2>
        {resultCompanyData?.[0]?.location && (
          <div className="data-row">
            <span className="data-label">所在地</span>
            <span className="data-value">{resultCompanyData[0].location}</span>
          </div>
        )}

        {isLoaded && resultComLat && resultComLng && (
          <div className="map-container">
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
              <Marker position={center} />
            </GoogleMap>
          </div>
        )}

        {!answerLoading && response && (
          <>
            <div className="section-header">
              <h2 className="section-title">AIによる企業の将来像</h2>
              <button 
                className={`favorite-button ${isCompanyFavorited ? 'active' : ''}`}
                onClick={addToFavoriteCompanies}
                disabled={isCompanyFavorited}
                title={isCompanyFavorited ? "お気に入り登録済み" : "お気に入りに登録"}
              >
                {isCompanyFavorited ? <Favorite /> : <FavoriteBorder />}
              </button>
            </div>
            {answerLoading ? (
              <div className="loading-container">
                <p>AIによる分析中...</p>
              </div>
            ) : (
              <p className="company-detail">{futureGrowthChatRes}</p>
            )}
          </>
        )}
      </div>

      <div className="favoriteCompanies-wrp">
        {favoriteCompanies.length > 0 && (
          <h2 className="favoriteCompanies-head">お気に入り企業</h2>
        )}
        
        {favoriteCompanies.map((company, index) => (
          <div key={index} className="favoriteCompany">
            <h3 className="favoriteCompanies-name">{company.companyName}</h3>
            <p className="favoriteCompanies-about">{company.companyAbout}</p>
            
            <div className="news-section">
              <h4 className="news-section-head">{company.companyName}の最新ニュース</h4>
              {news[company.companyName] ? (
                news[company.companyName].value.map((news, i) => (
                  <a key={i} className="news-item" href={news.url} target="_blank" rel="noopener noreferrer">
                    <p className="news-description">・ {news.snippet}</p>
                  </a>
                ))
              ) : (
                <p>関連するニュースがありません</p>
              )}
            </div>

            <button
              className="action-button delete"
              onClick={() => deleteFromFavoriteCompanies(company.companyName, company.companyAbout)}
            >
              お気に入りから削除
            </button>
          </div>
        ))}
        
        {favoriteCompanies.length === 0 && (
          <p>お気に入りの企業がありません</p>
        )}
      </div>
    </div>
  );
}

export default Answer