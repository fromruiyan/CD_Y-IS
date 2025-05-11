import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Y-IS</h1>
      <p>AI 기반 유튜브 인덱싱 시스템</p>
      <button onClick={() => navigate("/upload")}>시작하기</button>
    </div>
  );
}

export default Home;
