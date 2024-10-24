import { useState } from "react";
import Answer from "../../components/answer/Answer";
import Topbar from "../../components/topbar/Topbar";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [answerLoading, setAnswerLoading] = useState(false);

  return (
    <>
      <Topbar prompt={prompt} setPrompt={setPrompt} setAnswerLoading={setAnswerLoading} setResponse={setResponse} />
      {/*sidebar*/}
      <Answer prompt={prompt} response={response} setResponse={setResponse} favoriteCompanies={favoriteCompanies} setFavoriteCompanies={setFavoriteCompanies} answerLoading={answerLoading} />
      {/*rightber*/}
    </>
  );
}

export default Home
