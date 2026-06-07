import { IoIosArrowRoundUp , IoIosArrowRoundDown} from "react-icons/io";
import Badge from '../common/Badge';

const Card = ({ title, icon: Icon, value, percent, onClick, className = "" }) => {
  const isPositive = typeof percent === 'string' && percent.trim().startsWith('+');
  const trendColor = isPositive ? 'success' : 'error';
  const TrendIcon = isPositive ? IoIosArrowRoundUp : IoIosArrowRoundDown;

  return (
    <div 
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 min-h-[170px] shadow-sm transition-colors ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <Icon className="w-6 h-6 text-text" />
      </div>
      <div className="flex items-end justify-between mt-6">
        <div>
          <span className="text-sm text-text">{title}</span>
          <h4 className="mt-2 text-lg font-bold text-text">
            {value ?? '—'}
          </h4>
        </div>
        <Badge color={trendColor}>
          <TrendIcon />
          {percent ?? '—'}
        </Badge>
      </div>
    </div>
  );
};

export default Card;