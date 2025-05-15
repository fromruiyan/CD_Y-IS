import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useBlocks } from "../context/BlocksContext"; // Blocks 상태 가져오기
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const categories = {
  "📚 지식/정보": [
    "🏢 정부/기관/비영리",
    "💰 경제/금융/재테크",
    "📖 교육/강의",
    "📺 뉴스/정치/이슈",
    "🖥️ IT/기술/과학",
  ],
  "🎯 취미/라이프스타일": [
    "👨‍🍳 푸드/쿠킹",
    "🧳 여행/아웃도어",
    "🧑‍🎤 인물/유명인",
    "🎠 취미",
  ],
  "📺 엔터테인먼트": [
    "🎬 엔터테인먼트",
    "🎞️ 영화/애니메이션",
    "🪩 음악/댄스",
    "🕹️ 게임",
  ],
  "🌟 건강/스포츠/동물": ["🏃‍♂️ 스포츠/건강", "🐾 동물/펫"],
  "🚗 교통": ["🚜 차", "🚢 배", "🏍️ 바이크"],
  "🛍️ 패션/뷰티": ["💄 뷰티", "👗 패션"],
};

export default function Category() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setVideoId } = useApp();
  const { file, fileName, selectedCategories, setSelectedCategories } =
    useApp(); // ✅ AppContext에서 가져옴
  const { setBlocks } = useBlocks(); // ✅ BlocksContext에서 가져옴

  const [openCategory, setOpenCategory] = useState(null);
  const dropdownRef = useRef(null);

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const toggleSubcategory = (sub) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(sub)) newSet.delete(sub);
    else newSet.add(sub);
    setSelectedCategories(newSet);
  };

  const handleNext = async () => {
    if (!file || !fileName || selectedCategories.size === 0) {
      alert("파일과 카테고리를 모두 선택해 주세요!");
      console.log(file, fileName, selectedCategories);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append(
      "categories",
      JSON.stringify(Array.from(selectedCategories))
    );

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData);

      console.log("✅ 업로드 성공:", response.data);

      const video_id = response.data.video_id;
      setVideoId(video_id);

      console.log("✅ 업로드 성공:", video_id);

      // 성공 시 다음 페이지로 이동
      navigate("/result");
    } catch (error) {
      console.error("❌ 업로드 실패:", error);
      alert("서버 전송 중 문제가 발생했습니다.");
    }
  };

  // 🔹 외부 클릭 감지 로직
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container">
      <h1>Y-IS</h1>
      <p>영상을 가장 잘 어울리는 주제를 선택해 주세요.</p>
      <div className="dropdown-grid" ref={dropdownRef}>
        {Object.keys(categories).map((category) => (
          <div key={category} className="dropdown">
            <button
              className="dropdown-button"
              onClick={() => toggleCategory(category)}
            >
              {category}{" "}
              <span className="arrow">
                {openCategory === category ? "▲" : "▼"}
              </span>
            </button>
            {openCategory === category && (
              <div className="dropdown-content">
                {categories[category].map((sub) => (
                  <label key={sub} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(sub)}
                      onChange={() => toggleSubcategory(sub)}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="select-info">✅ 1개 이상 선택해 주세요</p>
      <div className="button-group">
        <button onClick={() => navigate("/upload")}>이전으로</button>
        <button
          onClick={() => {
            if (selectedCategories.size > 0) {
              handleNext();
            } else {
              alert("⚠️ 1개 이상 주제를 선택해 주세요!");
            }
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
