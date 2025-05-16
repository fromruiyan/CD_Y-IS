import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import styles from '../style/ToggleHandleStyle.module.css';

//시간 형식
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

export default function ToggleHandle() {
  const { blocks, setBlocks } = useBlocks(); // context에서 불러오기
  const {
    file,
    setFile,
    fileName,
    setFileName,
    selectedCategories,
    setSelectedCategories,
  } = useApp();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleSentenceChange = (blockId, sentenceIndex, newText) => {
    const updated = blocks.map((b) =>
      b.id === blockId
        ? {
            ...b,
            sentences: b.sentences.map((s, i) =>
              i === sentenceIndex ? newText : s
            ),
          }
        : b
    );
    setBlocks(updated);
  };

  return (
    <div className={styles.flexRow}>
        <div className="page-wrapper">
        <h1 className="header-title">Y-IS</h1>
        <div className="card">
          <div className="flex-row">
            <div className="timeline-wrapper">
              {blocks.map((block) => (
                <div className="timeline-block" key={block.id}>
                  <div className="timeline-header">
                    <div className="timestamp-line">
                      <span className="timestamp">
                        {formatTime(block.timestamp)}
                      </span>
                      <span className="chapter-title">{block.chapter_title}</span>
                    </div>
                    <span>{block.summary}</span>
                    <button
                      className="toggle-btn"
                      onClick={() => toggle(block.id)}
                    >
                      {openId === block.id ? "닫기" : "자세히 보기"}
                    </button>
                  </div>

                  {openId === block.id && (
                    <div className="sentence-list">
                      {block.sentences.map((s, i) => (
                        <textarea
                          key={i}
                          value={s}
                          onChange={(e) =>
                            handleSentenceChange(block.id, i, e.target.value)
                          }
                          className="sentence-input"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="button-row">
            <button
              onClick={() =>
                navigate("/edit")
              }
              className="Backbutton"
            >
              🔙뒤로가기
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}
