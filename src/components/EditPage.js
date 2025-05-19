import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import "../style/ResultEditStyles.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

//수정페이지의 타임라인 표시, 편집
function TimestampEditor({
  blocks,
  onUpdate,
  onDelete,
  onSeek,
  expandedBlockIds,
  setExpandedBlockIds,
  onSentenceChange,
  dragInfo,
}) {
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
    // 1시간 이상이면 HH:MM:SS
      ? `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
          // 1시간 미만이면 MM:SS
      : `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
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
            <span
              className="timestamp-delete"
              onClick={() => onDelete(block.id)}
            >
              🗑 삭제
            </span>
          </div>

          <div
            className="input-toggle-wrapper"
            onClick={() =>
              setExpandedBlockIds((prev) =>
                prev.includes(block.id)
                  ? prev.filter((id) => id !== block.id)
                  : [...prev, block.id]
              )
            }
          >
            <span className="toggle-icon">
              {expandedBlockIds.includes(block.id) ? "🔽" : "▶️"}
            </span>
            <input
              type="text"
              value={block.chapter_title}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="input-field"
              style={{
                fontSize: "16px",
                width: "90%",
                border: "none",
                backgroundColor: "#f3f3f3",
              }}
            />
          </div>

          {expandedBlockIds.includes(block.id) && (
            <Droppable droppableId={String(block.id)} type="sentence">
              {(dropProvided, dropSnapshot) => (
                <div
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className="toggle-content-box"
                  style={{
                    backgroundColor: dropSnapshot.isDraggingOver
                      ? "#e0f7fa"
                      : "#f9f9f9",
                    border: "1px dashed #ccc",
                    borderRadius: "6px",
                    marginTop: "8px",
                    padding: "8px",
                    minHeight: "40px",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {(block.sentences || []).map((sentence, idx) => {
                    const shouldInsertLine =
                      dragInfo.blockId === block.id && dragInfo.index === idx;

                    return (
                      <React.Fragment key={`${block.id}-${idx}`}>
                        {shouldInsertLine && <div className="insertion-line" />}
                        <Draggable
                          draggableId={`${block.id}-${idx}`}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                marginBottom: "6px",
                                padding: "4px",
                                borderRadius: "4px",
                                background: snapshot.isDragging
                                  ? "#fef9c3"
                                  : "#fff",
                                boxShadow: snapshot.isDragging
                                  ? "0 2px 6px rgba(0, 0, 0, 0.2)"
                                  : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                transform: snapshot.isDragging
                                  ? "rotate(1deg)"
                                  : "none",
                                transition: "all 0.2s ease",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <span
                                style={{ cursor: "grab", marginRight: "6px" }}
                              >
                                ⠿
                              </span>
                              <textarea
                                className="pretty-textarea"
                                value={sentence} // ------------나중에 인덱스 동기화용 sentence를 sentence.text로
                                onChange={
                                  (e) =>
                                    onSentenceChange(
                                      block.id,
                                      idx,
                                      e.target.value
                                    )

                                  //---------------나중에 인덱스 동기화용-------
                                  // onSentenceChange(
                                  //   block.id,
                                  //   idx,
                                  //   e.target.value
                                  // )
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      </React.Fragment>
                    );
                  })}

                  {/* 마지막 삽입 위치 표시 */}
                  {dragInfo.blockId === block.id &&
                    dragInfo.index === block.sentences.length && (
                      <div className="insertion-line" />
                    )}

                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      ))}
    </div>
  );
}

export default function EditPage({ videoRef }) {
  const { blocks, setBlocks } = useBlocks();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [expandedBlockIds, setExpandedBlockIds] = useState([]);
  const [dragInfo, setDragInfo] = useState({ blockId: null, index: null }); // ✅ 추가

  //메모리정리
  useEffect(() => {
    if (!file) {
      setFileName(""); // ✅ 파일이 없을 때 fileName도 초기화
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setFileName(file.name); // ✅ 파일명 설정
    return () => URL.revokeObjectURL(url);
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

  const handleSentenceChange = (blockId, sentenceIndex, newText) => {
    const updated = blocks.map((b) =>
      b.id === blockId
        ? {
            ...b,
            sentences: b.sentences.map(
              (s, i) => (i === sentenceIndex ? newText : s)
              //------------------나중에 인덱스 동기화---------
              // i === sentenceIndex ? { ...s, text: newText } : s
            ),
          }
        : b
    );
    setBlocks(updated);
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

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (result.type === "block") {
      const newBlocks = Array.from(blocks);
      const [moved] = newBlocks.splice(result.source.index, 1);
      newBlocks.splice(result.destination.index, 0, moved);

      // ✅ 순서에 따라 timestamp 자동 재할당
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        timestamp: index * 10, // 또는 원하는 시간 간격
      }));

      setBlocks(updatedBlocks);
      return;
    }

    const sourceBlockId = source.droppableId;
    const destBlockId = destination.droppableId;
    const sourceIndex = source.index;
    const destIndex = destination.index;

    setBlocks((prev) => {
      const sourceBlockIdx = prev.findIndex(
        (b) => String(b.id) === source.droppableId
      );
      const destBlockIdx = prev.findIndex(
        (b) => String(b.id) === destination.droppableId
      );

      if (sourceBlockIdx === -1 || destBlockIdx === -1) return prev;

      const sourceBlock = prev[sourceBlockIdx];
      const destBlock = prev[destBlockIdx];

      const newSourceSentences = [...sourceBlock.sentences];
      const [moved] = newSourceSentences.splice(source.index, 1);

      const newDestSentences =
        source.droppableId === destination.droppableId
          ? newSourceSentences
          : [...destBlock.sentences];

      newDestSentences.splice(destination.index, 0, moved);

      const updatedBlocks = [...prev];
      updatedBlocks[sourceBlockIdx] = {
        ...sourceBlock,
        sentences:
          source.droppableId === destination.droppableId
            ? newDestSentences
            : newSourceSentences,
      };

      if (source.droppableId !== destination.droppableId) {
        updatedBlocks[destBlockIdx] = {
          ...destBlock,
          sentences: newDestSentences,
        };
        //-----------------나중에 인덱스 동기화 용----------
        // updatedBlocks[destBlockIdx] = {
        //   ...destBlock,
        //   sentences: newDestSentences,
        //   timestamp: moved.time || destBlock.timestamp, // time이 없으면 fallback
        // };
      }

      return updatedBlocks;
    });

    setDragInfo({ blockId: null, index: null });
  };

  const onDragUpdate = (update) => {
    const { destination } = update;
    if (destination) {
      setDragInfo({
        blockId: destination.droppableId,
        index: destination.index,
      });
    } else {
      setDragInfo({ blockId: null, index: null });
    }
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
    if (startSeconds === null || isNaN(startSeconds)) return;

    const newBlock = {
      id: crypto.randomUUID(),//block id
      chapter_title: newSummary,
      timestamp: startSeconds,
      sentences: [],
    };

    //----------나중에 토글로 타임스템프 옮겼을때 동기화 시키는 ----
    // const newBlock = {
    //   id: crypto.randomUUID(),
    //   chapter_title: newSummary,
    //   timestamp: startSeconds,
    //   sentences: [
    //     {
    //       text: newSummary,
    //       time: startSeconds,
    //     },
    //   ],
    // };

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
              <h3
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                인덱스 추가
              </h3>

              <label
                className="input-section-label"
                style={{ gridColumn: "1 / -1" }}
              >
                🕰️ 추가하고 싶은 챕터 시간 입력형식:(시:분:초)
              </label>
              <input
                type="text"
                placeholder="예: 00:10:30"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="Indexinput-field"
              />

              <label
                className="input-section-label"
                style={{ gridColumn: "1 / -1" }}
              >
                📝 추가하고 싶은 챕터 제목
              </label>
              <input
                type="text"
                placeholder="챕터 제목을 입력하세요"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="Indexinput-field"
              />

              <button
                onClick={addBlock}
                className="add-button"
                style={{ gridColumn: "1 / -1" }}
              >
                ✅ 챕터 추가하기
              </button>
              <p className="chapter-hint" style={{ gridColumn: "1 / -1" }}>
                ▶️ <strong>(챕터 제목)</strong> 클릭 시, 문장 편집이 가능합니다
              </p>
            </div>
          </div>

          <div className="right-column">
            <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
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
                expandedBlockIds={expandedBlockIds}
                setExpandedBlockIds={setExpandedBlockIds}
                onSentenceChange={handleSentenceChange}
                dragInfo={dragInfo}
              />
            </DragDropContext>
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
              alert("변경 내용을 저장하고 결과화면으로 이동합니다.");
              navigate("/result");
            }}
            className="EditBackbutton"
          >
            💾 변경 내용 저장
          </button>
        </div>
      </div>
    </div>
  );
}
