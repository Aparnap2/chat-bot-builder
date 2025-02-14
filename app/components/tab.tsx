// Tab.tsx
import { useState } from "react";

interface TabProps {
  id: string;
  label: string;
  icon: JSX.Element;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tab = ({ id, label, icon, activeTab, setActiveTab }: TabProps) => {
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
        isActive ? "bg-gray-900 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Tab;