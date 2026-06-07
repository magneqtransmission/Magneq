import { IoIosArrowRoundUp , IoIosArrowRoundDown} from "react-icons/io";

const StoresCard = ({ title, icon: Icon, percent, borderColor }) => {
  const isPositive = typeof percent === 'string' && percent.trim().toLowerCase().includes('in stock');
  const TrendIcon = isPositive ? IoIosArrowRoundUp : IoIosArrowRoundDown;
  const badgeBg = isPositive ? '#dcfce7' : '#fee2e2';
  const badgeText = isPositive ? '#15803d' : '#b91c1c';
  return (
    <div
      className="rounded-2xl p-6 min-h-[180px] shadow-sm transition-colors border"
      style={{
        background: "rgba(var(--card))",
        borderColor: borderColor || 'rgba(var(--border))',
      }}
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-xl"
       
      >
        <Icon className="w-11 h-11 p-3 rounded-md bg-gray-100 dark:bg-gray-700"  />
      </div>
      <div className="flex items-end justify-between mt-10">
        <span className="font-bold text-xl" style={{ color: "rgba(var(--text))" }}>{title}</span>
        <span
          className="inline-flex items-center gap-1 text-sm font-medium rounded px-3 py-1"
          style={{ background: badgeBg, color: badgeText }}
        >
          <TrendIcon />
          {percent}
        </span>
      </div>
    </div>
  );
};
export default StoresCard;