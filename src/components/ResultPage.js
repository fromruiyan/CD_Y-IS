import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useBlocks } from "../context/BlocksContext";
import downloadTextFile from "./downloadTextFile";
import axios from "axios";
import "../style/ResultEditStyles.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
 const { videoId } = location.state || {};
 const { fileName, selectedCategories, setFileName, setSelectedCategories } = useApp();
  const { blocks, setBlocks } = useBlocks();
  const [videoUrl, setVideoUrl] = useState(null);
  // 서버에서 데이터 받아오기
  useEffect(() => {
    if (!videoId) {
      console.warn("⚠️ videoId 없음");
      return;
    }

    const fetchResultData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/status/${videoId}`);
        const { metadata } = response.data;

        setFileName(metadata.fileName);
        setSelectedCategories(new Set(metadata.categories));
        setBlocks(metadata.blocks); //blocks설정
      } catch (error) {
        console.error("❌ 데이터 불러오기 실패:", error);
      }
    };

    fetchResultData();
  }, [videoId]);

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
