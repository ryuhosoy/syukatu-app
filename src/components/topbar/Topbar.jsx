import { Chat, Notifications, Search, LogoutRounded, PersonRemoveRounded } from "@mui/icons-material";
import "./Topbar.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../state/AuthContext";
import axios from "axios";
import { logoutCall } from "../../actionCalls";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { FixedSizeList } from "react-window";

function Topbar({ setAnswerLoading, setResponse, setResultCompanyData, setCompanyWorkplaceInfo, companyWorkplaceInfo, setAverageAnnualSalaryRanking }) {
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [companiesData, setCompaniesData] = useState("");
  const [companiesSelectData, setCompaniesSelectData] = useState([]);
  const [searchCorporateNumber, setSearchCorporateNumber] = useState("");

  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompaniesData();
  }, []);

  useEffect(() => {
    reflectResult();
    if (searchCompanyName) {
      fetchSearchCorporateNumber();
    }
  }, [searchCompanyName]);

  useEffect(() => {
    if (searchCorporateNumber) {
      fetchCompaniesWorkplaceInfo();
    }
  }, [searchCorporateNumber]);

  const fetchCompaniesData = async () => {
    try {
      const res = await axios.get(`https://syukatu-app-backend.vercel.app/api/companies/companiesData`);
      const resCompaniesData = res.data;
      console.log("resCompaniesData", resCompaniesData);
      
      // 平均年収でソートしたランキングを作成
      const sortedByAverageAnnualSalary = [...resCompaniesData]
        .filter(company => company.averageAnnualSalary && !isNaN(company.averageAnnualSalary))
        .sort((a, b) => {
          return b.averageAnnualSalary - a.averageAnnualSalary;
        });
      console.log("sortedByAverageAnnualSalary", sortedByAverageAnnualSalary);
      
      setAverageAnnualSalaryRanking(sortedByAverageAnnualSalary);

      setCompaniesData(resCompaniesData);
      setCompaniesSelectData(
        resCompaniesData.map((resCompanyData) => {
          return {
            value: resCompanyData.companyName,
            label: resCompanyData.companyName,
          };
        })
      );
    } catch (err) {
      console.error(err);
    }
  }

  const fetchSearchCorporateNumber = async () => {
    try {
      const res = await axios.post(`https://syukatu-app-backend.vercel.app/api/companies/corporateNumber`, { corporateName: searchCompanyName });
      console.log("fetchSearchCorporateNumber", res.data["hojin-infos"][0]);
      const corporateNumber = res.data["hojin-infos"][0].corporate_number
      console.log("corporateNumber", corporateNumber);
      setSearchCorporateNumber(corporateNumber);
    } catch (err) {
      console.error(err);
    }
  };

  // その後その法人番号で職場情報を得るapiを叩いて職場情報を得る。
  const fetchCompaniesWorkplaceInfo = async () => {
    try {
      const res = await axios.post(`https://syukatu-app-backend.vercel.app/api/companies/companiesWorkplaceInfo`, { corporateNumber: searchCorporateNumber });
      console.log("fetchCompaniesWorkplaceInfo", res.data["hojin-infos"][0].workplace_info);
      setCompanyWorkplaceInfo(res.data["hojin-infos"][0].workplace_info);
    } catch (err) {
      console.error(err);
    }
  };

  // console.log(companiesSelectData);

  // useEffect(第2引数[searchCompanyName])でsearchCompanyNameが変わるごとに毎回searchCompanyNameからlocalstorageの会社から探し、その結果(point: どう結果を出すか?→その時点でのsearchCompanyNameを漢字で会社名に含む会社名をすべてsetResultCompaniesNamesに格納)をすべてsetResultCompaniesNamesに格納する
  // useEffect(() => {
  //   const companiesData = JSON.parse(localStorage.getItem("companiesData"));
  //   if (companiesData) {
  //     const resultCompaniesData = companiesData.filter((companyData) => {
  //       return companyData.companyName.indexOf(searchCompanyName) !== -1;
  //     })
  //     setResultCompaniesNames(resultCompaniesData);
  //     // console.log("resultCompaniesData", resultCompaniesData);
  //   }
  // }, [searchCompanyName]);

  const handleSetSearchCompanyName = (selectedOption) => {
    setSearchCompanyName(selectedOption.label);
    // console.log("searchCompanyName", selectedOption.label);
    giveCompanyNameToChat(selectedOption.label);
  };

  const giveCompanyNameToChat = (searchCompanyName) => {
    // console.log("searchCompanyName", searchCompanyName);

    setAnswerLoading(true);
    axios.post("https://syukatu-app-backend.vercel.app/api/chat", { prompt: searchCompanyName }).then((res) => {
      setAnswerLoading(false);
      setResponse(res.data);
    }
    ).catch((err) => {
      console.error(err);
    });
  };

  const reflectResult = () => {
    if (companiesData) {
      const resultCompanyData = companiesData.filter((companyData) => {
        return companyData.companyName == searchCompanyName;
      });
      setResultCompanyData(resultCompanyData);
    }
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
      console.error(err);
    }
  };

  const MENU_LIST_ITEM_HEIGHT = 40;

  function MenuList({ options, getValue, maxHeight, children }) {
    if (!Array.isArray(children)) {
      return null;
    }

    const [selectedOption] = getValue(); // 選択されているオプションを取得
    const initialScrollOffset =
      options.indexOf(selectedOption) * MENU_LIST_ITEM_HEIGHT; // 選択されたオプションのインデックスを使ってスクロール位置を計算

    return (
      <FixedSizeList
        width="auto"
        height={maxHeight}
        itemCount={children.length}
        itemSize={MENU_LIST_ITEM_HEIGHT}
        initialScrollOffset={initialScrollOffset}
      >
        {({ index, style }) => (
          <div style={style}>
            {children[index]}
          </div>
        )}
      </FixedSizeList>
    );
  }

  const { user } = useContext(AuthContext);

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      width: '100%',
      minHeight: '40px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #2c517c'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '10px',
      marginTop: '8px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2c517c' : state.isFocused ? '#f0f5fa' : 'white',
      '&:hover': {
        backgroundColor: '#f0f5fa'
      }
    })
  };

  return (
    <div className="topbarContainer">
      <div className="topbarInner">
        <div className="topbarLeft">
          <span className="logo">就活支援</span>
        </div>
        
        <div className="topbarCenter">
          <Select
            options={companiesSelectData}
            components={{ MenuList }}
            onChange={handleSetSearchCompanyName}
            placeholder="企業名を検索..."
            styles={customSelectStyles}
            className="company-select"
          />
        </div>
        
        <div className="topbarRight">
          <div className="userActions">
            <button type="button" onClick={logout} className="actionButton">
              <LogoutRounded className="actionIcon" />
              <span className="buttonText">ログアウト</span>
            </button>
            <button type="button" onClick={deleteAccount} className="actionButton deleteAccount">
              <PersonRemoveRounded className="actionIcon" />
              <span className="buttonText">アカウント削除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar