// BlocksContext.js
import { createContext, useContext, useState, useEffect } from "react";

const BlocksContext = createContext();

export function BlocksProvider({ children }) {
  const [blocks, setBlocks] = useState(() => {
    try {
      const stored = localStorage.getItem("blocks");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("로컬 저장된 blocks 파싱 실패:", err);
      return [];
    }
  });

  // ✅ fetch 제거 → blocks는 상태만 담당

  useEffect(() => {
    localStorage.setItem("blocks", JSON.stringify(blocks));
  }, [blocks]);

  return (
    <BlocksContext.Provider value={{ blocks, setBlocks }}>
      {children}
    </BlocksContext.Provider>
  );
}

export function useBlocks() {
  return useContext(BlocksContext);
}
