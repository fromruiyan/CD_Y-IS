import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import downloadTextFile from "./downloadTextFile";
import "../ResultEditStyles.css";

export default function ResultPage({ blocks }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { file, fileName, selectedCategories = [] } = location.state || {};

  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="page-wrapper">
      <h1 className="header-title">Y-IS</h1>
      <div className="card">
        <div className="flex-row">
          <div className="video-container">
            {videoUrl ? (
              <video controls className="video-player">
                <source src={videoUrl} type={file?.type || "video/mp4"} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>비디오를 불러올 수 없습니다.</p>
            )}
          </div>

          <div className="text-container">
            <div className="label">제목</div>
            <div className="value-box">{fileName}</div>

            <div className="label" style={{ marginTop: "12px" }}>
              카테고리
            </div>
            <div className="value-box">{selectedCategories.join(", ")}</div>
          </div>
        </div>

        <div className="timestamp-box">
          {blocks.map((b, i) => (
            <div key={i}>
              {formatTime(b.timestamp)} {b.chapter_title}
            </div>
          ))}
        </div>

        <div className="button-row">
          <button
            onClick={() =>
              navigate("/edit", {
                state: { file, fileName, selectedCategories },
              })
            }
            className="button"
          >
            ✏️ 수정하기
          </button>
          <button onClick={() => downloadTextFile(blocks, ()=> {navigate("/complete");})} className="button">
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

  if (hrs > 0) {
    // 1시간 이상이면 HH:MM:SS
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    // 1시간 미만이면 MM:SS
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}
