import "./style/ResultEditStyles.css";
import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BlocksProvider } from "./context/BlocksContext";
import { AppProvider } from "./context/AppContext";
import "./styles.css";
import "./style/ResultEditStyles.css";
import Home from "./components/Home";
import Upload from "./components/Upload";
import Category from "./components/Category";
import ResultPage from "./components/ResultPage";
import EditPage from "./components/EditPage";
import DownloadComplete from "./components/DownloadComplete";
import ToggleHandle from "./components/ToggleHandle";
import LoadingPage from "./components/LoadingPage";

export default function App() {
  const [blocks, setBlocks] = useState([]);
  const [fileName, setFileName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  //영상파일
  const [file, setFile] = useState(null);
  const videoRef = useRef(null);

  return (
    <AppProvider>
      <BlocksProvider>
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
            <Route path="/loading" element={<LoadingPage />} />
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
            <Route path="/edit" element={<EditPage videoRef={videoRef} />} />

            <Route
              path="/complete"
              element={
                <DownloadComplete
                  setFile={setFile}
                  setFileName={setFileName}
                  setSelectedCategories={setSelectedCategories}
                />
              }
            />
            <Route path="/toggle" element={<ToggleHandle />} />
          </Routes>
        </Router>
      </BlocksProvider>
    </AppProvider>
  );
}
