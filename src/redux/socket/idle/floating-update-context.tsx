import { createContext, useContext, useState, useRef } from "react";

interface FloatingUpdate {
  id: string;
  icon: string;
  text: string;
  amount: number;
}

interface FloatingUpdateContextType {
  addFloatingUpdate: (update: Omit<FloatingUpdate, "id">) => void;
  addMultipleFloatingUpdates: (updates: Omit<FloatingUpdate, "id">[]) => void; // Fixed name
  updates: FloatingUpdate[];
}

const FloatingUpdateContext = createContext<FloatingUpdateContextType>({
  addFloatingUpdate: () => {},
  addMultipleFloatingUpdates: () => {}, // Fixed name
  updates: [],
});

export const useFloatingUpdate = () => useContext(FloatingUpdateContext);

export const FloatingUpdateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [updates, setUpdates] = useState<FloatingUpdate[]>([]);
  const counterRef = useRef(0); // Add counter for truly unique IDs

  const addMultipleFloatingUpdates = (
    newUpdates: Omit<FloatingUpdate, "id">[]
  ) => {
    const updatesWithIds = newUpdates.map((update) => ({
      ...update,
      id: `floating-${Date.now()}-${++counterRef.current}`, // Simpler, more reliable ID
    }));

    setUpdates((prev) => [...prev, ...updatesWithIds]);

    // Set removal timeouts for each
    updatesWithIds.forEach((update) => {
      setTimeout(() => {
        setUpdates((prev) => prev.filter((r) => r.id !== update.id));
      }, 2000);
    });
  };

  const addFloatingUpdate = (update: Omit<FloatingUpdate, "id">) => {
    addMultipleFloatingUpdates([update]);
  };

  return (
    <FloatingUpdateContext.Provider
      value={{ addFloatingUpdate, addMultipleFloatingUpdates, updates }}
    >
      {children}
    </FloatingUpdateContext.Provider>
  );
};
