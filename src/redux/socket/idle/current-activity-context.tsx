import React, { createContext, useContext, useState } from "react";

export type CurrentActivityStatus =
  | {
      type: "farming" | "crafting";
      id: number;
      name: string;
      startTimestamp: number;
      durationS: number;
      imgsrc1?: string;
    }
  | {
      type: "breeding";
      name: string;
      sireId: number;
      dameId: number;
      startTimestamp: number;
      durationS: number;
      imgsrc1?: string;
      imgsrc2?: string;
    }
  | {
      type: "combat";
      name: string;
      imgsrc1?: string;
    };

interface CurrentActivityContextType {
  currentActivity: CurrentActivityStatus | null;
  setCurrentActivity: React.Dispatch<
    React.SetStateAction<CurrentActivityStatus | null>
  >;
}

const CurrentActivityContext = createContext<CurrentActivityContextType>({
  currentActivity: null,
  setCurrentActivity: (() => {
    throw new Error(
      "setCurrentActivity must be used inside CurrentActivityProvider"
    );
  }) as React.Dispatch<React.SetStateAction<CurrentActivityStatus | null>>,
});

export const useCurrentActivityContext = () =>
  useContext(CurrentActivityContext);

export const CurrentActivityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentActivity, setCurrentActivity] =
    useState<CurrentActivityStatus | null>(null);

  return (
    <CurrentActivityContext.Provider
      value={{ currentActivity, setCurrentActivity }}
    >
      {children}
    </CurrentActivityContext.Provider>
  );
};
