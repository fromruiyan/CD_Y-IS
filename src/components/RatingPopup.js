import React, { useState } from "react";
import "../style/RatingPopupStyle.css";

export default function RatingPopup({ onClose }) {
  const [rating, setRating] = useState(0);

  const submitRating = async () => {
    if (rating === 0) return alert("별점을 선택해주세요!");

    await fetch("http://localhost:5000/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    alert("감사합니다! 평가가 등록되었습니다.");
    onClose();
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
