/**
 * TimeService - Handles date and time operations with consistent timezone handling
 */

// Format a date as MM/DD/YY
export function formatShortDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

// Format time as h:mm AM/PM with correct timezone handling
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  return `${hours}:${minutes} ${ampm}`;
}

// Create a date with a specific time (hours, minutes) in the local timezone
export function createLocalDate(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Get current local date with time set to the beginning of the day
export function getCurrentDateStart(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Add hours to a date and preserve the timezone
export function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

// Convert an ISO string or formatted date string to a local Date object
export function fromISOString(dateString: string): Date {
  try {
    console.log(`[TimeService] Attempting to parse: "${dateString}"`);
    
    // First, check for all-day indicators
    const isAllDayStart = dateString.includes('12:00 AM');
    const isAllDayEnd = dateString.includes('11:59 PM');
    
    if (isAllDayStart || isAllDayEnd) {
      console.log(`[TimeService] Detected all-day format ${isAllDayStart ? 'start' : 'end'}`);
    }
    
    // First, try direct parsing (works for ISO strings)
    const directParsed = new Date(dateString);
    if (!isNaN(directParsed.getTime())) {
      console.log(`[TimeService] Successfully parsed via direct method: ${directParsed.toISOString()}`);
      
      // If it's an all-day event, adjust the time appropriately
      if (isAllDayStart) {
        directParsed.setHours(0, 0, 0, 0);
        console.log(`[TimeService] Adjusted to start of day: ${directParsed.toISOString()}`);
      } else if (isAllDayEnd) {
        directParsed.setHours(23, 59, 59, 999);
        console.log(`[TimeService] Adjusted to end of day: ${directParsed.toISOString()}`);
      }
      
      return directParsed;
    }
    
    console.log(`[TimeService] Direct parsing failed, trying pattern matching...`);
    
    // Try a more flexible regex that handles common variations and typos
    // This fixes the "Satruday" typo by making the day name portion more flexible
    // Old pattern: /(\w+),\s+(\w{3})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}):(\d{2})([AP]M)/i
    // New pattern with more flexibility:
    const longFormatRegex = /(\w+)?,?\s*(\w{3,9})\s*(\d{1,2})\s*,?\s*(\d{4})\s*,?\s*(\d{1,2}):(\d{2})\s*([AP]\.?M\.?)/i;
    
    console.log(`[TimeService] Using regex pattern: ${longFormatRegex}`);
    const match = dateString.match(longFormatRegex);
    
    if (match) {
      console.log(`[TimeService] Regex matched: ${JSON.stringify(match)}`);
      
      // Extract components
      const [_, dayName, monthName, day, year, hours, minutes, ampm] = match;
      
      console.log(`[TimeService] Extracted components:`);
      console.log(`- Day name: "${dayName}"`);
      console.log(`- Month name: "${monthName}"`);
      console.log(`- Day: ${day}`);
      console.log(`- Year: ${year}`);
      console.log(`- Hours: ${hours}`);
      console.log(`- Minutes: ${minutes}`);
      console.log(`- AM/PM: "${ampm}"`);
      
      // Parse month (0-11)
      const month = parseMonth(monthName);
      console.log(`[TimeService] Parsed month "${monthName}" to index: ${month}`);
      
      // Parse hours (in 24-hour format)
      let hour = parseInt(hours);
      if (ampm.toUpperCase().includes('P') && hour < 12) {
        hour += 12;
      } else if (ampm.toUpperCase().includes('A') && hour === 12) {
        hour = 0;
      }
      
      console.log(`[TimeService] Adjusted hour to 24h format: ${hour}`);
      
      // Create date
      const date = new Date(
        parseInt(year),
        month,
        parseInt(day),
        hour,
        parseInt(minutes),
        0
      );
      
      console.log(`[TimeService] Created date: ${date.toString()}`);
      console.log(`[TimeService] ISO string: ${date.toISOString()}`);
      console.log(`[TimeService] Is valid date: ${!isNaN(date.getTime())}`);
      
      // If the time suggests an all-day event, adjust accordingly
      if (hour === 0 && parseInt(minutes) === 0 && ampm.toUpperCase().includes('A')) {
        console.log(`[TimeService] Detected all-day start time (12:00 AM), setting to start of day`);
        date.setHours(0, 0, 0, 0);
      } else if (hour === 23 && parseInt(minutes) === 59) {
        console.log(`[TimeService] Detected all-day end time (11:59 PM), setting to end of day`);
        date.setHours(23, 59, 59, 999);
      }
      
      return date;
    }
    
    // Try an even more lenient approach
    console.log(`[TimeService] Regex pattern didn't match, checking for specific all-day patterns`);
    
    // Look for "all day" text pattern, which may be separated from the date part
    if (dateString.toLowerCase().includes('all day')) {
      console.log(`[TimeService] Found "all day" text pattern`);
      
      // Extract just the date part and try to parse it
      const datePart = dateString.split(',').slice(0, -1).join(',');
      console.log(`[TimeService] Extracted date part: "${datePart}"`);
      
      // Try to parse just the date part
      const datePartParsed = new Date(datePart);
      if (!isNaN(datePartParsed.getTime())) {
        console.log(`[TimeService] Successfully parsed date part: ${datePartParsed.toISOString()}`);
        
        // Assume this is a start date for all-day events
        datePartParsed.setHours(0, 0, 0, 0);
        return datePartParsed;
      }
    }
    
    // Try analyzing components
    console.log(`[TimeService] Analyzing date string components:`);
    
    // Split by common separators to analyze parts
    const parts = dateString.split(/[\s,.:;-]+/);
    console.log(`[TimeService] Date string parts: ${JSON.stringify(parts)}`);
    
    // Look for month names in the parts
    let potentialMonthIndex = -1;
    parts.forEach((part, index) => {
      if (part.length >= 3) {
        const monthValue = parseMonth(part);
        if (monthValue !== undefined && monthValue >= 0 && monthValue <= 11) {
          console.log(`[TimeService] Found potential month "${part}" at index ${index}, value: ${monthValue}`);
          potentialMonthIndex = index;
        }
      }
    });
    
    // Look for AM/PM indicators
    const hasAMPM = parts.some(part => 
      part.toUpperCase().includes('AM') || 
      part.toUpperCase().includes('PM')
    );
    console.log(`[TimeService] Contains AM/PM indicator: ${hasAMPM}`);
    
    // Look for 4-digit years
    const yearPart = parts.find(part => /^\d{4}$/.test(part));
    console.log(`[TimeService] Potential year part: ${yearPart}`);
    
    // Log detailed information for debugging
    console.warn(`[TimeService] Could not parse date string: "${dateString}"`);
    
    // Fall back to current date
    return new Date();
  } catch (error) {
    console.error('[TimeService] Error parsing date:', error);
    return new Date();
  }
}

// Determine if a date represents an all-day event start or end
export function isAllDayEvent(startDate: Date, endDate: Date): boolean {
  // Check if start is at beginning of day (00:00:00) and end is at end of day (23:59:59)
  const isStartAllDay = startDate.getHours() === 0 && 
                        startDate.getMinutes() === 0 && 
                        startDate.getSeconds() === 0;
                      
  const isEndAllDay = endDate.getHours() === 23 && 
                      endDate.getMinutes() === 59 && 
                      (endDate.getSeconds() === 59 || endDate.getSeconds() === 0);
  
  console.log(`[TimeService] Checking if all-day event: ${isStartAllDay && isEndAllDay}`);
  console.log(`- Start: ${startDate.toString()} (${isStartAllDay ? 'all-day start' : 'specific time'})`);
  console.log(`- End: ${endDate.toString()} (${isEndAllDay ? 'all-day end' : 'specific time'})`);
  
  return isStartAllDay && isEndAllDay;
}

// Create all-day event times (beginning of start day to end of end day)
export function createAllDayEventTimes(startDate: Date, endDate?: Date): {
  startDate: Date;
  endDate: Date;
} {
  console.log(`[TimeService] Creating all-day event times`);
  
  // Clone to avoid modifying original
  const start = new Date(startDate);
  // Set to beginning of day
  start.setHours(0, 0, 0, 0);
  
  // If no end date provided, use same day as start
  const end = endDate ? new Date(endDate) : new Date(start);
  // Set to end of day
  end.setHours(23, 59, 59, 999);
  
  console.log(`[TimeService] All-day event times:`);
  console.log(`- Start: ${start.toString()}`);
  console.log(`- End: ${end.toString()}`);
  
  return { startDate: start, endDate: end };
}

// Format a date range as a string with all-day handling
export function formatDateTimeRange(startDate: Date, endDate: Date): {
  date: string;
  timeRange: string;
} {
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
        date: formatShortDate(startDate),
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

// Create an object with standard time options for invites
export function getStandardTimeOptions(): string[] {
  return [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
}

// Create standard invitation time (e.g., 1-hour meeting)
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

// Parse a month name (full or abbreviated) to its numeric value (0-11)
function parseMonth(month: string): number {
  if (!month) {
    console.warn('[TimeService] parseMonth received empty month name');
    return 0;
  }
  
  console.log(`[TimeService] parseMonth called with: "${month}"`);
  
  // Standardize input by removing periods and lowercasing
  const normalizedMonth = month.toLowerCase().replace(/\./g, '');
  console.log(`[TimeService] Normalized month name: "${normalizedMonth}"`);
  
  const months = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8, sept: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };
  
  const monthIndex = months[normalizedMonth];
  console.log(`[TimeService] Month index result: ${monthIndex !== undefined ? monthIndex : 'undefined'}`);
  
  // If exact match fails, try prefix matching
  if (monthIndex === undefined) {
    console.log('[TimeService] Exact match failed, trying prefix matching');
    
    // Try to match by prefix (first 3 chars)
    const prefix = normalizedMonth.substring(0, 3);
    console.log(`[TimeService] Trying prefix: "${prefix}"`);
    
    const prefixMatch = months[prefix];
    console.log(`[TimeService] Prefix match result: ${prefixMatch !== undefined ? prefixMatch : 'undefined'}`);
    
    return prefixMatch !== undefined ? prefixMatch : 0;
  }
  
  return monthIndex;
}

const TimeService = {
  formatShortDate,
  formatTime,
  createLocalDate,
  getCurrentDateStart,
  addHours,
  fromISOString,
  formatDateTimeRange,
  getStandardTimeOptions,
  createStandardInviteTimes,
  isAllDayEvent,
  createAllDayEventTimes
};

export default TimeService; 