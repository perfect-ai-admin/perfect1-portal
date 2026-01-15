import React from 'react';
import { Tooltip } from 'recharts';

export default function HeatmapCalendar({ 
  data = [],
  startDate = null,
  endDate = null,
  colorScale = ['#E5E7EB', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'],
  cellSize = 12,
  cellGap = 3,
  showMonthLabels = true,
  showWeekdayLabels = true,
  valueFormatter = (value) => value
}) {
  // Generate calendar data for the last 12 weeks if no data provided
  const generateDefaultData = () => {
    const today = new Date();
    const data = [];
    for (let i = 84; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 10)
      });
    }
    return data;
  };

  const calendarData = data.length > 0 ? data : generateDefaultData();

  // Group data by week
  const getWeekData = () => {
    const weeks = [];
    const dataMap = new Map(calendarData.map(d => [d.date, d.value]));
    
    const start = startDate ? new Date(startDate) : new Date(calendarData[0].date);
    const end = endDate ? new Date(endDate) : new Date(calendarData[calendarData.length - 1].date);
    
    // Start from Sunday
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    while (currentDate <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const value = dataMap.get(dateStr) || 0;
        week.push({ date: dateStr, value });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const getColor = (value) => {
    if (!value || value === 0) return colorScale[0];
    const maxValue = Math.max(...calendarData.map(d => d.value));
    const ratio = value / maxValue;
    const index = Math.min(Math.floor(ratio * (colorScale.length - 1)) + 1, colorScale.length - 1);
    return colorScale[index];
  };

  const weekdayLabels = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const weeks = getWeekData();

  // Get month labels
  const getMonthLabel = (weekIndex) => {
    const firstDay = weeks[weekIndex][0].date;
    const date = new Date(firstDay);
    const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    
    // Show month label only if it's the first week of the month
    if (weekIndex === 0 || date.getDate() <= 7) {
      return monthNames[date.getMonth()];
    }
    return null;
  };

  return (
    <div className="inline-block" dir="rtl">
      {showMonthLabels && (
        <div className="flex mb-2" style={{ marginRight: showWeekdayLabels ? `${cellSize + cellGap + 20}px` : '0' }}>
          {weeks.map((week, weekIndex) => {
            const label = getMonthLabel(weekIndex);
            return (
              <div 
                key={weekIndex}
                className="text-xs text-gray-600"
                style={{ 
                  width: `${cellSize}px`,
                  marginLeft: weekIndex > 0 ? `${cellGap}px` : '0'
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex">
        {showWeekdayLabels && (
          <div className="flex flex-col ml-2">
            {weekdayLabels.map((label, i) => (
              <div 
                key={i}
                className="text-xs text-gray-600 flex items-center justify-center"
                style={{ 
                  height: `${cellSize}px`,
                  marginTop: i > 0 ? `${cellGap}px` : '0'
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
        <div className="flex">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col" style={{ marginLeft: weekIndex > 0 ? `${cellGap}px` : '0' }}>
              {week.map((day, dayIndex) => (
                <div
                  key={day.date}
                  className="rounded-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 cursor-pointer"
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getColor(day.value),
                    marginTop: dayIndex > 0 ? `${cellGap}px` : '0'
                  }}
                  title={`${day.date}: ${valueFormatter(day.value)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
        <span>פחות</span>
        <div className="flex gap-1">
          {colorScale.map((color, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: color
              }}
            />
          ))}
        </div>
        <span>יותר</span>
      </div>
    </div>
  );
}