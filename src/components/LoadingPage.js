// LoadingPage.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
// import { normalizeBlocks } from "../utils/normalizeBlocks";
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

          try {
          // ✅ 결과 데이터를 따로 가져오기
          const summaryRes = await axios.get(`${apiUrl}/sentences/summary/${videoId}`);
          const summaryData = summaryRes.data;

          //서버에서 데이터없을 시 대비
          if (!Array.isArray(summaryData)) {
            alert("⚠️ 서버에서 요약 정보가 누락되었습니다.");
            return;
          }

          // 데이터가 blocks형태로 제공되지 않을 시 block화 하는 코드(src/utils/normalizeBlocks.js)
          // const blocks = normalizeBlocks(data.metadata.blocks);
          setBlocks(summaryData);

          navigate("/result", { state: { videoId } });
        
        } catch (summaryError) {
          console.error("❌ 요약 정보 요청 실패:", summaryError);
          alert("요약 정보를 가져오는 데 실패했습니다.");
        }
      }

    } catch (error) {
      console.error("🔁 상태 확인 실패", error);
    }
  }, 3000);

  // ✅ clean-up 함수
  return () => clearInterval(interval);
}, [videoId, navigate, setBlocks]);

  return (
    <div>
      <h2 className="LoadHeader">로딩중...</h2>
      <p className="LoadSubhead">잠시만 기다려 주세요.</p>
      <div className="loading-spinner"></div>
    </div>
  );
  }
