export default function TimestampListView({
  blocks,
  onSeek,
  videoTitle,
  category,
}) {
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">🎬 결과 확인</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-32 h-20 bg-gray-300 rounded overflow-hidden">
          {/* <video ref={videoRef} controls className="video-player">
            <source
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video> */}
        </div>
        <div>
          <div className="text-sm text-gray-500">영상</div>
          <div className="font-semibold">{videoTitle}</div>
          <div className="text-sm text-gray-500 mt-1">카테고리</div>
          <div className="inline-block px-2 py-1 bg-gray-200 rounded text-sm">
            {category}
          </div>
        </div>
      </div>

      <div className="relative border-l-2 border-gray-300 ml-6">
        {blocks.map((block) => (
          <div key={block.id} className="mb-6 ml-4">
            <div className="absolute -left-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
            <div
              className="ml-4 p-3 bg-gray-50 rounded-xl shadow-sm hover:bg-blue-50 transition cursor-pointer"
              onClick={() => onSeek(block.start)}
            >
              <div className="text-sm text-blue-600 font-medium mb-1">
                ⏱ {formatTime(block.start)} ~ {formatTime(block.end)}
              </div>
              <div className="text-sm text-gray-800">{block.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
