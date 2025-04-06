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
  TouchableWithoutFeedback
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomToggle from './ui/CustomToggle';
import Calendar from './Calendar'; // Import Calendar from its dedicated file
import DateTimePicker from '@react-native-community/datetimepicker';
import DateService, { isValidDate, parseInviteDate, formatShortDate, formatLongDate, formatInviteDate } from '../services/DateService';
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

interface InviteDurationProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  inviteData: InviteData;
  setInviteData: React.Dispatch<React.SetStateAction<InviteData>>;
  activeDateField: 'validFrom' | 'validUntil' | null;
}

// InviteDuration component
const InviteDuration: React.FC<InviteDurationProps> = ({ 
  visible, 
  onClose,
  onSave, 
  inviteData, 
  setInviteData, 
  activeDateField 
}) => {
  // Height for the bottom sheet
  const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height * 0.9;
  
  // State for date/time selection
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [fromTime, setFromTime] = useState<string | null>(null);
  const [toTime, setToTime] = useState<string | null>(null);
  const [isAllDay, setIsAllDay] = useState(inviteData.isAllDay);
  
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

  // Add missing state variables for time picker visibility
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<'from' | 'to' | null>(null);

  // Add state to track active date chip
  const [activeDateChip, setActiveDateChip] = useState<'from' | 'to' | null>(null);
  
  // Initialize values when the bottom sheet opens
  useEffect(() => {
    if (visible) {
      console.log("========== INITIALIZING INVITE DURATION ==========");
      console.log("ActiveDateField:", activeDateField);
      console.log("InviteData:", JSON.stringify(inviteData, null, 2));
      
      // Reset the pan position
      pan.setValue(0);
      
      // Set initial values for animation
      translateY.setValue(BOTTOM_SHEET_HEIGHT);
      opacity.setValue(0);
      
      // Start animation
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
      
      // Initialize with empty states first to avoid stale data
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setFromTime(null);
      setToTime(null);
      setIsAllDay(inviteData.isAllDay);
      
      // Use setTimeout to ensure the state reset above has completed
      setTimeout(() => {
        // Parse existing date and time values from inviteData if available
        if (inviteData) {
          console.log('INPUT: Raw inviteData:', JSON.stringify(inviteData, null, 2));
          
          // For storing the parsed dates for later reference
          let parsedStartDate: Date | null = null;
          
          // Parse the from date/time using our service
          console.log('PARSING FROM: Starting validFrom parsing');
          if (inviteData.validFrom && inviteData.validFrom.trim() !== '') {
            const { date: fromDate, time: fromTimeValue } = parseInviteDate(inviteData.validFrom);
            
            if (fromDate) {
              console.log('PARSING FROM: Setting start date:', fromDate.toISOString());
              setSelectedStartDate(fromDate);
              parsedStartDate = fromDate; // Store for later reference
            } else {
              console.log('PARSING FROM: No valid date, setting to today');
              const today = new Date();
              setSelectedStartDate(today);
              parsedStartDate = today; // Store for later reference
            }
            
            if (fromTimeValue) {
              console.log('PARSING FROM: Setting from time:', fromTimeValue);
              setFromTime(fromTimeValue);
            }
          } else {
            console.log('PARSING FROM: No validFrom in inviteData, setting to today');
            const today = new Date();
            setSelectedStartDate(today);
            parsedStartDate = today; // Store for later reference
          }
          
          // Parse the until date/time using our service
          console.log('PARSING UNTIL: Starting validUntil parsing');
          if (inviteData.validUntil && inviteData.validUntil.trim() !== '') {
            const { date: untilDate, time: untilTimeValue } = parseInviteDate(inviteData.validUntil);
            
            if (untilDate) {
              console.log('PARSING UNTIL: Setting end date:', untilDate.toISOString());
              setSelectedEndDate(untilDate);
            } else if (parsedStartDate) {
              console.log('PARSING UNTIL: No valid date, using start date');
              setSelectedEndDate(parsedStartDate);
            } else {
              console.log('PARSING UNTIL: No valid date and no start date, setting to today');
              setSelectedEndDate(new Date());
            }
            
            if (untilTimeValue) {
              console.log('PARSING UNTIL: Setting to time:', untilTimeValue);
              setToTime(untilTimeValue);
            }
          } else if (parsedStartDate) {
            console.log('PARSING UNTIL: No validUntil in inviteData, using start date');
            setSelectedEndDate(parsedStartDate);
          } else {
            console.log('PARSING UNTIL: No validUntil in inviteData and no start date, setting to today');
            setSelectedEndDate(new Date());
          }
          
          // Set the initial UI state based on which field was activated
          if (activeDateField === 'validFrom') {
            console.log('Setting activeDateChip to from based on activeDateField');
            setActiveDateChip('from');
          } else if (activeDateField === 'validUntil') {
            console.log('Setting activeDateChip to to based on activeDateField');
            setActiveDateChip('to');
          }
          
          console.log('SETUP: Setting isAllDay to', inviteData.isAllDay);
          setIsAllDay(inviteData.isAllDay);
        }
        
        // Log the state that should be used
        console.log('INITIALIZED STATE:', {
          selectedStartDate: selectedStartDate ? formatShortDate(selectedStartDate) : 'null',
          selectedEndDate: selectedEndDate ? formatShortDate(selectedEndDate) : 'null',
          fromTime,
          toTime,
          isAllDay
        });
      }, 0);
    } else {
      // Animate the bottom sheet down
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
        // Reset pan value after animation is complete
        pan.setValue(0);
      });
    }
  }, [visible, translateY, opacity, pan, inviteData, activeDateField, setInviteData]);

  // Add logging for component props on mount and update
  useEffect(() => {
    if (visible) {
      // Log final state after initialization (using timeout to ensure state is updated)
      setTimeout(() => {
        console.log('FINAL STATE AFTER INIT:', {
          selectedStartDate: selectedStartDate ? formatShortDate(selectedStartDate) : null,
          selectedEndDate: selectedEndDate ? formatShortDate(selectedEndDate) : null,
          fromTime,
          toTime,
          isAllDay
        });
      }, 100);
    }
  }, [visible, selectedStartDate, selectedEndDate, fromTime, toTime, isAllDay]);

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

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    console.log('InviteDuration - handleDateSelect called with:', date.toISOString());
    console.log('Current state - selectedStartDate:', selectedStartDate ? selectedStartDate.toISOString() : 'null');
    console.log('Current state - selectedEndDate:', selectedEndDate ? selectedEndDate.toISOString() : 'null');
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      console.log('Setting as start date and clearing end date');
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      if (date.getTime() === selectedStartDate.getTime()) {
        // If clicking the same date again, keep it as both start and end date
        console.log('Clicking same date - setting as both start and end date');
        setSelectedEndDate(date);
      } else if (date < selectedStartDate) {
        // If selected date is before current start date, swap them
        console.log('Date is before start date - swapping dates');
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        // If selected date is after current start date, set as end date
        console.log('Date is after start date - setting as end date');
        setSelectedEndDate(date);
      }
    }
  };
  
  // Use DateService helper functions
  const getTimePickerDate = () => {
    // Create a date object using the current date
    const now = new Date();
    
    // If activeTimeField is 'from', use fromTime
    if (activeTimeField === 'from' && fromTime) {
      const timeDate = DateService.parseTimeString(fromTime);
      if (timeDate) return timeDate;
    } 
    // If activeTimeField is 'to', use toTime
    else if (activeTimeField === 'to' && toTime) {
      const timeDate = DateService.parseTimeString(toTime);
      if (timeDate) return timeDate;
    }
    
    return now;
  };

  // Log when time is selected
  const handleTimeSelected = (event: any, selectedTime: any) => {
    console.log('Time selected event:', event);
    console.log('Time selected value:', selectedTime);
    
    if (event.type === 'set' && selectedTime) {
      // Format time value to string (e.g., "10:00 AM")
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      const timeString = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      // Update the appropriate time state based on activeTimeField
      if (activeTimeField === 'from') {
        setFromTime(timeString);
      } else if (activeTimeField === 'to') {
        setToTime(timeString);
      }
    }
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
  
  // Add a function to convert dates to all-day format when needed
  const applyAllDayToDate = (date: Date): Date => {
    if (!inviteData.isAllDay) {
      return date; // No changes needed if not all day
    }
    
    console.log('[InviteDuration] Applying all-day format to date:', date.toString());
    
    // If all day is selected and this is the start date, set to beginning of day
    if (activeDateField === 'validFrom') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      console.log('[InviteDuration] Set to start of day:', startOfDay.toString());
      return startOfDay;
    } 
    // If all day is selected and this is the end date, set to end of day
    else if (activeDateField === 'validUntil') {
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      console.log('[InviteDuration] Set to end of day:', endOfDay.toString());
      return endOfDay;
    }
    
    return date;
  };

  // Handle toggle for all-day setting with improved logging
  const handleAllDayToggle = (newValue: boolean) => {
    console.log(`[InviteDuration] === All-day toggled: ${newValue} ===`);
    console.log('[InviteDuration] Current state:', {
      isAllDay,
      selectedStartDate: selectedStartDate?.toString() || 'null',
      selectedEndDate: selectedEndDate?.toString() || 'null', 
      fromTime,
      toTime
    });
    
    setIsAllDay(newValue);
    
    // Immediately update parent component's state as well
    // This ensures the all-day flag is updated in the parent even if save is not clicked
    setInviteData(prev => ({
      ...prev,
      isAllDay: newValue
    }));
    
    // If all-day is enabled, immediately adjust the times
    if (newValue && selectedStartDate && selectedEndDate) {
      console.log('[InviteDuration] Adjusting times for all-day event');
      
      // Create start and end dates with appropriate times
      const startOfDay = new Date(selectedStartDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedEndDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log('[InviteDuration] Adjusted times:', {
        startOfDay: startOfDay.toString(),
        endOfDay: endOfDay.toString()
      });
      
      // Update the UI state
      setSelectedStartDate(startOfDay);
      setSelectedEndDate(endOfDay);
      
      // Set specific times for all-day events
      setFromTime('12:00 AM');
      setToTime('11:59 PM');
      
      // Format the dates for the parent component
      const formattedStartDate = formatInviteDate(startOfDay, '12:00 AM', true);
      const formattedEndDate = formatInviteDate(endOfDay, '11:59 PM', true);
      
      console.log('[InviteDuration] Formatted all-day dates:', {
        formattedStartDate,
        formattedEndDate
      });
      
      // Update the parent component's state
      setInviteData(prev => ({
        ...prev,
        isAllDay: newValue,
        validFrom: formattedStartDate,
        validUntil: formattedEndDate
      }));
    }
  };

  // Modify the handleSave function to apply all-day logic
  const handleSave = () => {
    console.log('[InviteDuration] Saving date selection...');
    console.log(`[InviteDuration] Active field: ${activeDateField}`);
    
    if (!selectedStartDate || !selectedEndDate) {
      console.warn('[InviteDuration] No date selected, using current date');
      return;
    }
    
    try {
      // Apply all-day logic if needed
      const adjustedStartDate = applyAllDayToDate(selectedStartDate);
      const adjustedEndDate = applyAllDayToDate(selectedEndDate);
      
      // Format the dates
      const formattedStartDate = formatInviteDate(adjustedStartDate, fromTime, isAllDay);
      const formattedEndDate = formatInviteDate(adjustedEndDate, toTime, isAllDay);
      
      // Update state
      setInviteData(prev => ({
        ...prev,
        validFrom: formattedStartDate,
        validUntil: formattedEndDate
      }));
      
      console.log('[InviteDuration] Dates updated for all-day event');
    } catch (error) {
      console.error('[InviteDuration] Error saving date:', error);
    }
    
    // Close the duration picker
    onSave();
  };

  // Use DateService for rendering date/time selection
  const renderDateTimeSelection = (type: 'from' | 'to') => {
    const isFrom = type === 'from';
    const date = isFrom ? selectedStartDate : selectedEndDate;
    const time = isFrom ? fromTime : toTime;
    
    // Active state detection (only one can be active at a time)
    const isTimeActive = activeTimeField === type;
    const isDateActive = activeDateChip === type;
    
    // Data presence detection
    const hasDateData = isValidDate(date);
    const hasTimeData = time !== null && time.length > 0;
    
    // Calculate which chip should be highlighted with blue (can only be one per row)
    const highlightDateChip = isDateActive || (!isTimeActive && hasDateData);
    const highlightTimeChip = isTimeActive || (!isDateActive && !highlightDateChip && hasTimeData);
    
    // Always have a valid date to display
    const formattedDate = formatShortDate(date);
    
    // Debug logging for chip state
    console.log(`RENDER ${isFrom ? 'FROM' : 'TO'} CHIP:`);
    console.log(`- Date: ${date ? date.toISOString() : 'null'}, formatted: ${formattedDate}`);
    console.log(`- Time: ${time || 'null'}`);
    console.log(`- isDateActive: ${isDateActive}, isTimeActive: ${isTimeActive}`);
    console.log(`- hasDateData: ${hasDateData}, hasTimeData: ${hasTimeData}`);
    console.log(`- highlightDateChip: ${highlightDateChip}, highlightTimeChip: ${highlightTimeChip}`);
    
    return (
      <View style={[
        styles.dateTimeSelectionRow
      ]}>
        <Text style={{
          fontFamily: 'Outfit-Medium',
          fontSize: 16,
          color: '#FFFFFF',
          fontWeight: '600',
          width: 100,
        }}>
          {isFrom ? 'Valid From' : 'Valid Until'}
        </Text>
        
        <View style={styles.dateTimeChips}>
          <TouchableOpacity 
            style={[
              styles.dateChip,
              highlightDateChip && {
                backgroundColor: '#23262D',
                borderColor: '#6FDCFA'
              }
            ]}
            onPress={() => handleDateChipPress(isFrom ? 'from' : 'to')}
          >
            <Text style={{
              fontFamily: 'Outfit-SemiBold',
              fontSize: 14,
              color: highlightDateChip ? '#6FDCFA' : '#FFFFFF',
              letterSpacing: 0.2,
              textAlign: 'center',
            }}>
              {formattedDate}
            </Text>
          </TouchableOpacity>
          
          {!isAllDay && (
            <TouchableOpacity 
              style={[
                styles.timeChip,
                highlightTimeChip && {
                  backgroundColor: '#23262D',
                  borderColor: '#6FDCFA',
                }
              ]}
              onPress={() => handleTimeChipPress(isFrom ? 'from' : 'to')}
            >
              <Text style={{
                fontFamily: 'Outfit-SemiBold',
                fontSize: 14,
                color: highlightTimeChip ? '#6FDCFA' : '#FFFFFF',
                letterSpacing: 0.2,
                textAlign: 'center',
              }}>
                {time || 'Add Time'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
          <View style={styles.bottomSheetHeader}>
            <TouchableOpacity 
              onPress={() => {
                // If time picker is visible, go back to calendar view
                if (isTimePickerVisible) {
                  setIsTimePickerVisible(false);
                  setActiveTimeField(null);
                } else {
                  onClose();
                }
              }} 
              style={styles.headerButtonLeft}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>{getSheetTitle()}</Text>
            
            <TouchableOpacity 
              onPress={() => {
                handleSave();
              }} 
              style={styles.headerButtonRight}
            >
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
                    value={getTimePickerDate()}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeSelected}
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
    backgroundColor: '#6FDCFA',
    borderColor: '#6FDCFA',
  },
});

export default InviteDuration; 