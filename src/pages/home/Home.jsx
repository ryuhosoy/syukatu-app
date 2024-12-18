import { useState } from "react";
import Answer from "../../components/answer/Answer";
import Topbar from "../../components/topbar/Topbar";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [resultCompanyData, setResultCompanyData] = useState([]);

  return (
    <>
      <Topbar prompt={prompt} setPrompt={setPrompt} setAnswerLoading={setAnswerLoading} setResponse={setResponse} setResultCompanyData={setResultCompanyData} />
      {/*sidebar*/}
      <Answer prompt={prompt} response={response} setResponse={setResponse} favoriteCompanies={favoriteCompanies} setFavoriteCompanies={setFavoriteCompanies} answerLoading={answerLoading} resultCompanyData={resultCompanyData} />
      {/*rightber*/}
    </>
  );
}

export default Home
