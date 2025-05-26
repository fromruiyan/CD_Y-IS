import React, { useState } from "react";
import "../style/RatingPopupStyle.css";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export default function RatingPopup({ onClose }) {
  const [rating, setRating] = useState(0);


  const submitRating = async () => {
    if (rating === 0) return alert("별점을 선택해주세요!");

    try {
      await axios.post(`${apiUrl}/rate`, { rating }); //추후 주소 편집 필요
      alert("감사합니다! 평가가 등록되었습니다.");
      onClose();
    } catch (error) {
      console.error("❌ 별점 전송 실패:", error);
      alert("별점 등록 중 오류가 발생했습니다.");
    }
  };


  return (
    <div className="popup-backdrop">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ×
        </button>

        <div className="popup-section">
          <p className="popup-title">✏️ 서비스를 평가해주세요!</p>
          <div className="popup-stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={i <= rating ? "star filled" : "star"}
                onClick={() => setRating(i)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="popup-section">
          <p className="popup-title">📬 건의사항은 아래 메일로 보내주세요!</p>
          <div className="popup-emails">
            <p>📧 abc@gmail.com</p>
            <p>📧 abc@gmail.com</p>
          </div>
        </div>

        <button className="popup-submit" onClick={submitRating}>
          완료
        </button>
      </div>
    </div>
  );
}
