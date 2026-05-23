import { useState, useEffect } from "react";

const STORAGE_KEY = "erp_sidebar_collapsed";

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  const toggle = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem(STORAGE_KEY, String(newState));
      return newState;
    });
  };

  return { isCollapsed, toggle };
}
