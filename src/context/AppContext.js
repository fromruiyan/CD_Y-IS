// AppContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

// ✅ 로컬스토리지 key를 상수로 관리
const FILE_NAME_KEY = "fileName";
const SELECTED_CATEGORIES_KEY = "selectedCategories";
const VIDEO_ID_KEY = "videoId";

export function AppProvider({ children }) {
  const [file, setFile] = useState(null);

  const [fileName, setFileName] = useState(() => {
    return localStorage.getItem(FILE_NAME_KEY) || "";
  });

  const [videoId, setVideoId] = useState(() => {
  return localStorage.getItem(VIDEO_ID_KEY) || "";
  });

  const [selectedCategories, setSelectedCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(SELECTED_CATEGORIES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("선택된 카테고리 불러오기 실패:", e);
      return new Set();
    }
  });


//video_ID저장(새로고침하면 video_ID가 사라져서 영상 안보일 수 있음..)
  useEffect(() => {
  localStorage.setItem(VIDEO_ID_KEY, videoId);
  }, [videoId]);

  // fileName이 바뀔 때 저장
  useEffect(() => {
    localStorage.setItem(FILE_NAME_KEY, fileName);
  }, [fileName]);
  
  // selectedCategories가 바뀔 때 저장
  useEffect(() => {
    localStorage.setItem(
      SELECTED_CATEGORIES_KEY,
      JSON.stringify(Array.from(selectedCategories))
    );
  }, [selectedCategories]);

  return (
    <AppContext.Provider
      value={{
        file,
        setFile,
        fileName,
        setFileName,
        selectedCategories,
        setSelectedCategories,
        videoId,
        setVideoId
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
