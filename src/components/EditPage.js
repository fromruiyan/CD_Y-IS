import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useBlocks } from "../context/BlocksContext";
import { useApp } from "../context/AppContext";
import "../style/ResultEditStyles.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

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
  //문장 이동 UI
  const isMovingSentence = (blockId, sentence, idx) => {
    if (dragInfo.sourceBlockId === null) return false;

    const sourceBlockId = dragInfo.sourceBlockId;
    const sourceIndex = dragInfo.sourceIndex;

    // "블록 간 이동"이 확정된 경우만 적용 (direction 있을 때만!)
    if (dragInfo.direction === "up" || dragInfo.direction === "down") {
      if (String(blockId) === sourceBlockId) {
        // 잡은 문장부터 아래 문장들 숨기기 (down) or 위로 (up) 방향 따라 설정 가능
        if (dragInfo.direction === "up") {
          return idx <= sourceIndex;
        } else {
          return idx >= sourceIndex;
        }
      }
    }

    // direction 없으면 → 이동 아님 → 숨기지 않음
    return false;
  };

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

  // 이동중인 문장 개수 계산
  const movingSentenceCount = React.useMemo(() => {
    if (dragInfo.sourceBlockId === null) return 0;

    const sourceBlock = blocks.find(
      (b) => String(b.id) === dragInfo.sourceBlockId
    );
    if (!sourceBlock) return 0;

    const sourceIndex = dragInfo.sourceIndex;

    if (dragInfo.direction === "up") {
      return sourceIndex + 1; // 0 ~ sourceIndex → sourceIndex + 1개
    } else if (dragInfo.direction === "down") {
      return sourceBlock.sentences.length - sourceIndex;
    }

    return 0;
  }, [dragInfo, blocks]);

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
                          {(provided, snapshot) => {
                            const isDraggingSourceBlock =
                              dragInfo.sourceBlockId !== null &&
                              String(block.id) === dragInfo.sourceBlockId;
                            const isSourceSentence =
                              isDraggingSourceBlock &&
                              idx === dragInfo.sourceIndex;

                            return (
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
                                  opacity: isMovingSentence(
                                    block.id,
                                    sentence,
                                    idx
                                  )
                                    ? 0
                                    : 1,
                                  height: isMovingSentence(
                                    block.id,
                                    sentence,
                                    idx
                                  )
                                    ? 0
                                    : "auto",
                                  overflow: "visible",
                                  position: "relative", // badge 위치
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
                                  value={sentence}
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
                                {/* badge 표시 */}
                                {isSourceSentence &&
                                  movingSentenceCount > 0 && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: "-8px",
                                        right: "-8px",
                                        backgroundColor: "#f44336",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                                        zIndex: 10,
                                      }}
                                    >
                                      {movingSentenceCount}
                                    </div>
                                  )}
                              </div>
                            );
                          }}
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
  const [dragInfo, setDragInfo] = useState({ blockId: null, index: null }); 
  

  const apiUrl = process.env.REACT_APP_API_URL;

  //변경내용반영
  const saveChangesAndFetch = async () => {
    try {
      const videoId = location.state?.videoId;
      if (!videoId) {
        alert("videoId가 없습니다!");
        return;
      }

      // 1. 변경된 blocks 데이터를 서버에 POST
      await axios.post(`${apiUrl}/sentences/update/${videoId}`, {
        blocks: blocks  // 현재 상태 보내기
      });

      // 2. 서버에서 최신 summary 데이터 다시 가져오기
      const res = await axios.get(`${apiUrl}/sentences/summary/${videoId}`);
      const newBlocks = res.data;

      // 3. 받아온 데이터를 setBlocks 에 반영
      setBlocks(newBlocks);

      // 4. 완료 후 navigate
      alert("변경 내용을 저장하고 결과화면으로 이동합니다.");
      navigate("/result");

    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  //메모리정리
  useEffect(() => {
    if (!file) {
      setFileName(""); // 파일이 없을 때 fileName도 초기화
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setFileName(file.name); // 파일명 설정
    
    return () => {
      if (url) URL.revokeObjectURL(url);
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

  // 타임스탬프 추가시 시간순서대로
  const parseTimeString = (timeStr) => {
    //HH:MM:SS 또는 MM:SS 또는 SS 형식
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

    // 챕터 순서 바꾸는 건 기존처럼 유지
    if (result.type === "block") {
      const newBlocks = Array.from(blocks);
      const [moved] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, moved);

      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        timestamp: index * 10,
      }));

      setBlocks(updatedBlocks);
      return;
    }

    const sourceBlockId = source.droppableId;
    const destBlockId = destination.droppableId;
    const sourceIndex = source.index;
    const destIndex = destination.index;

    // 동일한 챕터 내에서는 이동 금지
    if (sourceBlockId === destBlockId) return;

    setBlocks((prev) => {
      const sourceBlockIdx = prev.findIndex(
        (b) => String(b.id) === sourceBlockId
      );
      const destBlockIdx = prev.findIndex((b) => String(b.id) === destBlockId);
      if (sourceBlockIdx === -1 || destBlockIdx === -1) return prev;

      const sourceBlock = { ...prev[sourceBlockIdx] };
      const destBlock = { ...prev[destBlockIdx] };

      const sourceSentences = [...sourceBlock.sentences];
      const destSentences = [...destBlock.sentences];

      let movedItems = [];
      let remainingItems = [];

      if (destBlockIdx < sourceBlockIdx) {
        // 위 챕터로 이동 → 선택한 문장 이전 것들까지 이동
        movedItems = sourceSentences.slice(0, sourceIndex + 1);
        remainingItems = sourceSentences.slice(sourceIndex + 1);
      } else {
        // 아래 챕터로 이동 → 선택한 문장 이후 것들 이동
        movedItems = sourceSentences.slice(sourceIndex);
        remainingItems = sourceSentences.slice(0, sourceIndex);
      }

      // 문장 삽입
      destSentences.splice(destIndex, 0, ...movedItems);

      const updatedBlocks = [...prev];
      updatedBlocks[sourceBlockIdx] = {
        ...sourceBlock,
        sentences: remainingItems,
      };
      updatedBlocks[destBlockIdx] = {
        ...destBlock,
        sentences: destSentences,
      };

      return updatedBlocks;
    });

    setDragInfo({ blockId: null, index: null });
    //setDragInfo({ blockId: null, index: null, sourceBlockId: null, sourceIndex: null, direction: null });

  };

  // const onDragEnd = (result) => {
  //   const { source, destination } = result;
  //   if (!destination) return;

  //   if (result.type === "block") {
  //     const newBlocks = Array.from(blocks);
  //     const [moved] = newBlocks.splice(result.source.index, 1);
  //     newBlocks.splice(result.destination.index, 0, moved);

  //     // ✅ 순서에 따라 timestamp 자동 재할당
  //     const updatedBlocks = newBlocks.map((block, index) => ({
  //       ...block,
  //       timestamp: index * 10, // 또는 원하는 시간 간격
  //     }));

  //     setBlocks(updatedBlocks);
  //     return;
  //   }

  //   const sourceBlockId = source.droppableId;
  //   const destBlockId = destination.droppableId;
  //   const sourceIndex = source.index;
  //   const destIndex = destination.index;

  //   setBlocks((prev) => {
  //     const sourceBlockIdx = prev.findIndex(
  //       (b) => String(b.id) === source.droppableId
  //     );
  //     const destBlockIdx = prev.findIndex(
  //       (b) => String(b.id) === destination.droppableId
  //     );

  //     if (sourceBlockIdx === -1 || destBlockIdx === -1) return prev;

  //     const sourceBlock = prev[sourceBlockIdx];
  //     const destBlock = prev[destBlockIdx];

  //     const newSourceSentences = [...sourceBlock.sentences];

  //     const [moved] = newSourceSentences.splice(source.index, 1);

  //     const newDestSentences =
  //       source.droppableId === destination.droppableId
  //         ? newSourceSentences
  //         : [...destBlock.sentences];

  //     newDestSentences.splice(destination.index, 0, moved);

  //     const updatedBlocks = [...prev];
  //     updatedBlocks[sourceBlockIdx] = {
  //       ...sourceBlock,
  //       sentences:
  //         source.droppableId === destination.droppableId
  //           ? newDestSentences
  //           : newSourceSentences,
  //     };

  //     if (source.droppableId !== destination.droppableId) {
  //       updatedBlocks[destBlockIdx] = {
  //         ...destBlock,
  //         sentences: newDestSentences,
  //       };
  //       //-----------------나중에 인덱스 동기화 용----------
  //       // updatedBlocks[destBlockIdx] = {
  //       //   ...destBlock,
  //       //   sentences: newDestSentences,
  //       //   timestamp: moved.time || destBlock.timestamp, // time이 없으면 fallback
  //       // };
  //     }

  //     return updatedBlocks;
  //   });

  //   setDragInfo({ blockId: null, index: null });
  // };

  const onDragUpdate = (update) => {
    const { destination, source } = update;

    // 기존에 저장된 direction 유지
    setDragInfo((prev) => {
      let direction = prev.direction;

      if (destination) {
        const destBlockId = destination.droppableId;
        const sourceBlockId = source.droppableId;

        if (destBlockId !== sourceBlockId) {
          // direction 을 갱신 (딱 한 번만 바뀌게)
          direction = destBlockId < sourceBlockId ? "up" : "down";
        }
      }

      return {
        blockId: destination ? destination.droppableId : null,
        index: destination ? destination.index : null,
        sourceBlockId: source.droppableId,
        sourceIndex: source.index,
        direction: direction, // 유지!
      };
    });
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
      id: crypto.randomUUID(), //block id
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
            onClick={saveChangesAndFetch}
            className="EditBackbutton"
          >
            💾 변경 내용 저장
          </button>
        </div>
      </div>
    </div>
  );
}
