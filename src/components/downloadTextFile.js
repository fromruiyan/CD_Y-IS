export default function downloadTextFile(blocks, callback) {
  const content = blocks
    .map((b) => `${formatTime(b.timestamp)}\n${b.chapter_title}`)
    .join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "video_timestamps.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

    // 다운 버튼 이후 약간의 지연 이후 다운로드 완료 페이지를 띄움(callback)
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    if (callback) callback();
  }, 200); //200ms딜레이이
}

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
