import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  PanResponder,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import SearchIcon from '../components/icons/SearchIcon';

// Define types
interface Employee {
  id: string;
  name: string;
  avatar?: string; // Optional avatar URL
  department?: string; // Optional department/title
}

interface SelectHostBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (employee: Employee) => void;
  employees: Employee[];
}

// Chevron Left Icon for the close button
const ChevronLeftIcon = ({ size = 16, color = '#6FDCFA' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path 
        d="M9.5 13L3.5 7L9.5 1" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

// SVG content for search close icon
const searchCloseIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="close">
<path id="Icon" d="M4.8496 12L4 11.1504L7.1504 8L4 4.8496L4.8496 4L8 7.1504L11.1504 4L12 4.8496L8.8496 8L12 11.1504L11.1504 12L8 8.8496L4.8496 12Z" fill="white"/>
</g>
</svg>`;

const SelectHostBottomSheet: React.FC<SelectHostBottomSheetProps> = ({
  visible,
  employees,
  onClose,
  onSelect
}) => {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Values for swipe-down-to-close
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Add search functionality
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Filter employees based on search text
  const filteredEmployees = useMemo(() => {
    if (!searchText.trim()) return employees;
    
    const searchLower = searchText.toLowerCase().trim();
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchLower) || 
      (employee.department && employee.department.toLowerCase().includes(searchLower))
    );
  }, [employees, searchText]);

  // Handler for search text change
  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  // Handler for clearing search
  const handleClearSearch = () => {
    setSearchText('');
  };

  // Function to determine which search icon state to show
  const getSearchIconColor = () => {
    if (isFocused) {
      return "#6FDCFA"; // Blue icon when focused
    }
    return "#959DB2"; // Gray icon otherwise
  };

  // Function to get placeholder text color based on focus state
  const getPlaceholderColor = () => {
    if (isFocused) {
      return "#FFFFFF"; // White when focused
    }
    return "#B6BDCD"; // Gray when not focused
  };

  useEffect(() => {
    // Only log in dev mode
    if (__DEV__) console.log('[SelectHostBottomSheet] Effect triggered with visible:', visible);
    if (visible) {
      // Reset the pan position
      pan.setValue(0);
      
      // Reset search text and focus when opening
      setSearchText('');
      setIsFocused(false);
      
      // Animate the bottom sheet up with improved animation settings
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,      // Less bouncy
          friction: 10,     // More damping
          restSpeedThreshold: 0.5, // Settle faster
          restDisplacementThreshold: 0.5, // Settle faster
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate the bottom sheet down with smoother animation
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
        // Only reset pan value after animation is complete
        pan.setValue(0);
      });
    }
  }, [visible, translateY, opacity, pan]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);
  
  // Create a more aggressive panResponder for the drag handle
  const headerPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[SelectHostBottomSheet] Header pan responder granted');
        setIsDraggingHeader(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[SelectHostBottomSheet] Header released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingHeader(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[SelectHostBottomSheet] Header dismissing');
          // Use a smoother animation when dismissing
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
            // Reset pan after complete
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[SelectHostBottomSheet] Header snapping back');
          // Snap back with improved animation
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
        // Only respond to significant downward movement when not scrolling
        return !isDraggingDown && gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[SelectHostBottomSheet] Main pan responder granted');
        setIsDraggingDown(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[SelectHostBottomSheet] Main released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingDown(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[SelectHostBottomSheet] Main dismissing');
          // Use a smoother animation when dismissing
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
            // Reset pan after complete
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[SelectHostBottomSheet] Main snapping back');
          // Snap back with improved animation
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

  const handleSelectEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee.id);
    onSelect(employee);
  }, [onSelect]);

  const renderEmployeeItem = (employee: Employee, index: number, array: Employee[]) => {
    const isSelected = selectedEmployee === employee.id;
    const isLastItem = index === array.length - 1;
    
    return (
      <View key={employee.id}>
        <TouchableOpacity
          style={[
            styles.employeeItem,
            isSelected && styles.employeeItemSelected
          ]}
          onPress={() => handleSelectEmployee(employee)}
          activeOpacity={0.7}
        >
          <View style={styles.employeeAvatarContainer}>
            {employee.avatar ? (
              <Image 
                source={{ uri: employee.avatar }} 
                style={styles.employeeAvatar} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.employeeAvatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {employee.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.employeeDetails}>
            <Text 
              style={styles.employeeName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {employee.name}
            </Text>
            
            {employee.department && (
              <Text 
                style={styles.employeeDepartment}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {employee.department}
              </Text>
            )}
          </View>
          
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <Circle cx="9" cy="9" r="9" fill="#6FDCFA" />
                <Path 
                  d="M6 9L8 11L12 7" 
                  stroke="#1A1D24" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </TouchableOpacity>
        {!isLastItem && <View style={styles.separatorLine} />}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <StatusBar translucent backgroundColor="rgba(19, 21, 21, 0.65)" />
        </Animated.View>
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.bottomSheet,
          { 
            transform: [
              { translateY: Animated.add(translateY, pan) }
            ] 
          }
        ]}
      >
        {/* Drag handle with aggressive pan responder */}
        <View 
          style={styles.dragBarContainer}
          {...headerPanResponder.panHandlers}
        >
          <View style={styles.dragBar} />
        </View>
        
        {/* The rest of the bottom sheet with a separate pan responder */}
        <View 
          style={{ flex: 1 }}
          {...mainPanResponder.panHandlers}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <Text 
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Select Host
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Add search bar */}
          <View style={styles.searchContainer}>
            <View style={[
              styles.searchInputContainer,
              isFocused && styles.searchInputContainerFocused
            ]}>
              <SearchIcon 
                width={24} 
                height={24} 
                fill={getSearchIconColor()} 
              />
              <View style={styles.textInputWrapper}>
                <Text style={[
                  styles.placeholderText, 
                  searchText.length > 0 && styles.hidden,
                  isFocused && styles.placeholderFocused
                ]}>
                  Search
                </Text>
                <TextInput
                  style={[
                    styles.searchInput,
                    isFocused && styles.searchInputFocused
                  ]}
                  value={searchText}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  selectionColor="#6FDCFA"
                  placeholder=""
                />
              </View>
              {isFocused && searchText.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={handleClearSearch}
                  activeOpacity={0.7}
                >
                  <SvgXml xml={searchCloseIconSvg} width={16} height={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => setIsDraggingDown(false)}
          >
            {filteredEmployees.map((employee, index, array) => 
              renderEmployeeItem(employee, index, array)
            )}
            
            {filteredEmployees.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No employees found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19, 21, 21, 0.95)',
    zIndex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#23262D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  dragBarContainer: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  dragBar: {
    width: 36,
    height: 4,
    backgroundColor: '#404759',
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 100,
  },
  closeText: {
    fontSize: 14,
    color: '#FF5F5F',
    fontFamily: 'Outfit-Medium',
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: 'Outfit-Medium',
    fontWeight: '500',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 100,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#2E333D',
    borderRadius: 48,
    height: 48,
  },
  searchInputContainerFocused: {
    // No border styling here
  },
  textInputWrapper: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  placeholderText: {
    position: 'absolute',
    color: '#B6BDCD',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    paddingHorizontal: 0,
    left: 0,
    zIndex: 1,
  },
  placeholderFocused: {
    color: '#FFFFFF',
  },
  hidden: {
    opacity: 0,
  },
  searchInput: {
    flex: 1,
    color: '#B6BDCD',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    padding: 0,
    margin: 0,
    minHeight: 48,
    zIndex: 2,
  },
  searchInputFocused: {
    color: '#FFFFFF',
  },
  clearButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noResultsText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#717C98',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 20,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    borderRadius: 0,
    marginVertical: 4,
    backgroundColor: '#23262D',
    borderWidth: 0,
  },
  employeeItemSelected: {
    backgroundColor: '#23262D',
  },
  employeeAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  employeeAvatarPlaceholder: {
    backgroundColor: '#404759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Outfit-Medium',
  },
  employeeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  employeeName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  employeeDepartment: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: '#717C98',
  },
  selectedIndicator: {
    marginRight: 0,
    width: 20,
    height: 20,
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    marginHorizontal: 16,
  },
});

export default SelectHostBottomSheet; 