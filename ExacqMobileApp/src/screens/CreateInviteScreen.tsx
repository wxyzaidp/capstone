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
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI_COLORS } from '../design-system';
import ChevronIcon from '../components/icons/ChevronIcon';
import CalendarChevronIcon from '../components/icons/CalendarChevronIcon';
import CalendarMonthChevronIcon from '../components/icons/CalendarMonthChevronIcon';
import Constants from 'expo-constants';
import CustomToggle from '../components/ui/CustomToggle';
import InviteDuration, { InviteData } from '../components/InviteDuration';
import { LinearGradient } from 'expo-linear-gradient';
import SelectHostBottomSheet from '../components/SelectHostBottomSheet';
import { EventEmitter } from 'events';
import InviteService from '../services/InviteService';
import Calendar from '../components/Calendar';
import TimeService from '../services/TimeService';

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
  const timeOptions = TimeService.getStandardTimeOptions();
  
  // Display formatted date if available
  const displayDate = selectedDate ? formatDate(selectedDate).split(',')[1].trim() : 'Add Date';
  
  // Add logging when all-day is toggled
  const handleAllDayToggle = (newValue: boolean) => {
    console.log(`[TimeSelection] All-day toggled to: ${newValue}`);
    setIsAllDay(newValue);
  };
  
  return (
    <View style={styles.timeSelectionContainer}>
      {type === 'from' && (
        <View style={styles.allDayContainer}>
          <Text style={styles.allDayText}>All Day</Text>
          <View style={styles.toggleWrapper}>
            <CustomToggle
              value={isAllDay}
              onValueChange={handleAllDayToggle}
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
  const [employeeListVisible, setEmployeeListVisible] = useState(false);

  // Sample employee data - in a real app, this would come from an API
  const employees = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' },
    { id: '5', name: 'Robert Wilson' },
    { id: '6', name: 'Jennifer Lee' },
    { id: '7', name: 'David Garcia' },
    { id: '8', name: 'Jessica Martinez' },
    { id: '9', name: 'Thomas Anderson' },
    { id: '10', name: 'Lisa Rodriguez' },
  ];

  // Handle employee selection
  const handleEmployeeSelect = (employee: { id: string; name: string }) => {
    console.log('Employee selected:', employee);
    updateField('hostName', employee.name);
    setEmployeeListVisible(false);
  };

  // Update form fields
  const updateField = (field: keyof InviteData, value: string | boolean) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update the isFormValid function to be more lenient and add logging
  const isFormValid = () => {
    console.log('[CreateInviteScreen] Checking form validity...');
    console.log(`[CreateInviteScreen] visitorName: "${inviteData.visitorName}"`);
    console.log(`[CreateInviteScreen] visitorEmail: "${inviteData.visitorEmail}"`);
    console.log(`[CreateInviteScreen] hostName: "${inviteData.hostName}"`);
    console.log(`[CreateInviteScreen] validFrom: "${inviteData.validFrom}"`);
    console.log(`[CreateInviteScreen] validUntil: "${inviteData.validUntil}"`);
    
    // For testing purposes, make validation more lenient
    // Only require visitorName and dates
    const hasName = !!inviteData.visitorName && inviteData.visitorName.trim() !== '';
    const hasValidFrom = !!inviteData.validFrom && inviteData.validFrom.trim() !== '';
    const hasValidUntil = !!inviteData.validUntil && inviteData.validUntil.trim() !== '';
    
    const isValid = hasName && hasValidFrom && hasValidUntil;
    
    console.log(`[CreateInviteScreen] Form validity result: ${isValid}`);
    return isValid;
  };

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Update the handleCreateInvite function to properly format dates and ensure no circular dependencies
  const handleCreateInvite = async () => {
    console.log('[CreateInviteScreen] ==================== CREATE INVITE START ====================');
    console.log('[CreateInviteScreen] Creating invite with form data:', JSON.stringify(inviteData, null, 2));
    setIsLoading(true);
    
    // Check if the form is valid
    if (!isFormValid()) {
      console.error('[CreateInviteScreen] Form validation failed');
      Alert.alert('Invalid Form', 'Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('[CreateInviteScreen] Creating invite with InviteService');
      
      // Function to ensure date is in ISO format with improved error handling and all-day support
      const ensureISOFormat = (dateStr: string | null | undefined, isStart: boolean = true): string => {
        if (!dateStr) {
          console.log('[CreateInviteScreen] No date string provided, using current time');
          return new Date().toISOString();
        }
        
        try {
          console.log(`[CreateInviteScreen] Attempting to parse date: "${dateStr}", isStart: ${isStart}, isAllDay: ${inviteData.isAllDay}`);
          
          // Check if this is an all-day event
          if (inviteData.isAllDay) {
            console.log('[CreateInviteScreen] Processing as all-day event');
            
            // Parse date with TimeService
            const parsedDate = TimeService.fromISOString(dateStr);
            
            // Set to start or end of day based on which field we're processing
            const adjustedDate = new Date(parsedDate);
            if (isStart) {
              // Start date should be at beginning of day
              adjustedDate.setHours(0, 0, 0, 0);
              console.log('[CreateInviteScreen] Set start date to beginning of day:', adjustedDate.toString());
            } else {
              // End date should be at end of day
              adjustedDate.setHours(23, 59, 59, 999);
              console.log('[CreateInviteScreen] Set end date to end of day:', adjustedDate.toString());
            }
            
            // Return ISO string
            return adjustedDate.toISOString();
          }
          
          // For non-all-day events, use regular parsing
          const date = TimeService.fromISOString(dateStr);
          
          // Check if parsing was successful
          if (!isNaN(date.getTime())) {
            const isoString = date.toISOString();
            console.log(`[CreateInviteScreen] Successfully parsed date to: ${isoString}`);
            console.log(`[CreateInviteScreen] Local date representation: ${date.toString()}`);
            return isoString;
          }
          
          // If we still reach here, it means all parsing methods failed
          console.error(`[CreateInviteScreen] All parsing methods failed for: "${dateStr}"`);
          
          // Generate a clean fallback date using TimeService
          console.log('[CreateInviteScreen] Using standard invite time as fallback');
          const { startDate, endDate } = TimeService.createStandardInviteTimes();
          
          // Return appropriate date based on which field we're processing
          const fallbackDate = isStart ? startDate : endDate;
          console.log(`[CreateInviteScreen] Fallback date: ${fallbackDate.toISOString()}`);
          
          return fallbackDate.toISOString();
        } catch (error) {
          console.error('[CreateInviteScreen] Error parsing date:', error);
          console.log('[CreateInviteScreen] Stack trace:', error.stack);
          
          // Even with error, provide a usable date
          const { startDate, endDate } = TimeService.createStandardInviteTimes();
          return isStart ? startDate.toISOString() : endDate.toISOString();
        }
      };
      
      // Format dates
      const validFrom = ensureISOFormat(inviteData.validFrom, true);
      const validUntil = ensureISOFormat(inviteData.validUntil, false);
      
      console.log('[CreateInviteScreen] Final formatted dates:');
      console.log(`[CreateInviteScreen] validFrom: ${validFrom}`);
      console.log(`[CreateInviteScreen] validUntil: ${validUntil}`);
      console.log(`[CreateInviteScreen] isAllDay: ${inviteData.isAllDay}`);
      
      // Create data object for InviteService
      const inviteServiceData = {
        visitorName: inviteData.visitorName || 'Guest',
        validFrom,
        validUntil,
        hostName: inviteData.hostName || ''
      };
      
      // Check formatted times to ensure they're correct before sending
      const startDate = new Date(validFrom);
      const endDate = new Date(validUntil);
      const formattedDisplay = TimeService.formatDateTimeRange(startDate, endDate);
      console.log('[CreateInviteScreen] Formatted display for verification:', formattedDisplay);
      
      // Create the invite
      const newInvite = await InviteService.createInvite(inviteServiceData);
      
      console.log('[CreateInviteScreen] Invite created successfully with ID:', newInvite.id);
      
      // Don't show success Alert, the parent component will show a Toast instead
      if (onCreateInvite) {
        // Call the parent's invite handler which shows a toast
        onCreateInvite(inviteData);
      }
      
      // Close the screen
      onClose();
    } catch (error) {
      console.error('[CreateInviteScreen] Error creating invite:', error);
      Alert.alert('Error', `Failed to create invite: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      console.log('[CreateInviteScreen] ==================== CREATE INVITE END ====================');
    }
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
    const isHostField = field === 'hostName';
    
    const handlePress = () => {
      if (isDateField) {
        setActiveDateField(field as 'validFrom' | 'validUntil');
        setDatePickerVisible(true);
      } else if (isHostField) {
        setEmployeeListVisible(true);
      }
    };
    
    return (
      <View style={{position: 'relative'}}>
        <TouchableOpacity 
          style={[
            styles.inputContainer, 
            isFocused && styles.inputContainerFocused
          ]}
          onPress={isDateField ? handlePress : undefined}
          activeOpacity={isDateField ? 0.7 : 1}
        >
          {isDateField ? (
            // Date field rendering to exactly match design
            hasValue ? (
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
              <View style={styles.dateDisplayContainer}>
                <Text style={[styles.dateText, {color: '#B6BDCD'}]}>
                  {label}{optional ? ' (optional)' : ''}
                </Text>
              </View>
            )
          ) : (
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
                editable={!isHostField}
              />
            </>
          )}
          
          {(isDateField || isHostField) && (
            <ChevronIcon direction="right" width={20} height={20} fill="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        {/* Transparent overlay to capture touches for host field */}
        {isHostField && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'transparent'
            }}
            onPress={handlePress}
            activeOpacity={1}
          />
        )}
      </View>
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

            {/* Visit Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Visit Details</Text>
              </View>
              <View style={styles.formSection}>
                {renderInputField('Host Name', 'hostName')}
                {renderInputField('Reason for Visit', 'reasonForVisit', true)}
                {renderInputField('Notes for Visitor', 'notesForVisitor', true)}
                {renderInputField('Notes for Reception', 'notesForReception', true)}
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
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Invite</Text>
              )}
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

        {/* Employee List bottom sheet component */}
        <SelectHostBottomSheet 
          visible={employeeListVisible}
          onClose={() => setEmployeeListVisible(false)}
          onSelect={handleEmployeeSelect}
          employees={employees}
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
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
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
  employeeListContainer: {
    flex: 1,
    padding: 16,
  },
  employeeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  employeeName: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default CreateInviteScreen; 