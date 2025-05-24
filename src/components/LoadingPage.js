// LoadingPage.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import { normalizeBlocks } from "../utils/normalizeBlocks";
import "../style/LoadingPageStyle.css";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export default function LoadingPage() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { videoId, fileName, categories } = location.state || {};

  const { setBlocks } = useBlocks();
  
  useEffect(() => {
    if (!videoId) {
      console.error("❌ videoId가 없습니다.");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${apiUrl}/status/${videoId}`);
        const data = res.data;
        
        if (data.error) {
          console.error("❌ 서버 오류 응답:", data.error);
          clearInterval(interval);
          alert("서버에서 오류가 발생했습니다: " + data.error);
          return;
        }
        console.log("✅ 상태 응답:", data);

        if (data.status === "completed") {
          clearInterval(interval);

          //서버에서 blocks없을 시 대비
          if (!Array.isArray(data.metadata.blocks)) {
            alert("⚠️ 서버에서 요약 정보가 누락되었습니다.");
            return;
          }

          const blocks = normalizeBlocks(data.metadata.blocks);
          setBlocks(blocks);

          navigate("/result", { state: { videoId } });
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
