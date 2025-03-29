import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  Modal,
  Dimensions,
  Switch,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI_COLORS } from '../design-system';
import ChevronIcon from '../components/icons/ChevronIcon';
import Constants from 'expo-constants';
import CustomToggle from '../components/ui/CustomToggle';
import InviteDuration, { InviteData } from '../components/InviteDuration';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions
const { width } = Dimensions.get('window');

interface CreateInviteScreenProps {
  onClose: () => void;
  onCreateInvite?: (inviteData: InviteData) => void;
}

// Define a constant for the accent color
const ACCENT_COLOR = '#6FDCFA';

// Use a safer approach to set default styling
const setDefaultTextInputStyles = () => {
  if (Platform.OS === 'ios') {
    // We'll apply these styles individually to each TextInput
    console.log('Setting up iOS TextInput styles');
  } else {
    console.log('Setting up Android TextInput styles');
  }
};

// Call once during initialization
setDefaultTextInputStyles();

// Utility functions for date handling
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date: Date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNumber = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
};

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${hours}:${formattedMinutes} ${ampm}`;
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
  const today = new Date();
  
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
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
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
  
  // Get month name and year
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

  // Function to determine gradient colors
  const getGradientProps = useCallback((rangeInfo: { isStart: boolean, isEnd: boolean, isInRange: boolean } | null) => {
    if (!rangeInfo) return null;
    
    if (rangeInfo.isStart) {
      return {
        colors: ['#6FDCFA', 'rgba(111, 220, 250, 0.35)'] as [string, string],
        start: {x: 0, y: 0.5},
        end: {x: 1, y: 0.5},
        style: { left: 22, right: 0 } // Start from middle of circle
      };
    } else if (rangeInfo.isEnd) {
      return {
        colors: ['rgba(111, 220, 250, 0.35)', '#6FDCFA'] as [string, string],
        start: {x: 0, y: 0.5},
        end: {x: 1, y: 0.5},
        style: { left: 0, right: 22 } // End at middle of circle
      };
    } else if (rangeInfo.isInRange) {
      return {
        colors: ['rgba(111, 220, 250, 0.35)', 'rgba(111, 220, 250, 0.35)'] as [string, string],
        start: {x: 0, y: 0.5},
        end: {x: 1, y: 0.5},
        style: {}
      };
    }
    
    return null;
  }, []);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.monthYearHeader}>
        <View style={styles.monthYearText}>
          <Text style={styles.monthText}>{getMonthName()}</Text>
          <Text style={styles.yearText}>{currentYear}</Text>
        </View>
        <View style={styles.monthNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <ChevronIcon direction="left" width={24} height={24} fill={ACCENT_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <ChevronIcon direction="right" width={24} height={24} fill={ACCENT_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
      
      <WeekDays />
      
      <View style={styles.datesContainer}>
        {calendarDays.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const isPast = day !== null && new Date(currentYear, currentMonth, day) < today;
              
              // Determine if this day is selected or in range
              let isStart = false;
              let isEnd = false;
              
              if (day !== null && selectedStartDate && selectedEndDate) {
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
                
                isStart = currentDate.getTime() === startDate.getTime();
                isEnd = currentDate.getTime() === endDate.getTime();
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
                  {/* Render the gradient highlight if this day is in the range */}
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
    </View>
  );
};

// Time Selection component
const TimeSelection = ({ 
  isAllDay, 
  setIsAllDay, 
  selectedDate, 
  selectedTime, 
  onTimeSelect,
  type
}: { 
  isAllDay: boolean, 
  setIsAllDay: (value: boolean) => void,
  selectedDate: Date | null,
  selectedTime: string,
  onTimeSelect: (time: string) => void,
  type: 'from' | 'to'
}) => {
  // Time presets
  const timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                       '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  
  // Display formatted date if available
  const displayDate = selectedDate ? formatDate(selectedDate).split(',')[1].trim() : 'Add Date';
  
  return (
    <View style={styles.timeSelectionContainer}>
      {type === 'from' && (
        <View style={styles.allDayContainer}>
          <Text style={styles.allDayText}>All Day</Text>
          <View style={styles.toggleWrapper}>
            <CustomToggle
              value={isAllDay}
              onValueChange={setIsAllDay}
            />
          </View>
        </View>
      )}
      
      <View style={styles.timeSelectionRow}>
        <Text style={styles.timeSelectionLabel}>{type === 'from' ? 'From' : 'To'}</Text>
        <View style={styles.chipsContainer}>
          <TouchableOpacity 
            style={[
              styles.timeChip, 
              !isAllDay && selectedDate && styles.timeChipSelected
            ]}
          >
            <Text 
              style={[
                styles.timeChipText, 
                !isAllDay && selectedDate && styles.timeChipTextSelected
              ]}
            >
              {displayDate}
            </Text>
          </TouchableOpacity>
          {!isAllDay && (
            <View style={styles.timeChipsScrollContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timeChipsScroll}
              >
                {timeOptions.map((time, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.timeChip,
                      selectedTime === time && styles.timeChipSelected
                    ]}
                    onPress={() => onTimeSelect(time)}
                  >
                    <Text 
                      style={[
                        styles.timeChipText,
                        selectedTime === time && styles.timeChipTextSelected
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const CreateInviteScreen: React.FC<CreateInviteScreenProps> = ({ 
  onClose,
  onCreateInvite 
}) => {
  // Log platform information
  useEffect(() => {
    console.log('Platform OS:', Platform.OS);
    console.log('Platform Version:', Platform.Version);
    console.log('Testing cursor color implementation');
    
    // Log TextInput.defaultProps for debugging
    console.log('Initializing TextInput styling');
  }, []);
  
  // Form state with invite data
  const [inviteData, setInviteData] = useState<InviteData>({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    validFrom: '',
    validUntil: '',
    hostName: '',
    reasonForVisit: '',
    notesForVisitor: '',
    notesForReception: '',
    isAllDay: false
  });

  // Track which field is focused
  const [focusedField, setFocusedField] = useState<keyof InviteData | null>(null);
  
  // Bottom sheet state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'validFrom' | 'validUntil' | null>(null);

  // Update form fields
  const updateField = (field: keyof InviteData, value: string | boolean) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if form is valid (all required fields filled)
  const isFormValid = () => {
    return Boolean(
      inviteData.visitorName && 
      inviteData.visitorEmail && 
      inviteData.validFrom && 
      inviteData.validUntil && 
      inviteData.hostName
    );
  };

  // Handle create invite
  const handleCreateInvite = () => {
    // Don't proceed if form is invalid
    if (!isFormValid()) return;
    
    if (onCreateInvite) {
      onCreateInvite(inviteData);
    }
    onClose();
  };

  // Log focus changes
  const handleFocus = (field: keyof InviteData) => {
    console.log('Field focused:', field);
    setFocusedField(field);
    
    // Open date picker if date field is focused
    if (field === 'validFrom' || field === 'validUntil') {
      setActiveDateField(field as 'validFrom' | 'validUntil');
      setDatePickerVisible(true);
    }
  };

  const handleBlur = () => {
    console.log('Field blurred, focused field was:', focusedField);
    setFocusedField(null);
  };
  
  // Handle date picker save
  const handleDatePickerSave = () => {
    setDatePickerVisible(false);
  };

  // Get input props based on platform
  const getInputProps = () => {
    // Universal props that work on both platforms
    const universalProps = {
      selectionColor: ACCENT_COLOR,
    };

    // Platform-specific props
    if (Platform.OS === 'ios') {
      return {
        ...universalProps,
        tintColor: ACCENT_COLOR, // iOS specific
      };
    } else {
      return {
        ...universalProps,
        cursorColor: ACCENT_COLOR, // Android specific
      };
    }
  };

  // Render functional input field
  const renderInputField = (label: string, field: keyof InviteData, optional: boolean = false) => {
    const value = inviteData[field];
    const isFocused = focusedField === field;
    const hasValue = Boolean(value);
    const inputProps = getInputProps();
    const isDateField = field === 'validFrom' || field === 'validUntil';
    
    const handlePress = () => {
      if (isDateField) {
        setActiveDateField(field as 'validFrom' | 'validUntil');
        setDatePickerVisible(true);
      }
    };
    
    return (
      <TouchableOpacity 
        style={[
          styles.inputContainer, 
          isFocused && styles.inputContainerFocused
        ]}
        onPress={isDateField ? handlePress : undefined}
        activeOpacity={isDateField ? 0.7 : 1}
      >
        {isDateField ? (
          // FIXED: Date field rendering to exactly match design
          hasValue ? (
            // When date has a value: Label at top, date value below
            <>
              <Text style={styles.inputLabel}>
                {label}{optional ? ' (optional)' : ''}
              </Text>
              <View style={styles.dateDisplayContainer}>
                <Text style={[styles.dateText, styles.inputWithValue]}>
                  {value as string}
                </Text>
              </View>
            </>
          ) : (
            // When date is empty: Just show placeholder
            <View style={styles.dateDisplayContainer}>
              <Text style={[styles.dateText, {color: '#B6BDCD'}]}>
                {label}{optional ? ' (optional)' : ''}
              </Text>
            </View>
          )
        ) : (
          // Regular text input fields
          <>
            {hasValue && (
          <Text style={styles.inputLabel}>
            {label}{optional ? ' (optional)' : ''}
          </Text>
        )}
        <TextInput
              style={[
                styles.input,
                hasValue && styles.inputWithValue
              ]}
              value={value as string}
          onChangeText={(text) => updateField(field, text)}
              placeholder={!hasValue ? `${label}${optional ? ' (optional)' : ''}` : ''}
          placeholderTextColor="#B6BDCD"
              {...inputProps}
              onFocus={() => handleFocus(field)}
              onBlur={handleBlur}
            />
          </>
        )}
        
        {(field === 'visitorName' || isDateField) && (
          <ChevronIcon direction="right" width={20} height={20} fill="#FFFFFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#23262D" />
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <ChevronIcon direction="left" width={24} height={24} fill="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Invite</Text>
            <View style={styles.rightPlaceholder} />
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.contentContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Visitor Information Section from Figma */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Visitor Information</Text>
              </View>
              <View style={styles.formSection}>
                {renderInputField('Visitor Name', 'visitorName')}
                {renderInputField('Visitor Email', 'visitorEmail')}
                {renderInputField('Phone Number', 'visitorPhone', true)}
              </View>
            </View>

            {/* Invite Duration Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Invite Duration</Text>
              </View>
              <View style={styles.formSection}>
                {renderInputField('Valid From', 'validFrom')}
                {renderInputField('Valid Until', 'validUntil')}
              </View>
            </View>

            {/* Bottom padding for content scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Bottom Bar with Create Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={[
                styles.createButton,
                !isFormValid() && styles.createButtonDisabled
              ]}
              onPress={handleCreateInvite}
              disabled={!isFormValid()}
            >
              <Text style={[
                styles.createButtonText,
                !isFormValid() && styles.createButtonTextDisabled
              ]}>
                Create Invite
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Use the imported InviteDuration component */}
        <InviteDuration 
          visible={datePickerVisible} 
          onClose={() => setDatePickerVisible(false)}
          onSave={handleDatePickerSave}
          inviteData={inviteData}
          setInviteData={setInviteData}
          activeDateField={activeDateField}
        />
      </View>
    </SafeAreaView>
  );
};

// Create a completely new styles definition to avoid duplication issues
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#23262D',
  },
  container: {
    flex: 1,
    backgroundColor: '#131515',
  },
  topBar: {
    backgroundColor: '#23262D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeaderText: {
    fontFamily: 'Outfit-Medium',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#717C98',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: ACCENT_COLOR,
  },
  inputLabel: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 12,
    color: '#B6BDCD',
    fontFamily: 'Outfit-Regular',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: '#FFFFFF',
    height: 40,
    textAlignVertical: 'center',
  },
  inputWithValue: {
    paddingTop: 16,
  },
  inputPlaceholder: {
    color: '#B6BDCD',
    fontSize: 16,
  },
  dateDisplayContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#23262D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 78, 97, 0.35)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  createButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#131515',
  },
  
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Dimensions.get('window').height,
    backgroundColor: '#23262D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#464E61',
    borderRadius: 4,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonLeft: {
    minWidth: 60,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerButtonRight: {
    minWidth: 60,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  headerTitleText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Calendar Styles
  calendarContainer: {
    backgroundColor: '#404759',
    borderRadius: 12,
    padding: 24,
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
  },
  monthYearText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  yearText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  navButton: {
    padding: 4,
  },
  
  // All Day & Date/Time Selection Styles
  allDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 0,
    marginBottom: 0,
    position: 'relative',
    paddingRight: 56, // Make space for the absolutely positioned toggle
  },
  allDayText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    paddingLeft: 16,
  },
  toggleWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    margin: 0,
    padding: 0,
  },
  dateTimeSelectionContainer: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  dateTimeSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  dateTimeLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    width: 100,
    fontWeight: '600',
  },
  dateTimeChips: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dateChipContainer: {
    flex: 1,
  },
  dateChip: {
    backgroundColor: '#404759',
    borderWidth: 1,
    borderColor: '#646A78',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  timeChipContainer: {
    flex: 1,
  },
  chipButton: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    borderWidth: 1,
    borderColor: '#646A78',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipButtonText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  chipButtonSelected: {
    borderColor: ACCENT_COLOR,
    backgroundColor: 'transparent',
  },
  chipButtonTextSelected: {
    color: ACCENT_COLOR,
  },
  
  // Time Selection Styles
  timeSelectionContainer: {
    width: '100%',
    gap: 8,
  },
  timeSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 8,
    gap: 12,
  },
  timeSelectionLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#B6BDCD',
    width: 100,
  },
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  timeChipsScrollContainer: {
    flex: 1,
  },
  timeChipsScroll: {
    paddingRight: 20,
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    backgroundColor: '#404759',
    borderWidth: 1,
    borderColor: '#646A78',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeChipSelected: {
    backgroundColor: 'transparent',
    borderColor: ACCENT_COLOR,
  },
  timeChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  timeChipTextSelected: {
    color: ACCENT_COLOR,
  },
  calendarWrapper: {
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 24,
    paddingTop: 0,
    marginTop: 0,
  },
  cancelButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: '#FF5F5F',
    textAlign: 'right',
  },
  doneButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: ACCENT_COLOR,
    textAlign: 'right',
  },
  bottomSheetScrollContent: {
    flex: 1,
    width: '100%',
  },
  bottomSheetScrollContainer: {
    paddingBottom: 24,
  },
  dateTimeSelectionRowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(111, 220, 250, 0.3)',
  },
  createButtonTextDisabled: {
    opacity: 0.7,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
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
    color: 'white',
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
});

export default CreateInviteScreen; 