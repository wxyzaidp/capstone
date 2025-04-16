/**
 * TimeService - Consolidated date and time handling for the application
 */

// Constants from DateService
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Core Formatting Functions ---

// Format a date as MM/DD/YY (from original TimeService)
export function formatShortDate(date: Date): string {
  if (!isValidDate(date)) return 'Invalid Date';
  const month = String(date!.getMonth() + 1).padStart(2, '0');
  const day = String(date!.getDate()).padStart(2, '0');
  const year = date!.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

// Format a date as Mon DD, YYYY (from DateService, renamed)
export function formatMediumDate(date: Date | null): string {
  if (!isValidDate(date)) return 'Add Date'; // Keep original placeholder
  try {
    return `${MONTHS_SHORT[date!.getMonth()]} ${date!.getDate()}, ${date!.getFullYear()}`;
  } catch (error) {
    console.error('TimeService: Error formatting medium date:', error);
    return 'Add Date';
  }
}

// Format a date as Weekday, Mon DD, YYYY (from DateService)
export function formatLongDate(date: Date | null): string {
  if (!isValidDate(date)) {
    console.error('TimeService: Invalid date in formatLongDate:', date);
    return '';
  }
  try {
    const dayName = DAYS[date!.getDay()];
    const monthName = MONTHS_SHORT[date!.getMonth()];
    const dayNumber = date!.getDate();
    const year = date!.getFullYear();
    return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
  } catch (error) {
    console.error('TimeService: Error in formatLongDate:', error);
    return '';
  }
}

// Format time as h:mm AM/PM (from original TimeService - seems equivalent to DateService.formatLocalTime)
export function formatTime(date: Date | null): string {
  if (!isValidDate(date)) return 'Add Time';
  try {
      let hours = date!.getHours();
      const minutes = String(date!.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
      console.error('TimeService: Error formatting time:', error);
      return 'Add Time';
  }
}

// Format a date range as a string with all-day handling (from original TimeService)
export function formatDateTimeRange(startDate: Date, endDate: Date): {
  date: string;
  timeRange: string;
} {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return { date: 'Invalid Date', timeRange: 'Invalid Time' };
  }

  // Check if this is an all-day event
  const isAllDay = isAllDayEvent(startDate, endDate);
  
  // Same day check
  const isSameDay = startDate.getDate() === endDate.getDate() &&
                   startDate.getMonth() === endDate.getMonth() &&
                   startDate.getFullYear() === endDate.getFullYear();
  
  // Format differently for all-day events
  if (isAllDay) {
    if (isSameDay) {
      return {
        date: formatShortDate(startDate), // Use MM/DD/YY for consistency here
        timeRange: 'All Day'
      };
    } else {
      // Multi-day all-day event
      return {
        date: `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
        timeRange: 'All Day'
      };
    }
  }
  
  // Regular (non-all-day) events
  if (isSameDay) {
    return {
      date: formatShortDate(startDate),
      timeRange: `${formatTime(startDate)} - ${formatTime(endDate)}`
    };
  } else {
    // Multi-day event with specific times
    return {
      date: `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
      timeRange: `${formatTime(startDate)} - ${formatTime(endDate)}`
    };
  }
}

// --- Parsing Functions ---

// Parse a time string (h:mm AM/PM) into a Date object (from DateService)
// Sets the date part to today, only time is relevant.
export const parseTimeString = (timeStr: string | null): Date | null => {
  if (!timeStr) return null;
  
  try {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!match) return null;
    
    let [_, hours, minutes, ampm] = match;
    let hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    if (ampm.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
      hour = 0; // Midnight case
    }
    
    const date = new Date(); // Use today's date
    date.setHours(hour, minute, 0, 0);
    return date;
  } catch (error) {
    console.error('TimeService: Error parsing time string:', error);
    return null;
  }
};

// --- Utility Functions ---

// Checks if a date object is valid (from DateService)
export const isValidDate = (date: Date | null): boolean => {
  if (!date) return false;
  return !isNaN(date.getTime());
};

// Create a date with a specific time (hours, minutes) in the local timezone (from original TimeService)
export function createLocalDate(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Get current local date with time set to the beginning of the day (from original TimeService)
export function getCurrentDateStart(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Add hours to a date and preserve the timezone (from original TimeService)
export function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

// Determine if a date range represents an all-day event (from original TimeService)
export function isAllDayEvent(startDate: Date, endDate: Date): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  // Check if start is at beginning of day (00:00:00) and end is at end of day (23:59:59)
  const isStartAllDay = startDate.getHours() === 0 && 
                        startDate.getMinutes() === 0 && 
                        startDate.getSeconds() === 0;
                      
  const isEndAllDay = endDate.getHours() === 23 && 
                      endDate.getMinutes() === 59 && 
                      (endDate.getSeconds() === 59 || endDate.getSeconds() === 0); // Allow for 59 or 0 seconds
  
  console.log(`[TimeService] Checking if all-day event: ${isStartAllDay && isEndAllDay}`);
  console.log(`- Start: ${startDate.toString()} (${isStartAllDay ? 'all-day start' : 'specific time'})`);
  console.log(`- End: ${endDate.toString()} (${isEndAllDay ? 'all-day end' : 'specific time'})`);
  
  return isStartAllDay && isEndAllDay;
}

// Create all-day event times (beginning of start day to end of end day) (from original TimeService)
export function createAllDayEventTimes(startDate: Date, endDate?: Date): {
  startDate: Date;
  endDate: Date;
} {
  console.log(`[TimeService] Creating all-day event times`);
  if (!isValidDate(startDate)) {
      startDate = new Date(); // Fallback
  }
  
  // Clone to avoid modifying original
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // Set to beginning of day
  
  // If no end date provided, use same day as start
  const endInputDate = (endDate && isValidDate(endDate)) ? endDate : start;
  const end = new Date(endInputDate);
  end.setHours(23, 59, 59, 999); // Set to end of day
  
  console.log(`[TimeService] All-day event times:`);
  console.log(`- Start: ${start.toString()}`);
  console.log(`- End: ${end.toString()}`);
  
  return { startDate: start, endDate: end };
}

// Create an object with standard time options for invites (from original TimeService)
export function getStandardTimeOptions(): string[] {
  return [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
}

// Create standard invitation time (e.g., 1-hour meeting) (from original TimeService)
export function createStandardInviteTimes(): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  
  // Round current time to nearest hour
  const currentHour = now.getHours();
  const nextHour = currentHour + 1;
  
  // Create start date at the next hour
  const startDate = new Date();
  startDate.setHours(nextHour, 0, 0, 0);
  
  // Create end date one hour later
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);
  
  return { startDate, endDate };
}

// --- Export consolidated service object ---

const TimeService = {
  // Formatting
  formatShortDate, // MM/DD/YY
  formatMediumDate, // Mon DD, YYYY
  formatLongDate, // Weekday, Mon DD, YYYY
  formatTime, // h:mm AM/PM
  formatDateTimeRange,
  // Parsing
  parseTimeString,
  // Utilities
  isValidDate,
  createLocalDate,
  getCurrentDateStart,
  addHours,
  isAllDayEvent,
  createAllDayEventTimes,
  getStandardTimeOptions,
  createStandardInviteTimes,
};

export default TimeService; 