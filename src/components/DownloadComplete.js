import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../style/DownloadCompletestyle.css";

export default function DownloadComplete() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { setFile, setFileName, setSelectedCategories } = useApp();

  useEffect(() => {
    // 0.5초 후에 애니메이션 트리거
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    setFile(null);
    setFileName("");
    setSelectedCategories(new Set());

    // localStorage 초기화
    localStorage.removeItem("fileName");
    localStorage.removeItem("selectedCategories");

    navigate("/");
  };

  return (
    <div className="download-page">
      <h1 className={`fade-in-text ${visible ? "visible" : ""}`}>
        다운로드가 완료되었습니다.
      </h1>
      <button className="home-button" onClick={handleGoHome}>
        🏠 홈으로
      </button>
    </div>
  );
}
