import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import "../style/ResultEditStyles.css";

//수정페이지의 타임라인 표시, 편집
function TimestampEditor({ blocks, onUpdate, onDelete, onSeek }) {
  //입력 시간 계산(if... 1이라 입력->자동으로 00:01)
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
    //타임라인 수정 영역
    <div className="timeline-wrapper">
      {blocks.map((block) => (
        <div className="timeline-entry" key={block.id}>
          <div className="dot" />
          <div className="timestamp-meta">
            {/* 누르면 해당 시간으로 */}
            <span onClick={() => onSeek(block.timestamp)}>
              ⏱ {formatTime(block.timestamp)}
            </span>
          </div>

          <input
            type="text"
            value={block.chapter_title}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="input-field"
            style={{
              fontSize: "16px",
              marginBottom: "4px",
              width: "90%",
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

export default function EditPage({ videoRef }) {
  const { blocks, setBlocks } = useBlocks();
  const navigate = useNavigate();
  const {
    file,
    setFile,
    fileName,
    setFileName,
    selectedCategories,
    setSelectedCategories,
  } = useApp();
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

  //텍스트 수정, 타임스탬프 삭제 영역
  const updateBlock = (id, newTitle) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, chapter_title: newTitle } : b))
    );
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // + 타임스탬프 추가시 시간순서대로
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

    // 시간 미입력시에도 parseTimeString에서 경고알림 띄우게 처리
    if (startSeconds === null || isNaN(startSeconds)) {
      return;
    }

    const newBlock = {
      id: crypto.randomUUID(), //block id
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

        <div className="edit-layout">
          {/* 왼쪽 영역 */}
          <div className="left-column">
            <div className="EditP_video-container">
              {videoUrl ? (
                <video ref={videoRef} controls className="EditP_video-player">
                   <source src={videoUrl} type={file?.type || "video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p>비디오를 불러올 수 없습니다.</p>
              )}
            </div>

            <div className="input-grid">
              <h3 style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                인덱스 추가
              </h3>
              <input
                type="text"
                placeholder="제목"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="Indexinput-field"
              />
              <input
                type="text"
                placeholder="시작 시간(시:분:초)"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="Indexinput-field"
              />

              <button onClick={addBlock} className="add-button">
                ➕ 추가하기
              </button>
            </div>
          </div>

          {/* 오른쪽 영역 */}
          <div className="right-column">
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
          </div>
        </div>

        <div className="button-row">
          <button
            onClick={() => navigate("/result")}
            className="EditBackbutton"
          >
            🔙 결과로 돌아가기
          </button>
          <button
            onClick={() => {
              navigate("/toggle");
            }}
            className="EditBackbutton"
          >
            ✏️ 문장 수정
          </button>
        </div>
      </div>
    </div>
  );
}
