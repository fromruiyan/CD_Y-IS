// LoadingPage.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import "../style/LoadingPageStyle.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function LoadingPage() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { videoId, fileName, categories } = location.state || {};

  const { setBlocks } = useBlocks();
  const { setFileName, setSelectedCategories } = useApp();
  
  useEffect(() => {
    if (!videoId) {
      console.error("❌ videoId가 없습니다.");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/status/${videoId}`);
        const data = await res.json();
        console.log("✅ 상태 응답:", data);

        if (data.status === "completed") {
          clearInterval(interval);
          setBlocks(data.metadata.blocks);
          setFileName(data.metadata.fileName);
          setSelectedCategories(new Set(data.metadata.categories));
          navigate("/result");
        }
      } catch (error) {
        console.error("🔁 상태 확인 실패", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [videoId]);

  return (
    <div>
      <h2 className="LoadHeader">로딩중...</h2>
      <p className="LoadSubhead">잠시만 기다려 주세요.</p>
      <div className="loading-spinner"></div>
    </div>
  );
}
