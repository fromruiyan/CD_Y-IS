import React from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const allowedExtensions = [
  "mp3",
  "mp4",
  "m4a",
  "wav",
  "flac",
  "webm",
  "ogg",
  "opus",
];

export default function Upload() {
  const navigate = useNavigate();
  const { file, fileName, setFile, setFileName } = useApp();
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (allowedExtensions.includes(extension)) {
      setFileName(selectedFile.name);
      setFile(selectedFile); // 파일 저장
    } else {
      alert("⚠️ 영상 파일을 업로드 해주세요.\n허용된 파일 형식: mp3, mp4, ...");
      e.target.value = null;
    }
  };

  return (
    <div className="container">
      <h1>Y-IS</h1>
      <div className="upload-box">
        <p>여기에 영상 파일을 드래그하거나 업로드하세요.</p>
        <input
          type="file"
          accept=".mp3,.mp4,.m4a,.wav,.flac,.webm,.ogg,.opus"
          onChange={handleFileChange}
        />
        {fileName && <p>선택된 파일: {fileName}</p>}
        <div className="button-group">
          <button onClick={() => navigate("/")}>이전으로</button>
          <button
            onClick={() => {
              if (file && fileName)
                navigate("/category");
              else alert("파일을 업로드 해주세요!");
            }}
          >
            업로드 완료
          </button>
        </div>
      </div>
    </div>
  );
}
