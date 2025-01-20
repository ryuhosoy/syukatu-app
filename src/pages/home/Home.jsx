import { useState } from "react";
import Answer from "../../components/answer/Answer";
import Topbar from "../../components/topbar/Topbar";

function Home() {
  const [response, setResponse] = useState("");
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [resultCompanyData, setResultCompanyData] = useState([]);
  const [companyWorkplaceInfo, setCompanyWorkplaceInfo] = useState("");

  return (
    <>
      <Topbar setAnswerLoading={setAnswerLoading} setResponse={setResponse} setResultCompanyData={setResultCompanyData} setCompanyWorkplaceInfo={setCompanyWorkplaceInfo} companyWorkplaceInfo={companyWorkplaceInfo} />
      {/*sidebar*/}
      <Answer response={response} setResponse={setResponse} favoriteCompanies={favoriteCompanies} setFavoriteCompanies={setFavoriteCompanies} answerLoading={answerLoading} resultCompanyData={resultCompanyData} companyWorkplaceInfo={companyWorkplaceInfo} />
      {/*rightber*/}
    </>
  );
}

export default Home
