import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CalendarChevronIcon from './icons/CalendarChevronIcon';
import CalendarMonthChevronIcon from './icons/CalendarMonthChevronIcon';

// Define a constant for the accent color
const ACCENT_COLOR = '#6FDCFA';

// Utility functions for date handling
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Week days component for the calendar
const WeekDays = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={styles.weekDaysContainer}>
      {days.map((day, index) => (
        <View key={index} style={styles.weekDay}>
          <Text style={styles.weekDayText}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

// Calendar component
export const Calendar = ({ 
  selectedStartDate,
  selectedEndDate,
  onDateSelect 
}: { 
  selectedStartDate: Date | null,
  selectedEndDate: Date | null,
  onDateSelect: (date: Date) => void 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const today = new Date();
  const yearScrollViewRef = useRef<ScrollView>(null);
  
  // Generate calendar data based on current month/year
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Create array with empty spots for days from previous month
    const days = Array(firstDayOfMonth).fill(null);
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Organize into weeks (rows)
    const weeks = [];
    let week = [];
    
    days.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        // If week has less than 7 days, fill with null
        while (week.length < 7) {
          week.push(null);
        }
        weeks.push([...week]);
        week = [];
      }
    });
    
    return weeks;
  }, [currentMonth, currentYear]);
  
  // Handle month/year navigation
  const goToPreviousMonth = () => {
    if (showYearPicker) {
      setCurrentYear(currentYear - 1);
      return;
    }
    
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (showYearPicker) {
      setCurrentYear(currentYear + 1);
      return;
    }
    
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Check if a day is the selected start date
  const isSelectedStartDate = (day: number | null) => {
    if (!day || !selectedStartDate) return false;
    
    return (
      selectedStartDate.getDate() === day &&
      selectedStartDate.getMonth() === currentMonth &&
      selectedStartDate.getFullYear() === currentYear
    );
  };
  
  // Check if a day is the selected end date
  const isSelectedEndDate = (day: number | null) => {
    if (!day || !selectedEndDate) return false;
    
    return (
      selectedEndDate.getDate() === day &&
      selectedEndDate.getMonth() === currentMonth &&
      selectedEndDate.getFullYear() === currentYear
    );
  };
  
  // Check if a day is in the selected range
  const isInSelectedRange = (day: number | null) => {
    // If any required value is missing, we cannot determine range
    if (!day || !selectedStartDate || !selectedEndDate) return false;
    
    // Create date objects without time components
    const currentDate = new Date(currentYear, currentMonth, day);
    const startDate = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate()
    );
    const endDate = new Date(
      selectedEndDate.getFullYear(),
      selectedEndDate.getMonth(),
      selectedEndDate.getDate()
    );
    
    // Make sure we're working with clean date-only values
    currentDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Get min and max dates regardless of selection order
    const minDate = startDate < endDate ? startDate : endDate;
    const maxDate = startDate < endDate ? endDate : startDate;
    
    // Check if current date is between min and max but not equal to either
    const isStartDateOrEndDate = 
      (currentDate.getTime() === startDate.getTime()) || 
      (currentDate.getTime() === endDate.getTime());
    
    const isBetweenDates = 
      currentDate.getTime() > minDate.getTime() && 
      currentDate.getTime() < maxDate.getTime();
    
    // Return true only for dates strictly between start and end
    return isBetweenDates && !isStartDateOrEndDate;
  };
  
  // Check if a day is today
  const isToday = (day: number | null) => {
    if (!day) return false;
    
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };
  
  // Check if a day is in the past
  const isInPast = (day: number | null) => {
    if (!day) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
    return date < today;
  };
  
  // Handle date selection
  const handleDateSelect = (day: number | null) => {
    if (day === null) return;
    
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };
  
  // Toggle year picker view
  const toggleYearPicker = () => {
    setShowYearPicker(prev => {
      const willShow = !prev;
      
      // Schedule scroll to current year position when year picker opens
      if (willShow) {
        setTimeout(() => {
          const currentYearIndex = yearsToShow.indexOf(currentYear);
          const rowIndex = Math.floor(currentYearIndex / 4);
          
          // Calculate position to scroll to (each row is about 60px tall)
          const scrollPosition = Math.max(0, rowIndex * 60 - 60);
          
          yearScrollViewRef.current?.scrollTo({
            y: scrollPosition,
            animated: false
          });
        }, 50);
      }
      
      return willShow;
    });
  };
  
  // Select a year and go back to month view
  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };
  
  // Generate array of years to display in the year picker
  const yearsToShow = useMemo(() => {
    // Show current year and 15 years in future
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year <= currentYear + 15; year++) {
      years.push(year);
    }
    return years;
  }, []);

  // Get month name
  const getMonthName = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[currentMonth];
  };

  useEffect(() => {
    if (selectedStartDate || selectedEndDate) {
      console.log(`SelectedStartDate: ${selectedStartDate ? selectedStartDate.toISOString() : 'null'}`);
      console.log(`SelectedEndDate: ${selectedEndDate ? selectedEndDate.toISOString() : 'null'}`);
    }
  }, [selectedStartDate, selectedEndDate]);

  // Function to determine the number of days between two dates
  const getDaysBetweenDates = useCallback((startDate: Date, endDate: Date) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.abs(Math.round((endDate.getTime() - startDate.getTime()) / msPerDay));
  }, []);

  // Inside the Calendar component, add a new function to determine range position
  const getRangePositionStyle = useCallback((day: number | null, dayIndex: number, weekIndex: number) => {
    if (!selectedStartDate || !selectedEndDate || !day) return null;
    
    // Create date objects for comparison
    const currentDate = new Date(currentYear, currentMonth, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate()
    );
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(
      selectedEndDate.getFullYear(),
      selectedEndDate.getMonth(),
      selectedEndDate.getDate()
    );
    endDate.setHours(0, 0, 0, 0);
    
    // Get the smaller and larger date for range comparison
    const minDate = startDate < endDate ? startDate : endDate;
    const maxDate = startDate < endDate ? endDate : startDate;
    
    if (currentDate.getTime() === minDate.getTime()) {
      return { isStart: true, isEnd: false, isInRange: false };
    } else if (currentDate.getTime() === maxDate.getTime()) {
      return { isStart: false, isEnd: true, isInRange: false };
    } else if (currentDate > minDate && currentDate < maxDate) {
      return { isStart: false, isEnd: false, isInRange: true };
    }
    
    return null;
  }, [selectedStartDate, selectedEndDate, currentYear, currentMonth]);

  // Function to determine colors for date selection
  const getGradientProps = useCallback((rangeInfo: { isStart: boolean, isEnd: boolean, isInRange: boolean } | null) => {
    if (!rangeInfo) return null;
    
    const solidFillColor = 'rgba(70, 78, 97, 0.7)';
    
    if (rangeInfo.isStart) {
      return {
        colors: [solidFillColor, solidFillColor] as [string, string],
        start: {x: 0, y: 0},
        end: {x: 1, y: 0},
        style: { left: 22, right: 0, height: 44 }
      };
    } else if (rangeInfo.isEnd) {
      return {
        colors: [solidFillColor, solidFillColor] as [string, string],
        start: {x: 0, y: 0},
        end: {x: 1, y: 0},
        style: { left: 0, right: 22, height: 44 }
      };
    } else if (rangeInfo.isInRange) {
      return {
        colors: [solidFillColor, solidFillColor] as [string, string],
        start: {x: 0, y: 0},
        end: {x: 1, y: 0},
        style: { height: 44 }
      };
    }
    
    return null;
  }, []);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.monthYearHeader}>
        <TouchableOpacity style={styles.monthYearText} onPress={toggleYearPicker}>
          {showYearPicker ? (
            <>
              <Text style={styles.monthText}>{getMonthName()}</Text>
              <CalendarMonthChevronIcon width={16} height={16} />
            </>
          ) : (
            <>
              <Text style={styles.monthText}>{getMonthName()} {currentYear}</Text>
              <CalendarMonthChevronIcon width={16} height={16} />
            </>
          )}
        </TouchableOpacity>
        <View style={styles.monthNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <CalendarChevronIcon direction="left" width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <CalendarChevronIcon direction="right" width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
      
      {showYearPicker ? (
        <View style={styles.yearPickerContainer}>
          <ScrollView 
            ref={yearScrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.yearPickerScrollContent}
          >
            {/* Group the years into rows of 4 */}
            {Array(Math.ceil(yearsToShow.length / 4)).fill(0).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.yearPickerRow}>
                {yearsToShow.slice(rowIndex * 4, rowIndex * 4 + 4).map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearPickerItem,
                      year === currentYear && styles.yearPickerItemSelected
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text
                      style={[
                        styles.yearPickerItemText,
                        year === currentYear && styles.yearPickerItemTextSelected
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <>
          <WeekDays />
          
          <View style={styles.datesContainer}>
            {calendarDays.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  // Create date object for the current day
                  const currentDate = day !== null ? new Date(currentYear, currentMonth, day) : null;
                  
                  // Create a clean today date with time set to 00:00:00 for accurate date comparison
                  const todayDate = new Date(today);
                  todayDate.setHours(0, 0, 0, 0);
                  
                  // Check if date is in the past (strictly before today)
                  const isPast = currentDate !== null && currentDate < todayDate;
                  
                  // Determine if this day is selected or in range
                  let isStart = false;
                  let isEnd = false;
                  
                  if (day !== null) {
                    if (selectedStartDate) {
                      const startDate = new Date(
                        selectedStartDate.getFullYear(),
                        selectedStartDate.getMonth(),
                        selectedStartDate.getDate()
                      );
                      startDate.setHours(0, 0, 0, 0);
                      isStart = currentDate.getTime() === startDate.getTime();
                    }
                    
                    if (selectedEndDate) {
                      const endDate = new Date(
                        selectedEndDate.getFullYear(),
                        selectedEndDate.getMonth(),
                        selectedEndDate.getDate()
                      );
                      endDate.setHours(0, 0, 0, 0);
                      isEnd = currentDate.getTime() === endDate.getTime();
                    }
                  }
                  
                  // Get range position information
                  const rangeInfo = day !== null ? getRangePositionStyle(day, dayIndex, weekIndex) : null;
                  const gradientProps = getGradientProps(rangeInfo);
                  
                  return (
                    <TouchableOpacity 
                      key={dayIndex} 
                      style={[
                        styles.dateCell,
                        isPast && styles.pastDateCell,
                      ]}
                      disabled={!day || isPast}
                      onPress={() => handleDateSelect(day)}
                    >
                      {/* Render the fill highlight if this day is in the range */}
                      {gradientProps && (
                        <LinearGradient
                          colors={gradientProps.colors}
                          start={gradientProps.start}
                          end={gradientProps.end}
                          style={[styles.dayRangeHighlight, gradientProps.style]}
                        />
                      )}
                      
                      {/* Render the date with its circle if it's selected */}
                      {day && (
                        <View style={[
                          styles.dateCellContent,
                          isStart && styles.selectedStartDateCell,
                          isEnd && styles.selectedEndDateCell,
                        ]}>
                          <Text style={[
                            styles.dateText,
                            (isStart || isEnd) && styles.selectedDateText,
                            isPast && styles.pastDateText
                          ]}>
                            {day}
                          </Text>
                          {isToday(day) && <View style={styles.todayDot} />}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// Get screen dimensions
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#404759',
    borderRadius: 12,
    padding: 20,
    width: 358,
    maxWidth: width - 32,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative', // For positioning range highlight
  },
  monthYearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 0,
    paddingRight: 0,
  },
  monthYearText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 10,
  },
  monthText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 5,
  },
  yearText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 2,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingRight: 10,
  },
  navButton: {
    padding: 4,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    paddingLeft: 10,
    paddingRight: 10,
  },
  weekDay: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#B6BDCD',
    textTransform: 'uppercase',
  },
  datesContainer: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
    position: 'relative', // For positioning range highlight
  },
  weekRangeHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(111, 220, 250, 0.2)',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  dateCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Ensure relative positioning for absolute child elements
  },
  dayRangeHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  dateCellContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure content is above the range highlight
  },
  selectedStartDateCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6FDCFA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure it's above the range highlight
  },
  selectedEndDateCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6FDCFA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure it's above the range highlight
  },
  selectedDateText: {
    color: '#1E2021',
    fontWeight: '600',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_COLOR,
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
  },
  pastDateCell: {
    opacity: 0.5,
  },
  pastDateText: {
    color: '#717C98',
  },
  dateText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  yearPickerContainer: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    height: 284,
    overflow: 'hidden',
  },
  yearPickerScrollContent: {
    paddingVertical: 12,
  },
  yearPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    width: '100%',
    paddingHorizontal: 4,
  },
  yearPickerItem: {
    minWidth: 62,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  yearPickerItemSelected: {
    backgroundColor: '#6FDCFA',
  },
  yearPickerItemText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  yearPickerItemTextSelected: {
    color: '#131515',
  },
});

export default Calendar; 