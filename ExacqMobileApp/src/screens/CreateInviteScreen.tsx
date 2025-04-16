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
import { useNavigation, useRoute } from '@react-navigation/native';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Types for navigation
type CreateInviteScreenNavigationProp = any;

interface CreateInviteScreenProps {
  onClose?: () => void;
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
  const timeOptions = TimeService.getStandardTimeOptions();
  const displayDate = selectedDate ? TimeService.formatMediumDate(selectedDate) : 'Add Date';
  
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
  const navigation = useNavigation<CreateInviteScreenNavigationProp>();
  
  // Log platform information
  useEffect(() => {
    console.log('Platform OS:', Platform.OS);
    console.log('Platform Version:', Platform.Version);
    console.log('Testing cursor color implementation');
    
    // Log TextInput.defaultProps for debugging
    console.log('Initializing TextInput styling');
  }, []);
  
  // Form state - keep basic fields, remove validFrom/validUntil strings
  const [inviteData, setInviteData] = useState<Omit<InviteData, 'validFrom' | 'validUntil'>>({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    hostName: '',
    reasonForVisit: '',
    notesForVisitor: '',
    notesForReception: '',
    isAllDay: false
  });

  // NEW: State for actual Date objects
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  // Track which field is focused
  const [focusedField, setFocusedField] = useState<keyof InviteData | 'validFrom' | 'validUntil' | null>(null);
  
  // Bottom sheet state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  // Keep activeDateField to know which date (start or end) the picker is modifying
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

