const ChartTab = ({ selected, setSelected }) => {
  const getButtonClass = (option) =>
    selected === option
      ? "shadow-theme-xs text-text bg-background"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-background">
      <button
        onClick={() => setSelected("overview")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "overview"
        )}`}
      >
        Overview
      </button>

      <button
        onClick={() => setSelected("sales")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "sales"
        )}`}
      >
        Sales
      </button>

      <button
        onClick={() => setSelected("revenue")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "revenue"
        )}`}
      >
        Revenue
      </button>
    </div>
  );
};

export default ChartTab;