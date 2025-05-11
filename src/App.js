import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles.css";
import "./ResultEditStyles.css";
import Home from "./components/Home";
import Upload from "./components/Upload";
import Category from "./components/Category";
import ResultPage from "./components/ResultPage";
import EditPage from "./components/EditPage";
import DownloadComplete from "./components/DownloadComplete";

export default function App() {
  const [blocks, setBlocks] = useState([]);
  const [fileName, setFileName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  //영상파일
  const [file, setFile] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/summaryData.json");
        if (!response.ok) throw new Error("데이터 로드 실패");
        const data = await response.json();
        setBlocks(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/upload"
          element={
            <Upload
              fileName={fileName}
              setFileName={setFileName}
              file={file}
              setFile={setFile}
            />
          }
        />
        <Route
          path="/category"
          element={
            <Category
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          }
        />
        <Route
          path="/result"
          element={
            <ResultPage
              blocks={blocks}
              setBlocks={setBlocks}
              videoRef={videoRef}
              file={file}
              fileName={fileName}
            />
          }
        />
        <Route
          path="/edit"
          element={
            <EditPage
              blocks={blocks}
              setBlocks={setBlocks}
              videoRef={videoRef}
              selectedCategories={selectedCategories}
            />
          }
        />
        <Route path="/complete" element={<DownloadComplete />} />
      </Routes>
    </Router>
  );
}
