interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tab = ({ id, label, icon, activeTab, setActiveTab }: TabProps) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
        isActive ? "bg-primary text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Tab;
