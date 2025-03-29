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
import { Calendar } from '../screens/CreateInviteScreen'; // Import the Calendar component

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

// Utility function for date formatting
const formatDate = (date: Date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNumber = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
};

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
  const [fromTime, setFromTime] = useState('10:00 AM');
  const [toTime, setToTime] = useState('11:00 AM');
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
  const sheetTitle = activeDateField === 'validFrom' 
    ? 'Invite Duration' 
    : 'Custom Timeframe';

  // Initialize values when the bottom sheet opens
  useEffect(() => {
    if (visible) {
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
      
      // Initialize with empty states - no dates selected by default
      // This matches the Figma design where the calendar shows no selected dates,
      // but displays today's date with a dot underneath it
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setFromTime('10:00 AM');
      setToTime('11:00 AM');
      setIsAllDay(inviteData.isAllDay);
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
  }, [visible, translateY, opacity, pan, inviteData, activeDateField]);

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
        // If clicking the same date again, just clear the end date
        console.log('Clicking same date - clearing end date');
        setSelectedEndDate(null);
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
    
    // Log state after operation (will show previous state due to React state update timing)
    setTimeout(() => {
      console.log('After update - will only be accurate in next render cycle');
    }, 0);
  };
  
  // Format date for display (Jan 21, 2023)
  const formatShortDate = (date: Date | null) => {
    if (!date) return 'Add Date';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  // Handle save
  const handleSave = () => {
    if (!selectedStartDate) return;
    
    let fromDateStr = formatDate(selectedStartDate);
    let toDateStr = selectedEndDate ? formatDate(selectedEndDate) : fromDateStr;
    
    const updatedInviteData = {...inviteData};
    
    if (activeDateField === 'validFrom') {
      updatedInviteData.validFrom = isAllDay ? fromDateStr : `${fromDateStr}, ${fromTime}`;
      // Always update the end date when setting start date for better UX
      updatedInviteData.validUntil = isAllDay ? toDateStr : `${toDateStr}, ${toTime}`;
    } else if (activeDateField === 'validUntil') {
      updatedInviteData.validUntil = isAllDay ? toDateStr : `${toDateStr}, ${toTime}`;
      
      // If start date is empty, also set it
      if (!updatedInviteData.validFrom) {
        const startDateStr = formatDate(selectedStartDate);
        updatedInviteData.validFrom = isAllDay ? startDateStr : `${startDateStr}, ${fromTime}`;
      }
    }
    
    updatedInviteData.isAllDay = isAllDay;
    
    setInviteData(updatedInviteData);
    onSave();
  };
  
  // Render date and time selection with guaranteed text values
  const renderDateTimeSelection = (type: 'from' | 'to') => {
    const isFrom = type === 'from';
    const date = isFrom ? selectedStartDate : selectedEndDate;
    const time = isFrom ? fromTime : toTime;
    const setTime = isFrom ? setFromTime : setToTime;
    
    const timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                          '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    
    // Always have a valid date to display
    const formattedDate = date ? formatShortDate(date) : 'Add Date';
    
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
          <View style={styles.dateChipContainer}>
            <TouchableOpacity style={styles.dateChip}>
              <Text style={{
                fontFamily: 'Outfit-SemiBold',
                fontSize: 14,
                color: '#FFFFFF',
                letterSpacing: 0.2,
                textAlign: 'center',
              }}>
                {formattedDate}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!isAllDay && (
            <View style={styles.timeChipContainer}>
              <TouchableOpacity 
                style={styles.timeChip}
                onPress={() => {
                  const currentIndex = timeOptions.indexOf(time);
                  const nextIndex = (currentIndex + 1) % timeOptions.length;
                  setTime(timeOptions[nextIndex]);
                }}
              >
                <Text style={{
                  fontFamily: 'Outfit-SemiBold',
                  fontSize: 14,
                  color: '#FFFFFF',
                  letterSpacing: 0.2,
                  textAlign: 'center',
                }}>
                  {time}
                </Text>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity onPress={onClose} style={styles.headerButtonLeft}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>{sheetTitle}</Text>
            
            <TouchableOpacity onPress={handleSave} style={styles.headerButtonRight}>
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
                    onValueChange={setIsAllDay}
                  />
                </View>
              </View>
            </View>
            
            {/* Calendar */}
            <View style={styles.calendarWrapper}>
              <Calendar 
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                onDateSelect={handleDateSelect}
              />
            </View>
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
  timeChipContainer: {
    flex: 1,
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
});

export default InviteDuration; 