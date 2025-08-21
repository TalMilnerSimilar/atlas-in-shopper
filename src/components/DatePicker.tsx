import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  showPoP?: boolean;
  showGranularity?: boolean;
  timeFrame?: 'Month' | 'Day' | 'Week';
  type?: 'Default' | 'freemium';
  onDateChange?: (startDate: Date, endDate: Date) => void;
  onApply?: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  showPoP = false, 
  showGranularity = true, 
  timeFrame = "Month", 
  type = "Default",
  onDateChange,
  onApply
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrame);
  const [selectedQuickOption, setSelectedQuickOption] = useState('Last 3 Months');
  const [currentYear, setCurrentYear] = useState(2022);
  const [currentMonth, setCurrentMonth] = useState(10); // October

  const quickOptions = [
    'Last 28 Days',
    'Last 1 Month', 
    'Last 3 Months',
    'Last 6 Months',
    'Last 12 Months',
    'Last 24 Months',
    'Last 36 Months'
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleQuickOptionSelect = (option: string) => {
    setSelectedQuickOption(option);
    // Here you would calculate the actual date range based on the option
    if (onDateChange) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (option) {
        case 'Last 28 Days':
          startDate.setDate(endDate.getDate() - 28);
          break;
        case 'Last 1 Month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'Last 3 Months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'Last 6 Months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'Last 12 Months':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        case 'Last 24 Months':
          startDate.setMonth(endDate.getMonth() - 24);
          break;
        case 'Last 36 Months':
          startDate.setMonth(endDate.getMonth() - 36);
          break;
      }
      
      onDateChange(startDate, endDate);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderMonthlyView = () => {
    const selectedMonths = [1, 2, 3, 4, 5, 6]; // Feb to Jul selected
    const nextYearMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // All months for next year
    
    return (
      <div className="flex flex-col gap-2">
        {/* First year months */}
        <div className="grid grid-cols-4 gap-0">
          {months.map((month, index) => (
            <div key={index} className="h-[54px] w-20 relative">
              {selectedMonths.includes(index) ? (
                <div className={`absolute bottom-0 left-[16.25%] right-[16.25%] rounded-[30px] top-0 ${
                  index === 1 || index === 5 ? 'bg-[#3E74FE]' : 'bg-[#E3EBFF]'
                }`}>
                  <div className={`absolute font-['Roboto:Regular'] font-normal leading-[0] left-1/2 text-center text-nowrap translate-x-[-50%] text-[14px] ${
                    index === 1 || index === 5 ? 'text-white' : 'text-[#092540]'
                  }`} style={{ top: "calc(50% - 10px)" }}>
                    {month}
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-0 left-[16.25%] right-[16.25%] rounded-[30px] top-0">
                  <div className="absolute font-['Roboto:Regular'] font-normal leading-[0] left-1/2 text-center text-nowrap translate-x-[-50%] text-[14px] text-[#092540]" style={{ top: "calc(50% - 10px)" }}>
                    {month}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Second year months */}
        <div className="grid grid-cols-4 gap-0">
          {months.map((month, index) => (
            <div key={index} className="h-[54px] w-20 relative">
              {nextYearMonths.includes(index) ? (
                <div className="absolute bottom-0 left-[16.25%] right-[16.25%] rounded-[30px] top-0">
                  <div className="absolute font-['Roboto:Regular'] font-normal leading-[0] left-1/2 text-center text-nowrap translate-x-[-50%] text-[14px] text-[#092540]" style={{ top: "calc(50% - 10px)" }}>
                    {month}
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-0 left-[16.25%] right-[16.25%] rounded-[30px] top-0">
                  <div className="absolute font-['Roboto:Regular'] font-normal leading-[0] left-1/2 text-center text-nowrap translate-x-[-50%] text-[14px] text-[#B6BEC6] line-through" style={{ top: "calc(50% - 10px)" }}>
                    {month}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const selectedDays = [5, 6, 7, 8, 9, 10, 11]; // Days 5-11 selected
    
    return (
      <div className="flex flex-col gap-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="text-[14px] text-[#092540] font-normal">
                {day}
              </div>
            </div>
          ))}
        </div>
        
        {/* Week 1 */}
        <div className="grid grid-cols-7 gap-0">
          {[29, 30, 31, 1, 2, 3, 4].map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="text-[14px] text-[#B6BEC6] line-through">
                {day}
              </div>
            </div>
          ))}
        </div>
        
        {/* Week 2 - Selected */}
        <div className="grid grid-cols-7 gap-0">
          {[5, 6, 7, 8, 9, 10, 11].map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="w-[54px] h-[54px] rounded-[30px] bg-[#3E74FE] flex items-center justify-center">
                <div className="text-[14px] text-white font-normal">
                  {day}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Week 3 */}
        <div className="grid grid-cols-7 gap-0">
          {[12, 13, 14, 15, 16, 17, 18].map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="w-[54px] h-[54px] rounded-[30px] flex items-center justify-center">
                <div className="text-[14px] text-[#092540] font-normal">
                  {day}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Week 4 */}
        <div className="grid grid-cols-7 gap-0">
          {[19, 20, 21, 22, 23, 24, 25].map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="w-[54px] h-[54px] rounded-[30px] flex items-center justify-center">
                <div className="text-[14px] text-[#092540] font-normal">
                  {day}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Week 5 */}
        <div className="grid grid-cols-7 gap-0">
          {[26, 27, 28, 29, 30, 1, 2].map((day, index) => (
            <div key={index} className="h-[30px] flex items-center justify-center">
              <div className="w-[54px] h-[54px] rounded-[30px] flex items-center justify-center">
                <div className="text-[14px] text-[#092540] font-normal">
                  {day}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative rounded w-full max-w-[893px] bg-white border border-[#E6E9EC] shadow-[0px_18px_34px_0px_rgba(14,30,62,0.12)]">
      <div className="flex">
        {/* Left sidebar - Quick options */}
        <div className="w-[200px] border-r border-[#E6E9EC]">
          {quickOptions.map((option, index) => (
            <div 
              key={option}
              className={`h-[52px] relative cursor-pointer ${
                selectedQuickOption === option ? 'bg-[#F5F9FD]' : 'bg-white'
              }`}
              onClick={() => handleQuickOptionSelect(option)}
            >
              {selectedQuickOption === option && (
                <div className="absolute bg-[#3E74FE] bottom-0 left-0 top-0 w-1"></div>
              )}
              <div className={`absolute font-['Roboto:Regular'] font-normal leading-[0] left-5 text-[12px] text-left text-nowrap ${
                selectedQuickOption === option ? 'text-[#3E74FE]' : 
                index >= 5 ? 'text-[#CBD1D7]' : 'text-[#092540]'
              }`} style={{ top: "calc(50% - 8px)" }}>
                {option}
              </div>
              {index < quickOptions.length - 1 && (
                <div className="absolute bottom-0 h-px left-0 right-0 bg-[#E6E9EC]"></div>
              )}
            </div>
          ))}
        </div>

        {/* Right side - Calendar */}
        <div className="flex-1 p-4">
          {/* Granularity toggle */}
          {showGranularity && (
            <div className="mb-4">
              <div className="flex w-[260px] h-8">
                <div className={`flex-1 flex items-center justify-center px-6 py-2.5 rounded-bl-[3px] rounded-tl-[3px] border border-[#E6E9EC] ${
                  selectedTimeFrame === 'Week' ? 'bg-[#F5F9FD]' : 'bg-white'
                }`}>
                  <div className={`font-['Roboto:Medium'] font-medium text-[14px] ${
                    selectedTimeFrame === 'Week' ? 'text-[#3E74FE]' : 'text-[#6F7EAB]'
                  }`}>
                    Week
                  </div>
                </div>
                <div className={`flex-1 flex items-center justify-center px-6 py-2.5 rounded-br-[3px] rounded-tr-[3px] border border-[#E6E9EC] ${
                  selectedTimeFrame === 'Month' ? 'bg-[#F5F9FD]' : 'bg-white'
                }`}>
                  <div className={`font-['Roboto:Medium'] font-medium text-[14px] ${
                    selectedTimeFrame === 'Month' ? 'text-[#3E74FE]' : 'text-[#6F7EAB]'
                  }`}>
                    Month
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handlePreviousMonth}
              className="w-10 h-10 rounded-full border border-[#E6E9EC] flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronLeftIcon className="w-4 h-4 text-[#092540]" />
            </button>
            
            <div className="flex gap-8">
              <div className="font-['Roboto:Bold'] font-bold text-[16px] text-[#092540] text-center">
                {selectedTimeFrame === 'Month' ? `${months[currentMonth]} ${currentYear}` : `${months[currentMonth]} ${currentYear}`}
              </div>
              <div className="font-['Roboto:Bold'] font-bold text-[16px] text-[#092540] text-center">
                {selectedTimeFrame === 'Month' ? `${months[(currentMonth + 1) % 12]} ${currentMonth === 11 ? currentYear + 1 : currentYear}` : `${months[(currentMonth + 1) % 12]} ${currentMonth === 11 ? currentYear + 1 : currentYear}`}
              </div>
            </div>
            
            <button 
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full border border-[#E6E9EC] flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronRightIcon className="w-4 h-4 text-[#092540]" />
            </button>
          </div>

          {/* Calendar content */}
          <div className="flex gap-8">
            <div className="w-80">
              {selectedTimeFrame === 'Month' ? renderMonthlyView() : renderWeeklyView()}
            </div>
            <div className="w-80">
              {selectedTimeFrame === 'Month' ? renderMonthlyView() : renderWeeklyView()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#F5F9FD] border-t border-[#E6E9EC] p-6 flex justify-end">
        <button 
          className="bg-[#3E74FE] text-white px-4 py-2 rounded-[18px] font-['DM_Sans:Bold'] font-bold text-[14px] w-[90px] hover:bg-[#2E64EE]"
          onClick={onApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
