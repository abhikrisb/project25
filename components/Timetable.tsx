import React, { useEffect, useState } from 'react';

interface User {
  class: string;
}

interface Period {
  period: number;
  subject: string;
  time: string;
  room: string;
}

interface WeeklyTimetable {
  [key: string]: Period[];
}

interface TimetableProps {
  user: User | null;
  currentTime: Date;
  currentPeriod: Period | null;
  nextPeriod: Period | null;
  setCurrentPeriod: (period: Period | null) => void;
  setNextPeriod: (period: Period | null) => void;
}


const Timetable = ({ user, currentTime, currentPeriod, nextPeriod, setCurrentPeriod, setNextPeriod }:TimetableProps) => {
  const [timetable, setTimetable] = useState<Period[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  useEffect(() => {
    if (user?.class) {
      fetchTimetable(user.class);
    }
  }, [user?.class]);

  const fetchTimetable = async (className:string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/timetable?class=${className}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const today = new Date().toLocaleString('en-us', { weekday: 'long' });
      const todaySchedule = data[today] || [];

      setTimetable(todaySchedule);
      setWeeklyTimetable(data);
      calculateCurrentAndNextPeriod(todaySchedule);

    } catch (err) {
      console.error(err);
    }
  };

  const calculateCurrentAndNextPeriod = (timetable:Period[]) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let current: Period | null = null;
    let next: Period | null = null;

    for (let i = 0; i < timetable.length; i++) {
      const period = timetable[i];
      const [startTime, endTime] = period.time.split('-').map(parseTime);

      if (currentTime >= startTime && currentTime < endTime) {
        current = period;
        next = timetable[i + 1] || null;
        break;
      } else if (currentTime < startTime) {
        next = period;
        break;
      }
    }

    setCurrentPeriod(current);
    setNextPeriod(next);
  };

  const getPeriodsArray = (): number[] => {
    const maxPeriods = 10;
    return Array.from({ length: maxPeriods }, (_, i) => i + 1);
  };

  const getPeriodTimes = (): { [key: number]: string } => {
    const times: { [key: number]: string } = {};
    days.forEach(day => {
      if (weeklyTimetable[day]) {
        weeklyTimetable[day].forEach(period => {
          times[period.period] = period.time;
        });
      }
    });
    return times;
  };

  const parseTime = (time: string): number => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time format:', time);
        return 0;
      }
      return (hours * 60) + minutes;
    } catch (err) {
      console.error('Error parsing time:', err);
      return 0;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors">
      <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Today's Timetable</h1>
        <div className="text-gray-600 dark:text-gray-300">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Current Period</h2>
          {currentPeriod ? (
            <div>
              <div className="text-blue-700 dark:text-blue-200 font-medium">
                Period {currentPeriod.period}: {currentPeriod.subject}
              </div>
              <div className="text-blue-600 dark:text-blue-300 text-sm mt-1">
                {currentPeriod.time} | Room {currentPeriod.room}
              </div>
            </div>
          ) : (
            <div className="text-blue-700 dark:text-blue-300">No ongoing period</div>
          )}
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Next Period</h2>
          {nextPeriod ? (
            <div>
              <div className="text-green-700 dark:text-green-200 font-medium">
                Period {nextPeriod.period}: {nextPeriod.subject}
              </div>
              <div className="text-green-600 dark:text-green-300 text-sm mt-1">
                {nextPeriod.time} | Room {nextPeriod.room}
              </div>
            </div>
          ) : (
            <div className="text-green-700 dark:text-green-300">No more periods today</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {Array.isArray(timetable) && timetable.length > 0 ? (
            timetable.map((period) => (
              <div
                key={period.period}
                className={`p-3 rounded-lg transition-colors ${
                  currentPeriod?.period === period.period
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : nextPeriod?.period === period.period
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    Period {period.period}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {period.time}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {period.subject} | Room {period.room}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              No classes scheduled for today
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Schedule</h2>
        
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[150px_repeat(10,minmax(120px,1fr))] gap-2">
            <div className="bg-gray-300 dark:bg-gray-600 p-3 font-semibold text-center rounded shadow-sm text-black dark:text-gray-100">
              Day/Period
            </div>
            {getPeriodsArray().map((period) => {
              const periodTime = getPeriodTimes()[period];
              return (
                <div key={period} className="bg-gray-300 dark:bg-gray-600 p-3 font-semibold text-center rounded shadow-sm">
                  <div className="text-black dark:text-gray-100">Period {period}</div>
                  {periodTime && <div className="text-xs mt-1 text-black dark:text-gray-300">{periodTime}</div>}
                </div>
              );
            })}

            {days.map((day) => (
              <React.Fragment key={day}>
                <div className="bg-gray-300 dark:bg-gray-600 p-3 font-semibold rounded shadow-sm text-center flex items-center justify-center text-black dark:text-gray-100">
                  {day}
                </div>
                {getPeriodsArray().map((periodNum) => {
                  const period = weeklyTimetable[day]?.find(p => p.period === periodNum);
                  return (
                    <div 
                      key={`${day}-${periodNum}`} 
                      className="bg-white dark:bg-gray-700 p-3 text-sm text-center border border-gray-300 dark:border-gray-600 min-h-[80px] flex flex-col justify-center rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {period && period.subject ? (
                        <div className="font-medium text-black dark:text-gray-100">{period.subject}</div>
                      ) : (
                        <div className="text-black dark:text-gray-400 font-medium">NIL</div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;