  // Update form fields (excluding dates)
  const updateField = (field: keyof Omit<InviteData, 'validFrom' | 'validUntil'>, value: string | boolean) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update form validation to use TimeService
  const isFormValid = () => {
    console.log('[CreateInviteScreen] Checking form validity...');
    console.log(`[CreateInviteScreen] visitorName: "${inviteData.visitorName}"`);
    console.log(`[CreateInviteScreen] visitorEmail: "${inviteData.visitorEmail}"`);
    console.log(`[CreateInviteScreen] hostName: "${inviteData.hostName}"`);
    console.log(`[CreateInviteScreen] selectedStartDate: ${selectedStartDate?.toISOString() ?? 'null'}`);
    console.log(`[CreateInviteScreen] selectedEndDate: ${selectedEndDate?.toISOString() ?? 'null'}`);

    const hasName = !!inviteData.visitorName && inviteData.visitorName.trim() !== '';
    const hasHost = !!inviteData.hostName && inviteData.hostName.trim() !== '';
    const hasValidFrom = selectedStartDate !== null && TimeService.isValidDate(selectedStartDate);
    const hasValidUntil = selectedEndDate !== null && TimeService.isValidDate(selectedEndDate);
    const datesValid = hasValidFrom && hasValidUntil && selectedStartDate! < selectedEndDate!;

    const isValid = hasName && hasHost && datesValid;
    
    console.log(`[CreateInviteScreen] Form validity result: ${isValid}`);
    return isValid;
  };

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle back button press
  const handleBackPress = () => {
    console.log('[CreateInviteScreen] Back button pressed');
    
    // Use the provided onClose callback if available, otherwise use navigation
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  // Update the handleCreateInvite function
  const handleCreateInvite = async () => {
    console.log('[CreateInviteScreen] ==================== CREATE INVITE START ====================');
    console.log('[CreateInviteScreen] Creating invite with form data:', JSON.stringify(inviteData, null, 2));
    console.log(`[CreateInviteScreen] Start Date: ${selectedStartDate?.toISOString()}`);
    console.log(`[CreateInviteScreen] End Date: ${selectedEndDate?.toISOString()}`);
    console.log(`[CreateInviteScreen] Is All Day: ${inviteData.isAllDay}`);

    // Enhanced Validation: Check specifically for host name
    if (!inviteData.hostName || inviteData.hostName.trim() === '') {
        Alert.alert('Missing Host', 'Please select a host name.');
        console.error('[CreateInviteScreen] Host name validation failed');
        return;
    }

    // Validate the rest of the form
    if (!isFormValid()) {
      // Improved Alert message
      let alertMessage = 'Please ensure:';
      if (!inviteData.visitorName || inviteData.visitorName.trim() === '') {
          alertMessage += '\n - Visitor name is entered.';
      }
      if (!selectedStartDate || !selectedEndDate || selectedStartDate >= selectedEndDate) {
           alertMessage += '\n - Start/end dates are valid and start is before end.';
      }

      Alert.alert('Invalid Form', alertMessage);
      console.error('[CreateInviteScreen] Form validation failed');
      return;
    }

    setIsLoading(true);

    try {
      let finalStartDate: Date;
      let finalEndDate: Date;

      if (inviteData.isAllDay) {
        console.log('[CreateInviteScreen] Adjusting dates for all-day event');
        // Clone dates and set times for all-day
        finalStartDate = new Date(selectedStartDate!);
        finalStartDate.setHours(0, 0, 0, 0);

        finalEndDate = new Date(selectedEndDate!);
        finalEndDate.setHours(23, 59, 59, 999);
      } else {
        // Use the selected dates directly
        finalStartDate = selectedStartDate!;
        finalEndDate = selectedEndDate!;
      }

      // Convert final dates to ISO strings
      const validFromISO = finalStartDate.toISOString();
      const validUntilISO = finalEndDate.toISOString();

      console.log('[CreateInviteScreen] Final ISO dates:');
      console.log(`[CreateInviteScreen] validFrom: ${validFromISO}`);
      console.log(`[CreateInviteScreen] validUntil: ${validUntilISO}`);

      // Create object for InviteService
      const inviteServiceData = {
        visitorName: inviteData.visitorName,
        visitorEmail: inviteData.visitorEmail,
        visitorPhone: inviteData.visitorPhone || "",
        validFrom: validFromISO, // Use ISO string
        validUntil: validUntilISO, // Use ISO string
        hostName: inviteData.hostName,
        reasonForVisit: inviteData.reasonForVisit || "",
        notesForVisitor: inviteData.notesForVisitor || "",
        notesForReception: inviteData.notesForReception || "",
        // status: "pending" // Status is typically set by the service
      };

      console.log('[CreateInviteScreen] Data prepared for InviteService:', inviteServiceData);

      // Create the invite
      const newInvite = await InviteService.createInvite(inviteServiceData);

      console.log('[CreateInviteScreen] Invite created successfully with ID:', newInvite.id);

      // Prepare data for the legacy callback if needed
      const legacyInviteData: InviteData = {
          ...inviteData,
          validFrom: selectedStartDate ? selectedStartDate.toISOString() : '',
          validUntil: selectedEndDate ? selectedEndDate.toISOString() : '',
          isAllDay: inviteData.isAllDay,
      };

      if (onCreateInvite) {
        console.log('[CreateInviteScreen] Calling onCreateInvite callback with:', legacyInviteData);
        onCreateInvite(legacyInviteData);
      }

      // Navigate back to VisitorsScreen with success param
      navigation.navigate('MainTabs', { 
        screen: 'Visitor', // Correct screen name within MainTabs
        params: { inviteCreated: true } // Pass params here
      });

    } catch (error) {
      console.error('[CreateInviteScreen] Error creating invite:', error);
      Alert.alert('Error', 'Failed to create invitation. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('[CreateInviteScreen] ==================== CREATE INVITE END ====================');
    }
  };

  // Log focus changes
  const handleFocus = (field: keyof InviteData | 'validFrom' | 'validUntil') => {
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
  const renderInputField = (
    label: string,
    field: keyof Omit<InviteData, 'validFrom' | 'validUntil'> | 'validFrom' | 'validUntil',
    optional: boolean = false
  ) => {
    const isDateField = field === 'validFrom' || field === 'validUntil';
    const isHostField = field === 'hostName';
    const isMandatory = !optional; // Determine if the field is mandatory
    const labelText = `${label}${optional ? ' (optional)' : ''}`; // Removed asterisk

    // Get value based on field type
    let displayValue: string = '';
    let hasValue: boolean = false;

    if (isDateField) {
        const dateObj = field === 'validFrom' ? selectedStartDate : selectedEndDate;
        if (dateObj) {
            // Use TimeService for formatting display value
            displayValue = TimeService.formatLongDate(dateObj);
            if (!inviteData.isAllDay) {
                 displayValue += `, ${TimeService.formatTime(dateObj)}`;
            }
            hasValue = true;
        } else {
            displayValue = '';
            hasValue = false;
        }
    } else {
        // Type assertion needed here
        displayValue = inviteData[field as keyof typeof inviteData] as string ?? '';
        hasValue = Boolean(displayValue);
    }

    const isFocused = focusedField === field;
    const inputProps = getInputProps();

    const handlePress = () => {
      if (isDateField) {
        setActiveDateField(field as 'validFrom' | 'validUntil');
        setDatePickerVisible(true);
      } else if (isHostField) {
        setEmployeeListVisible(true);
      }
    };

    // Make the entire Host Name row pressable
    if (isHostField) {
      return (
        <View style={{ position: 'relative' }}>
          {/* Wrap the entire field in TouchableOpacity */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused
            ]}
            onPress={handlePress} // Use the generic handlePress
            activeOpacity={0.7}
          >
            {/* Render Label Consistently for Host Field */} 
            {hasValue && (
              <Text style={styles.inputLabel}>
                {labelText} {/* Host Name label - positioned like others */}
              </Text>
            )}
            
            <View style={styles.dateDisplayContainer}>
              {/* Label is removed from here when value exists */} 
              {hasValue ? (
                // Render only the value text here
                <Text style={[styles.dateText, styles.inputWithValue]}>
                  {displayValue}
                </Text>
              ) : (
                // Placeholder remains inside
                <Text style={[styles.dateText, { color: '#B6BDCD' }]}>
                  {labelText} {/* Placeholder text when no value */}
                </Text>
              )}
            </View>
            {/* Chevron remains for visual cue */}
            <ChevronIcon direction="right" width={20} height={20} fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }

    // Keep other fields mostly the same
    return (
      <View style={{position: 'relative'}}>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused
          ]}
          onPress={isDateField ? handlePress : undefined} // Only date fields are pressable here
          activeOpacity={isDateField ? 0.7 : 1}
        >
          {/* Render Label Consistently Outside Specific Containers */} 
          {hasValue && !isDateField && (
            <Text style={styles.inputLabel}>
              {labelText} {/* Standard text input label */}
            </Text>
          )}
          {hasValue && isDateField && (
            <Text style={styles.inputLabel}>
              {labelText} {/* Date field label - positioned like others */}
            </Text>
          )}
          
          {isDateField ? (
            // Date field rendering using Date object
            <View style={styles.dateDisplayContainer}>
              {/* Label is removed from here */} 
              {hasValue ? (
                 // Render only the value text here
                 <Text style={[styles.dateText, styles.inputWithValue]}>
                   {displayValue}
                 </Text>
              ) : (
                 // Placeholder remains inside
                 <Text style={[styles.dateText, {color: '#B6BDCD'}]}>
                   {labelText} {/* Placeholder text when no value */}
                 </Text>
              )}
            </View>
          ) : (
            // Regular input field rendering (label is rendered above)
            <TextInput
              style={[
                styles.input,
                hasValue && styles.inputWithValue
              ]}
              value={displayValue as string}
              onChangeText={(text) => {
                  // Prevent direct editing of Host Name field
                  if (!isDateField && !isHostField) {
                       // Type assertion needed here
                       updateField(field as keyof typeof inviteData, text)
                  }
              }}
              placeholder={!hasValue ? labelText : ''} // Use labelText for placeholder
              placeholderTextColor="#B6BDCD"
              {...inputProps}
              onFocus={() => handleFocus(field)}
              onBlur={handleBlur}
              editable={!isHostField} // Host field is not directly editable
            />
          )}

          {/* Chevron only for Date Fields */} 
          {isDateField && (
            <ChevronIcon direction="right" width={20} height={20} fill="#FFFFFF" />
          )}
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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

        {/* InviteDuration component needs to update Date objects */}
        <InviteDuration 
          visible={datePickerVisible} 
          onClose={() => setDatePickerVisible(false)}
          onSave={handleDatePickerSave} // Consider if save logic needs Date update
          // Pass Date objects and setters instead of inviteData strings
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedStartDate={setSelectedStartDate}
          setSelectedEndDate={setSelectedEndDate}
          isAllDay={inviteData.isAllDay}
          // Pass a function that calls updateField correctly
          setIsAllDay={(value: boolean) => updateField('isAllDay', value)}
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