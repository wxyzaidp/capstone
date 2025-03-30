/**
 * DateService - Centralized date handling for the application
 */

// Constants
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Types
export interface ParsedDateTime {
  date: Date | null;
  time: string | null;
}

/**
 * Checks if a date object is valid
 */
export const isValidDate = (date: Date | null): boolean => {
  if (!date) return false;
  return !isNaN(date.getTime());
};

/**
 * Parse a date string from the API/inviteData into separate date and time components
 * Handles formats like "Sunday, Mar 13, 2024, 10:00 AM" and ISO strings
 */
export const parseInviteDate = (dateStr: string): ParsedDateTime => {
  if (!dateStr) {
    console.log('DateService: Empty date string provided');
    return { date: null, time: null };
  }
  
  console.log('DateService: Parsing date string:', dateStr);
  
  // Log raw string details for debugging
  console.log('DateService: String length:', dateStr.length);
  
  let date = null;
  let time = null;
  
  try {
    // First check for ISO format (most reliable)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      console.log('DateService: Detected ISO format, using direct parsing');
      date = new Date(dateStr);
      
      if (isValidDate(date)) {
        // Extract time from ISO string
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
        time = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        console.log('DateService: Successfully parsed ISO date:', date.toISOString());
        console.log('DateService: Extracted time:', time);
        return { date, time };
      }
    }
  
    // Count commas for non-ISO format
    const commaCount = (dateStr.match(/,/g) || []).length;
    console.log('DateService: Comma count:', commaCount);
    
    // Different parsing strategies based on string format
    if (commaCount >= 2) {
      // Format with day name: "Sunday, Mar 13, 2024, 10:00 AM"
      const lastCommaIndex = dateStr.lastIndexOf(',');
      const datePart = dateStr.substring(0, lastCommaIndex);
      const timePart = dateStr.substring(lastCommaIndex + 1).trim();
      
      console.log('DateService: Extracted date part:', datePart);
      console.log('DateService: Extracted time part:', timePart);
      
      // APPROACH 1: Try standard parsing with Date constructor
      let parsedDate = new Date(datePart);
      
      // APPROACH 2: If standard parsing fails, try handling specific formats
      if (!isValidDate(parsedDate)) {
        console.log('DateService: Standard parsing failed, trying direct extraction');
        
        // Extract month, day, year directly using regex
        const monthDayYearMatch = datePart.match(/([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/);
        if (monthDayYearMatch) {
          const [_, month, day, year] = monthDayYearMatch;
          console.log(`DateService: Extracted components: month=${month}, day=${day}, year=${year}`);
          
          // Convert month name to number (0-11)
          const monthIndex = MONTHS_SHORT.findIndex(m => m === month);
          if (monthIndex !== -1) {
            parsedDate = new Date(parseInt(year), monthIndex, parseInt(day));
            console.log('DateService: Created date from components:', parsedDate.toISOString());
          }
        }
      }
      
      // APPROACH 3: Try manual component extraction as last resort
      if (!isValidDate(parsedDate)) {
        console.log('DateService: Component extraction failed, trying parts array');
        
        const parts = datePart.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          // Try with just the month/day/year part (ignoring day name)
          try {
            const dateWithoutDayName = parts.slice(1).join(', ');
            console.log('DateService: Trying to parse without day name:', dateWithoutDayName);
            parsedDate = new Date(dateWithoutDayName);
          } catch (e) {
            console.error('DateService: Failed to parse without day name:', e);
          }
        }
      }
      
      // APPROACH 4: Try direct date component construction
      if (!isValidDate(parsedDate) && datePart.includes(',')) {
        console.log('DateService: All parsing failed, trying direct construction');
        
        // Look for a pattern like "Mar 29, 2025" anywhere in the string
        const datePattern = /([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/;
        const match = datePart.match(datePattern);
        
        if (match) {
          const month = match[1];
          const day = parseInt(match[2]);
          const year = parseInt(match[3]);
          
          // Get month index (0-11)
          const monthIndex = MONTHS_SHORT.findIndex(m => 
            m.toLowerCase() === month.toLowerCase());
          
          if (monthIndex !== -1) {
            parsedDate = new Date(year, monthIndex, day);
            console.log('DateService: Created date through direct construction:', 
              year, monthIndex, day, parsedDate.toISOString());
          }
        }
      }
      
      if (isValidDate(parsedDate)) {
        date = parsedDate;
        console.log('DateService: Successfully parsed date:', date.toISOString());
      } else {
        console.error('DateService: All parsing attempts failed for:', datePart);
      }
      
      // Store the time string if it looks valid
      if (timePart.match(/\d+:\d+\s+(AM|PM)/)) {
        time = timePart;
      }
    } else if (commaCount === 1) {
      // Simpler format: "Mar 13, 2024"
      let parsedDate = new Date(dateStr);
      
      // If standard parsing fails, try regex extraction
      if (!isValidDate(parsedDate)) {
        const monthDayYearMatch = dateStr.match(/([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/);
        if (monthDayYearMatch) {
          const [_, month, day, year] = monthDayYearMatch;
          const monthIndex = MONTHS_SHORT.findIndex(m => m === month);
          if (monthIndex !== -1) {
            parsedDate = new Date(parseInt(year), monthIndex, parseInt(day));
          }
        }
      }
      
      if (isValidDate(parsedDate)) {
        date = parsedDate;
        console.log('DateService: Successfully parsed date:', date.toISOString());
      }
    } else {
      // No commas - try direct parsing
      const parsedDate = new Date(dateStr);
      if (isValidDate(parsedDate)) {
        date = parsedDate;
        console.log('DateService: Successfully parsed date:', date.toISOString());
      } else {
        console.error('DateService: Failed to parse date string with no commas:', dateStr);
      }
    }
    
    // If all parsing failed, use current date as fallback
    if (!date) {
      console.warn('DateService: All parsing attempts failed. Using current date as fallback.');
      date = new Date();
    }
  } catch (e) {
    console.error('DateService: Error parsing date:', e);
    // Use current date as fallback on error
    date = new Date();
  }
  
  console.log('DateService: Final parsing result:', { 
    date: date ? date.toISOString() : null, 
    time 
  });
  
  return { date, time };
};

/**
 * Format a date object to short format (Jan 21, 2023)
 */
export const formatShortDate = (date: Date | null): string => {
  if (!isValidDate(date)) return 'Add Date';
  
  try {
    return `${MONTHS_SHORT[date!.getMonth()]} ${date!.getDate()}, ${date!.getFullYear()}`;
  } catch (error) {
    console.error('DateService: Error formatting short date:', error);
    return 'Add Date';
  }
};

/**
 * Format a date object to long format (Sunday, Jan 21, 2023)
 */
export const formatLongDate = (date: Date | null): string => {
  if (!isValidDate(date)) {
    console.error('DateService: Invalid date in formatLongDate:', date);
    return '';
  }

  try {
    const dayName = DAYS[date!.getDay()];
    const monthName = MONTHS_SHORT[date!.getMonth()];
    const dayNumber = date!.getDate();
    const year = date!.getFullYear();
    
    return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
  } catch (error) {
    console.error('DateService: Error in formatLongDate:', error);
    return '';
  }
};

/**
 * Format a Date object with optional time for saving to inviteData
 */
export function formatInviteDate(date: Date, time: string | null, isAllDay: boolean): string {
  console.log('[DateService] formatInviteDate called with:', {
    date: date ? date.toString() : 'null',
    time: time || 'null',
    isAllDay
  });
  
  try {
    // Clone the date to avoid modifying the original
    const formattedDate = new Date(date);
    
    // Get day name, month, date, and year components
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = dayNames[formattedDate.getDay()];
    const monthName = monthNames[formattedDate.getMonth()];
    const day = formattedDate.getDate();
    const year = formattedDate.getFullYear();
    
    // Format the date part as "DayName, MonthName DD YYYY"
    let dateString = `${dayName}, ${monthName} ${day} ${year}`;
    
    console.log('[DateService] Date components:', {
      dayName, 
      monthName, 
      day, 
      year, 
      dateString
    });
    
    // If isAllDay is true, use 12:00AM for start dates and 11:59PM for end dates
    let timeString;
    
    if (isAllDay) {
      console.log('[DateService] Handling as all-day event');
      
      // Check if this is a start date or end date
      // This is just a guess based on the time, we don't have context
      const isStartDate = !time || time.includes('AM');
      const isEndDate = time && time.includes('PM');
      
      console.log('[DateService] Determined date type:', {
        isStartDate,
        isEndDate,
        time
      });
      
      // For all-day events, use 12:00 AM for start date and 11:59 PM for end date
      if (isStartDate) {
        timeString = '12:00 AM';
      } else if (isEndDate) {
        timeString = '11:59 PM';
      } else {
        // Default to "All day" for display
        timeString = '12:00 AM'; // Default to start time
      }
      
      console.log('[DateService] Using all-day time:', timeString);
    } else if (time) {
      // Use the provided time if it exists
      timeString = time;
      console.log('[DateService] Using provided time:', timeString);
    } else {
      // Default to current time if no time provided (shouldn't happen)
      const hours = formattedDate.getHours();
      const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      timeString = `${hour12}:${minutes} ${ampm}`;
      
      console.log('[DateService] No time provided, using default:', timeString);
    }
    
    // Combine date and time with a comma
    const fullDateString = `${dateString}, ${timeString}`;
    console.log('[DateService] Final formatted string:', fullDateString);
    
    return fullDateString;
  } catch (error) {
    console.error('[DateService] Error in formatInviteDate:', error);
    
    // Return a fallback date string
    const now = new Date();
    console.log('[DateService] Falling back to current date/time');
    return now.toDateString() + ', ' + now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}

/**
 * Parse a time string to a Date object
 * Handles formats like "10:00 AM"
 */
export const parseTimeString = (timeStr: string | null): Date | null => {
  if (!timeStr) return null;
  
  try {
    const match = timeStr.match(/(\d+):(\d+) (AM|PM)/);
    if (match) {
      const now = new Date();
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const isPM = match[3] === 'PM';
      
      // Convert to 24-hour format
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      now.setHours(hours, minutes, 0, 0);
      return now;
    }
  } catch (e) {
    console.error('DateService: Error parsing time string:', e);
  }
  
  return null;
};

/**
 * Format a time from a date using local timezone
 * Returns time in 12-hour format (e.g. "10:30 AM")
 */
export const formatLocalTime = (date: Date | null): string => {
  if (!isValidDate(date)) return '';
  
  try {
    // Get the local timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return date!.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone
    });
  } catch (error) {
    console.error('DateService: Error formatting local time:', error);
    return '';
  }
};

/**
 * Ensures a date is converted to ISO string format with timezone handling
 */
export const toISOWithTimezone = (date: Date | string | null): string => {
  if (!date) return new Date().toISOString();
  
  try {
    // If already a string, check if it's ISO format
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return date; // Already ISO format
      }
      
      // Try to parse non-ISO string
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      
      // Try more complex parsing with our utility
      const { date: complexDate } = parseInviteDate(date);
      if (complexDate && !isNaN(complexDate.getTime())) {
        return complexDate.toISOString();
      }
      
      console.warn('DateService: Could not convert string to ISO format:', date);
      return date;
    }
    
    // If it's a Date object
    return date.toISOString();
  } catch (error) {
    console.error('DateService: Error converting to ISO with timezone:', error);
    return new Date().toISOString(); // Default to current time
  }
};

export default {
  isValidDate,
  parseInviteDate,
  formatShortDate,
  formatLongDate,
  formatInviteDate,
  parseTimeString,
  formatLocalTime,
  toISOWithTimezone
}; 