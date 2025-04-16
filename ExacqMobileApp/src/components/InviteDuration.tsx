import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomToggle from './ui/CustomToggle';
import Calendar from './Calendar'; // Import Calendar from its dedicated file
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import TimeService from '../services/TimeService';

// Define types
export interface InviteData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  validFrom: string;
  validUntil: string;
  hostName: string;
  reasonForVisit?: string;
  notesForVisitor?: string;
  notesForReception?: string;
  isAllDay: boolean;
}

// Define props for the component using Date objects
export interface InviteDurationProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  setSelectedStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setSelectedEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  isAllDay: boolean;
  setIsAllDay: React.Dispatch<React.SetStateAction<boolean>>;
  activeDateField: 'validFrom' | 'validUntil' | null;
}

// InviteDuration component
const InviteDuration: React.FC<InviteDurationProps> = ({ 
  visible, 
  onClose,
  onSave, 
  selectedStartDate,
  selectedEndDate,
  setSelectedStartDate,
  setSelectedEndDate,
  isAllDay,
  setIsAllDay,
  activeDateField 
}) => {
  // Height for the bottom sheet
  const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height * 0.9;
  
  // State for UI within the bottom sheet
  const [currentDateUI, setCurrentDateUI] = useState<Date>(new Date()); // Date shown in calendar
  const [startTimeUI, setStartTimeUI] = useState<string>('9:00 AM'); // Time shown in start time chip/picker
  const [endTimeUI, setEndTimeUI] = useState<string>('5:00 PM'); // Time shown in end time chip/picker
  // isAllDay is controlled by parent via props

  // State for component interaction logic
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<'from' | 'to' | null>(null);
  const [activeDateChip, setActiveDateChip] = useState<'from' | 'to' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initial setup
  
  // Animation values for bottomsheet
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Values for swipe-down-to-close
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  
  // Title for the bottom sheet
  const getSheetTitle = () => {
    return activeDateField === 'validFrom' 
      ? 'Invite Duration' 
      : 'Custom Timeframe';
  };

  // Effect to handle animations and state initialization based ONLY on visibility change
  useEffect(() => {
    if (visible) {
      // --- OPENING --- 
      if (!isInitialized) { // Only run initialization once when opening
          console.log("========== INITIALIZING INVITE DURATION (First Open) ==========");
      console.log("ActiveDateField:", activeDateField);
          console.log("SelectedStartDate (prop):", selectedStartDate ? selectedStartDate.toISOString() : 'null');
          console.log("SelectedEndDate (prop):", selectedEndDate ? selectedEndDate.toISOString() : 'null');
          console.log("IsAllDay (prop):", isAllDay);

          // Determine the initial date to show in the calendar
          const initialDateToShow = activeDateField === 'validFrom' 
              ? selectedStartDate 
              : activeDateField === 'validUntil' 
                  ? selectedEndDate 
                  : selectedStartDate; // Default to start date if no specific field active
          setCurrentDateUI(initialDateToShow || new Date());

          // Set initial time strings based on props
          setStartTimeUI(TimeService.formatTime(selectedStartDate) || '9:00 AM');
          setEndTimeUI(TimeService.formatTime(selectedEndDate) || '5:00 PM');
          
          // Set initial active chip based on which field opened the sheet
          setActiveDateChip(activeDateField === 'validFrom' ? 'from' : activeDateField === 'validUntil' ? 'to' : null);
          setActiveTimeField(null); 
          setIsTimePickerVisible(false); 

          console.log('INITIALIZED UI STATE:', {
            currentDateUI: currentDateUI.toString(),
            startTimeUI,
            endTimeUI,
            activeDateChip,
          });
          setIsInitialized(true); // Mark as initialized
      }

      // Run opening animation regardless of initialization state (if not already open)
      pan.setValue(0); 
      translateY.setValue(BOTTOM_SHEET_HEIGHT); // Ensure it starts from bottom
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
          restSpeedThreshold: 0.5,
          restDisplacementThreshold: 0.5,
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
            } else {
      // --- CLOSING --- 
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          useNativeDriver: true,
          tension: 65,
          friction: 12,
          restSpeedThreshold: 0.5,
          restDisplacementThreshold: 0.5,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        pan.setValue(0);
        setIsInitialized(false); // Reset initialization state when closed
      });
    }
  }, [visible]);

  // Add logging for component props on mount and update
  useEffect(() => {
    if (visible) {
      // Log final state after initialization (using timeout to ensure state is updated)
      setTimeout(() => {
        console.log('FINAL STATE AFTER INIT:', {
          currentDate: currentDateUI ? TimeService.formatTime(currentDateUI) : null,
          startTime: startTimeUI,
          endTime: endTimeUI,
          isAllDay
        });
      }, 100);
    }
  }, [visible, currentDateUI, startTimeUI, endTimeUI, isAllDay]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);
  
  // Create a more aggressive panResponder for the drag handle
  const headerPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDraggingHeader(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingHeader(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          Animated.spring(translateY, {
            toValue: BOTTOM_SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
            restSpeedThreshold: 0.5, 
            restDisplacementThreshold: 0.5,
          }).start();
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingHeader(false);
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    });
  }, [pan, onClose, dismissThreshold]);

  // Create a less aggressive panResponder for the main content
  const mainPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isDraggingDown && gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          Animated.spring(translateY, {
            toValue: BOTTOM_SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    });
  }, [pan, onClose, dismissThreshold, isDraggingDown]);

  // Combine a date part (from calendar) and time part (from string H:MM AM/PM)
  const combineDateTime = (datePart: Date | null, timeStr: string | null): Date | null => {
    if (!datePart) return null; 
    const newDate = new Date(datePart); // Clone the date part
    const timePart = TimeService.parseTimeString(timeStr);
    if (timePart && TimeService.isValidDate(timePart)) {
      // Set time component from the parsed time string
      newDate.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
    } else {
      // If timeStr is invalid/null, ensure the date part's time is reset (e.g., to 00:00)
      // Or keep the date part's original time if that's intended when only date is picked.
      // Let's reset to midnight for clarity when combining just a date.
      if (!timeStr) { // Only reset if time string was explicitly null/empty
           newDate.setHours(0, 0, 0, 0);
      }
    }
    return newDate;
  };

  // Handle date selection from Calendar
  const handleDateSelect = (selectedCalDate: Date) => {
    console.log('[InviteDuration] Calendar date selected:', selectedCalDate.toISOString());
    setCurrentDateUI(selectedCalDate); // Update internal UI state for calendar display

    const newTimeForStartDate = startTimeUI;
    const newTimeForEndDate = endTimeUI;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Case 1 & 3: No start date OR both dates already selected -> Start new selection
        console.log('[InviteDuration] Setting start date.');
        const newStartDate = combineDateTime(selectedCalDate, newTimeForStartDate);
        if(newStartDate){
            setSelectedStartDate(newStartDate);
            setSelectedEndDate(null); // Clear end date
            setActiveDateChip('from'); // Keep 'from' chip active potentially
        }
    } else {
        // Case 2: Start date exists, no end date -> Set end date
        console.log('[InviteDuration] Setting end date.');
        let newEndDate = combineDateTime(selectedCalDate, newTimeForEndDate);
        
        if (newEndDate && selectedStartDate < newEndDate) {
             // Valid end date selected
             setSelectedEndDate(newEndDate);
             setActiveDateChip('to'); // Activate 'to' chip
        } else if (newEndDate) {
            // End date is same or before start date - make selected date the new start date
            console.log('[InviteDuration] End date <= Start date. Setting selected date as new start.');
            const newStartDate = combineDateTime(selectedCalDate, newTimeForStartDate); 
            if(newStartDate){
                 setSelectedStartDate(newStartDate);
                 setSelectedEndDate(null); // Clear end date
                 setActiveDateChip('from');
            }
        }
    }
  };
  
  // Handle start time selection (from chip or picker)
  const handleStartTimeSelect = (time: string) => {
    console.log('[InviteDuration] Start time selected:', time);
    setStartTimeUI(time); // Update internal UI state
    
    // Combine with the *selectedStartDate* (or currentDateUI if start not set yet)
    const baseDate = selectedStartDate || currentDateUI;
    const newStartDate = combineDateTime(baseDate, time);

    if (newStartDate && TimeService.isValidDate(newStartDate)) {
      setSelectedStartDate(newStartDate);
      // Auto-adjust EndDate if necessary
      if (selectedEndDate && newStartDate >= selectedEndDate) {
        const adjustedEndDate = TimeService.addHours(newStartDate, 1);
        setSelectedEndDate(adjustedEndDate);
        setEndTimeUI(TimeService.formatTime(adjustedEndDate));
      }
    }
  };

  // Handle end time selection (from chip or picker)
  const handleEndTimeSelect = (time: string) => {
    console.log('[InviteDuration] End time selected:', time);
    setEndTimeUI(time); // Update internal UI state

    // Combine with the *selectedEndDate* (or currentDateUI if end not set yet)
    const baseDate = selectedEndDate || currentDateUI;
    const newEndDate = combineDateTime(baseDate, time);

    if (newEndDate && TimeService.isValidDate(newEndDate)) {
      setSelectedEndDate(newEndDate);
      // Auto-adjust StartDate if necessary
      if (selectedStartDate && newEndDate <= selectedStartDate) {
        const adjustedStartDate = TimeService.addHours(newEndDate, -1);
        setSelectedStartDate(adjustedStartDate);
        setStartTimeUI(TimeService.formatTime(adjustedStartDate));
      }
    }
  };

  // NEW: Handler for the actual DateTimePicker onChange event
  const handleTimePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      console.log('[InviteDuration] DateTimePicker time set:', selectedDate);
      const timeString = TimeService.formatTime(selectedDate);
      
      if (activeTimeField === 'from') {
        handleStartTimeSelect(timeString);
      } else if (activeTimeField === 'to') {
        handleEndTimeSelect(timeString);
      }
    } else {
      console.log('[InviteDuration] DateTimePicker event dismissed or no date selected.');
    }
    // Optionally hide the picker after selection, depending on desired UX
    // setIsTimePickerVisible(false); 
    // setActiveTimeField(null);
  };

  // Handle save action - Simplified: Validate props directly
  const handleSave = () => {
    console.log('[InviteDuration] Saving duration...');

    // Validate the dates stored in the parent state (props)
    if (selectedStartDate && TimeService.isValidDate(selectedStartDate) && 
        selectedEndDate && TimeService.isValidDate(selectedEndDate)) {
          
          if (selectedStartDate < selectedEndDate) {
              console.log(`[InviteDuration] Final Start (on save): ${selectedStartDate.toISOString()}`);
              console.log(`[InviteDuration] Final End (on save): ${selectedEndDate.toISOString()}`);
              onSave(); // Call the parent's save handler
          } else {
              console.error('[InviteDuration] Invalid date range on save attempt (start >= end).');
              Alert.alert("Invalid Date Range", "Start date/time must be before end date/time.");
          }
    } else {
        console.error('[InviteDuration] Invalid start or end date props on save attempt.');
        Alert.alert("Invalid Dates", "Please select valid start and end dates.");
    }
  };

  // Handle all-day toggle
  const handleAllDayToggle = (value: boolean) => {
    console.log('[InviteDuration] All-day toggled:', value);
    setIsAllDay(value); // Update state in parent component
  };

  // Render the date/time selection chips
  const renderDateTimeSelection = (type: 'from' | 'to') => {
    const isFrom = type === 'from';
    const date = isFrom ? selectedStartDate : selectedEndDate; // Use props for display
    const time = isFrom ? startTimeUI : endTimeUI; // Use internal UI state for time chip
    
    const isTimeActive = activeTimeField === type;
    const isDateActive = activeDateChip === type;
    
    const hasDateData = TimeService.isValidDate(date);
    
    // Highlight logic: Highlight if it's the active chip
    const highlightDateChip = isDateActive;
    const highlightTimeChip = isTimeActive;
    
    // Use MEDIUM date format for date chip, ensure non-null assertion is safe
    const formattedDate = hasDateData ? TimeService.formatMediumDate(date!) : 'Add Date'; 
    const formattedTime = time || 'Add Time';
    
    // Debug logging for chip state
    console.log(`RENDER ${isFrom ? 'FROM' : 'TO'} CHIP:`);
    console.log(`- Date: ${date ? date.toISOString() : 'null'}, formatted: ${formattedDate}`);
    console.log(`- Time: ${time || 'null'}`);
    console.log(`- isDateActive: ${isDateActive}, isTimeActive: ${isTimeActive}`);
    console.log(`- hasDateData: ${hasDateData}, hasTimeData: ${time !== null && time.length > 0}`);
    console.log(`- highlightDateChip: ${highlightDateChip}, highlightTimeChip: ${highlightTimeChip}`);
    
    return (
      <View style={[styles.dateTimeSelectionRow]}>
        <Text style={styles.dateTimeLabel}>
          {isFrom ? 'Valid From' : 'Valid Until'}
        </Text>
        <View style={styles.dateTimeChips}>
          <TouchableOpacity 
            style={[styles.dateChip, highlightDateChip && styles.activeChip ]}
            onPress={() => handleDateChipPress(isFrom ? 'from' : 'to')}
          >
            <Text style={[styles.chipText, highlightDateChip && styles.activeChipText]}>
              {formattedDate}
            </Text>
          </TouchableOpacity>
          {!isAllDay && (
            <TouchableOpacity 
              style={[styles.timeChip, highlightTimeChip && styles.activeChip ]}
              onPress={() => handleTimeChipPress(isFrom ? 'from' : 'to')}
            >
              <Text style={[styles.chipText, highlightTimeChip && styles.activeChipText]}>
                {formattedTime}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Additional logging for chip press handlers
  const handleDateChipPress = (type: 'from' | 'to') => {
    console.log(`===== DATE CHIP PRESSED: ${type} =====`);
    console.log('Before state change:', {
      isTimePickerVisible,
      activeTimeField,
      activeDateChip
    });
    
    // If time picker is visible, close it to show calendar instead
    if (isTimePickerVisible) {
      console.log('Closing time picker to show calendar');
      setIsTimePickerVisible(false);
      setActiveTimeField(null);
    }
    
    // Toggle the active date chip
    if (activeDateChip === type) {
      console.log(`Deactivating ${type} date chip`);
      setActiveDateChip(null);
    } else {
      console.log(`Activating ${type} date chip and deactivating time`);
      setActiveDateChip(type);
      setActiveTimeField(null); // Deactivate time chip when date chip is active
    }
  };

  // Additional logging for time chip press
  const handleTimeChipPress = (type: 'from' | 'to') => {
    console.log(`===== TIME CHIP PRESSED: ${type} =====`);
    console.log('Before state change:', {
      isTimePickerVisible,
      activeTimeField,
      activeDateChip
    });
    
    // If already showing this field's time picker, toggle it off
    if (isTimePickerVisible && activeTimeField === type) {
      console.log('Closing time picker - same chip clicked again');
      setIsTimePickerVisible(false);
      setActiveTimeField(null);
    } else {
      // Otherwise, show the time picker for this field
      console.log(`Opening time picker for ${type} and deactivating date`);
      setActiveTimeField(type);
      setIsTimePickerVisible(true);
      setActiveDateChip(null); // Deactivate date chip when time chip is active
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={[styles.bottomSheetOverlay, { opacity }]}>
          <StatusBar style="light" />
        </Animated.View>
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.bottomSheetContainer,
          {
            transform: [
              { translateY: Animated.add(translateY, pan) }
            ]
          }
        ]}
      >
        {/* Drag handle with aggressive pan responder */}
        <View 
          style={styles.handleContainer}
          {...headerPanResponder.panHandlers}
        >
          <View style={styles.handle} />
        </View>
        
        {/* The rest of the bottom sheet with a separate pan responder */}
        <View 
          style={{ flex: 1 }}
          {...mainPanResponder.panHandlers}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButtonLeft} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.titleText}>{getSheetTitle()}</Text>
            <TouchableOpacity style={styles.headerButtonRight} onPress={handleSave}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.bottomSheetScrollContent}
            contentContainerStyle={styles.bottomSheetScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Time Selection */}
            <View style={styles.dateTimeSelectionContainer}>
              {renderDateTimeSelection('from')}
              {renderDateTimeSelection('to')}
              
              {/* All Day Toggle */}
              <View style={[styles.dateTimeSelectionRow, styles.dateTimeSelectionRowWithBorder]}>
                <Text style={{
                  fontFamily: 'Outfit-Medium',
                  fontSize: 16,
                  color: '#FFFFFF',
                  fontWeight: '600',
                  width: 100,
                }}>
                  All Day
                </Text>
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <CustomToggle
                    value={isAllDay}
                    onValueChange={handleAllDayToggle}
                  />
                </View>
              </View>
            </View>
            
            {/* Show either Calendar or Time Picker, not both */}
            {isTimePickerVisible ? (
              <View style={styles.timePickerWrapper}>
                <View style={styles.timePickerCard}>
                  <DateTimePicker
                    value={currentDateUI}
                    mode="time"
                    display="spinner"
                    onChange={handleTimePickerChange}
                    style={styles.iosTimePicker}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                    accentColor="#6FDCFA"
                    minuteInterval={1}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.calendarWrapper}>
                <Calendar 
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  onDateSelect={handleDateSelect}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
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
    height: Dimensions.get('window').height * 0.9,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8, // Keep some padding below title
    paddingTop: 4, // Reduce top padding slightly
    marginBottom: 20, // Add spacing below header
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
  titleText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
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
    color: '#6FDCFA',
    textAlign: 'right',
  },
  bottomSheetScrollContent: {
    flex: 1,
    width: '100%',
  },
  bottomSheetScrollContainer: {
    paddingBottom: 24,
  },
  
  // All Day & Date/Time Selection Styles
  allDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    marginBottom: 0,
  },
  allDayText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  toggleWrapper: {
    margin: 0,
    padding: 0,
    marginRight: -8,
    marginTop: -8,
    marginBottom: -8,
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
  dateTimeSelectionRowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  dateTimeChips: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    flex: 1,
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
  timeChip: {
    flex: 1,
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
  calendarWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  allDaySelectionRow: {
    marginTop: 8,
  },
  allDayToggleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timePickerCard: {
    width: '100%',
    backgroundColor: '#404759',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosTimePicker: {
    width: '100%',
    height: 215,
    backgroundColor: 'transparent',
  },
  timePickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 8,
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: '#6FDCFA',
    textAlign: 'left',
  },
  selectionBarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 42,
    marginTop: -21,
    backgroundColor: '#2E333D',
    zIndex: 1,
  },
  activeChip: {
    backgroundColor: '#23262D',
    borderColor: '#6FDCFA',
  },
  chipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  activeChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#6FDCFA',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  dateTimeLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    width: 100,
  },
});

export default InviteDuration; 