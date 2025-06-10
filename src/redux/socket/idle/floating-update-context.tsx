import { createContext, useContext, useState } from "react";

interface FloatingUpdate {
  id: string;
  icon: string;
  text: string;
  amount: number;
}

interface FloatingUpdateContextType {
  addFloatingUpdate: (Update: Omit<FloatingUpdate, "id">) => void;
  updates: FloatingUpdate[];
}

const FloatingUpdateContext = createContext<FloatingUpdateContextType>({
  addFloatingUpdate: () => {},
  updates: [],
});

export const useFloatingUpdate = () => useContext(FloatingUpdateContext);

export const FloatingUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updates, setUpdates] = useState<FloatingUpdate[]>([]);

  const addFloatingUpdate = (Update: Omit<FloatingUpdate, "id">) => {
    const id = Date.now().toString() + Math.random().toString(); // unique
    setUpdates((prev) => [...prev, { id, ...Update }]);
    setTimeout(() => {
      setUpdates((prev) => prev.filter((r) => r.id !== id));
    }, 2000); // 2s later remove
  };

  return (
    <FloatingUpdateContext.Provider value={{ addFloatingUpdate, updates }}>
      {children}
    </FloatingUpdateContext.Provider>
  );
};