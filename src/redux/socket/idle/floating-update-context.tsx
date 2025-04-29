import { createContext, useContext, useState } from "react";
import { FloatingUpdateDisplay } from "../../../components/floating-update-display/floating-update-display";

interface FloatingUpdate {
  id: string;
  icon: string;
  text: string;
  amount: number;
}

interface FloatingUpdateContextType {
  addFloatingUpdate: (Update: Omit<FloatingUpdate, "id">) => void;
}

const FloatingUpdateContext = createContext<FloatingUpdateContextType>({
  addFloatingUpdate: () => {},
});

export const useFloatingUpdate = () => useContext(FloatingUpdateContext);

export const FloatingUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updates, setUpdates] = useState<FloatingUpdate[]>([]);

  const addFloatingUpdate = (Update: Omit<FloatingUpdate, "id">) => {
    const id = Date.now().toString() + Math.random().toString(); // unique
    setUpdates((prev) => [...prev, { id, ...Update }]);
    setTimeout(() => {
      setUpdates((prev) => prev.filter((r) => r.id !== id));
    }, 2500); // 2s later remove
  };

  return (
    <FloatingUpdateContext.Provider value={{ addFloatingUpdate }}>
      {children}
      <FloatingUpdateDisplay updates={updates} />
    </FloatingUpdateContext.Provider>
  );
};