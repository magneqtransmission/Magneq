import React, { useState, useRef, useEffect } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  minDate, 
  maxDate, 
  disabled = false,
  className = "",
  isDateDisabled: customIsDateDisabled = null, // Custom function to check if date is disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [hoveredDate, setHoveredDate] = useState(null);
  
  const datePickerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setSelectedDate(date);
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Use custom disabled function if provided
    if (customIsDateDisabled) {
      return customIsDateDisabled(date);
    }
    
    // Default validation
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date) => {
    if (!date || isDateDisabled(date)) return;
    
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleYearChange = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setFullYear(prev.getFullYear() - 1);
      } else {
        newMonth.setFullYear(prev.getFullYear() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
    onChange(today.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative" ref={datePickerRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {selectedDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearDate();
              }}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <FiX size={16} />
            </button>
          )}
          <FiCalendar className="text-gray-400 dark:text-gray-500" size={16} />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-5 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleYearChange('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                aria-label="Previous year"
              >
                <FiChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white min-w-[100px] text-center">
                {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => handleYearChange('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                aria-label="Next year"
              >
                <FiChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMonthChange('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                aria-label="Previous month"
              >
                <FiChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white min-w-[140px] text-center">
                {monthNames[currentMonth.getMonth()]}
              </span>
              <button
                type="button"
                onClick={() => handleMonthChange('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                aria-label="Next month"
              >
                <FiChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-2 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const today = isDateToday(day) && !selected && !disabled;
              const hovered = hoveredDate === day && !selected && !disabled && !today;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={disabled}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    h-10 w-10 text-sm font-semibold rounded-lg transition-all duration-200
                    flex items-center justify-center relative
                    ${!day ? 'invisible' : ''}
                    ${disabled 
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/20 opacity-50' 
                      : 'text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer active:scale-90 shadow-sm hover:shadow-md'
                    }
                    ${selected 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg ring-2 ring-blue-400 dark:ring-blue-600 scale-105 font-bold' 
                      : ''
                    }
                    ${today
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-300 dark:ring-blue-700'
                      : ''
                    }
                    ${hovered
                      ? 'bg-gray-100 dark:bg-gray-700 scale-105'
                      : ''
                    }
                  `}
                >
                  {day ? day.getDate() : ''}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={goToToday}
              disabled={isDateDisabled(new Date())}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Today
            </button>
            <button
              type="button"
              onClick={clearDate}
              className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
