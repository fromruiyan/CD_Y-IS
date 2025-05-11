import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../ResultEditStyles.css";

function TimestampEditor({ blocks, onUpdate, onDelete, onSeek }) {
  // const [expanded, setExpanded] = useState({});

  // const toggleExpand = (id) => {
  //   setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  // };

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

  return (
    <div className="timeline-wrapper">
      {blocks.map((block) => (
        <div className="timeline-entry" key={block.id}>
          <div className="dot" />
          <div className="timestamp-meta">
            <span onClick={() => onSeek(block.timestamp)}>
              ⏱ {formatTime(block.timestamp)}
            </span>
            {/* 타임스탬프별 문장 보여줄 시 토글 */}
            {/* <span onClick={() => toggleExpand(block.chapter_title)}>
              {expanded[block.chapter_title] ? "▲ 접기" : "▼ 펼치기"}
            </span> */}
          </div>

          <input
            type="text"
            value={block.chapter_title}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="input-field"
            style={{
              fontSize: "16px",
              marginBottom: "4px",
              width: "70%",
              border: "none",
              backgroundColor: "#f3f3f3",
            }}
          />

          <span className="timestamp-delete" onClick={() => onDelete(block.id)}>
            🗑 삭제
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EditPage({ blocks, setBlocks, videoRef }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, fileName, selectedCategories = [] } = location.state || {};
  const [videoUrl, setVideoUrl] = useState(null);
  const [newSummary, setNewSummary] = useState("");
  const [newStart, setNewStart] = useState("");

  //메모리정리
  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const updateBlock = (id, newTitle) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, chapter_title: newTitle } : b))
    );
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  //타임스탬프 추가시 시간순서대로
  const parseTimeString = (timeStr) => {
    // 정규표현식으로 HH:MM:SS 또는 MM:SS 또는 SS 형식만 허용
    const validFormat = /^(\d{1,2}:)?\d{1,2}:\d{2}$|^\d+$/;
    if (!validFormat.test(timeStr)) {
      alert("시간 입력을 다시 확인해주세요.");
      return null;
    }

    const parts = timeStr.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return null;
  };

  // 타임스탬프 추가
  const addBlock = () => {
    const startSeconds = parseTimeString(newStart);
    if (!newSummary && startSeconds === null) {
      alert("내용을 입력해주세요");
      return;
    }

    if (!newSummary) {
      alert("요약문을 입력해주세요");
      return;
    }

    if (isNaN(startSeconds === null)) {
      // 시간 미입력시에도 parseTimeString에서 경고알림 띄우게 처리
      return;
    }

    const newBlock = {
      id: Date.now().toString(),
      chapter_title: newSummary,
      timestamp: startSeconds,
    };

    setBlocks((prev) =>
      [...prev, newBlock].sort((a, b) => a.timestamp - b.timestamp)
    );

    setNewSummary("");
    setNewStart("");
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        <h1 className="header-title">Y-IS</h1>
        <div className="input-section">
          <div
            className="video-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "1rem",
            }}
          >
            {videoUrl ? (
              <video ref={videoRef} controls className="video-player">
                <source src={videoUrl} type={file?.type || "video/mp4"} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>비디오를 불러올 수 없습니다.</p>
            )}
          </div>
          <h3 style={{ textAlign: "center" }}>인덱스 추가</h3>
          <div className="input-grid">
            <input
              type="text"
              placeholder="제목"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="시작 시간(시:분:초)"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={addBlock} className="add-button">
            ➕ 추가하기
          </button>
        </div>

        <TimestampEditor
          blocks={blocks}
          onUpdate={updateBlock}
          onDelete={deleteBlock}
          onSeek={(time) => {
            if (videoRef.current) {
              videoRef.current.currentTime = time;
              videoRef.current.play();
            } else {
              alert("비디오가 아직 로드되지 않았어요!");
            }
          }}
        />
        <div className="button-row">
          <button
            onClick={() =>
              navigate("/result", {
                state: { file, fileName, selectedCategories },
              })
            }
            className="EditBackbutton"
          >
            🔙 결과로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
