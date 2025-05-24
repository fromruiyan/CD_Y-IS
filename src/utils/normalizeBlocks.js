//데이터를 blocks형태로 만들어줌

/**
 * @typedef {{
 *   id: string,
 *   timestamp: number,
 *   chapter_title: string,
 *   sentences: string[]
 * }} Block
 */

/** @param {any[]} rawBlocks @returns {Block[]} */
export function normalizeBlocks(rawBlocks) {
  if (!Array.isArray(rawBlocks)) return [];

  return rawBlocks.map((item, idx) => ({
    id: String(item.id ?? idx),
    timestamp: item.start_time ?? item.timestamp ?? 0,
    chapter_title: item.chapter_title ?? `챕터 ${idx + 1}`,
    sentences: Array.isArray(item.transcription)
      ? item.transcription
      : item.sentences || []
  }));
}
