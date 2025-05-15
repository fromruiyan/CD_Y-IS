import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomeStyle.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-header">Y-IS</h1>
      <p className="home-description">AI 기반 유튜브 인덱싱 시스템</p>
      <button onClick={() => navigate("/upload")}>시작하기</button>
    </div>
  );
}

export default Home;
