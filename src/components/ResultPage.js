import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useBlocks } from "../context/BlocksContext";
import downloadTextFile from "./downloadTextFile";
import "../style/ResultEditStyles.css";


export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

 const { videoId } = location.state || {};
 const { fileName, selectedCategories } = useApp();
  const { blocks } = useBlocks();

  //loadingPage에서만 데이터를 받아오는걸로 하고 resultPage는 삭제
  useEffect(() => {
  if (!videoId || !fileName || blocks.length === 0) {
    alert("⚠️데이터가 없습니다. 홈으로 이동합니다.")
    navigate("/");
    }
  }, [videoId, fileName, blocks, navigate]);


  return (
    <div className="page-wrapper">
      <h1 className="header-title">Y-IS</h1>
      <div className="card">
        <div className="flex-row">
          <div className="video-container">
            <video controls className="video-player">
              <source src={`/video/${fileName}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="text-container">
            <div className="label">제목</div>
            <div className="value-box">{fileName}</div>
            <div className="label" style={{ marginTop: "12px" }} >카테고리</div>
            <div className="value-box">
              {Array.from(selectedCategories).join(", ")}
            </div>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="loading-text">요약 데이터를 불러오는 중입니다...</div>
        ) : (
          <div className="timestamp-box">
            {blocks.map((b, i) => (
              <div key={i}>
                {formatTime(b.timestamp)} {b.chapter_title}
              </div>
            ))}
          </div>
        )}


        <div className="button-row">
          <button onClick={() => navigate("/edit")} className="button">
            ✏️ 수정하기
          </button>
          <button
            onClick={() =>
              downloadTextFile(blocks, fileName, () => {
                navigate("/complete");
              })
            }
            className="button"
          >
            📄 텍스트로 저장
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hrs > 0
    ? `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    : `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
}
