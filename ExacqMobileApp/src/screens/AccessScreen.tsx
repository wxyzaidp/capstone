import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator, 
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../design-system';
import AccessTopBar from '../components/AccessTopBar';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import SearchIcon from '../components/icons/SearchIcon';
import ChevronIcon from '../components/icons/ChevronIcon';
import CloseIcon from '../components/icons/CloseIcon';
import LocationBottomSheet from '../components/LocationBottomSheet';
import { 
  LockIcon
} from '../components/icons/DoorIcons';
import DoorIcon from '../components/icons/DoorIcon';
import IsolatedSwipeButtonComp from '../components/IsolatedSwipeButton';
import Toast from '../components/Toast';
import DoorBottomSheet from '../components/DoorBottomSheet';
import DoorTimerService, { DoorTimerEvents } from '../services/DoorTimerService';
import SwipeUnlock from '../components/SwipeUnlock';

// Types
type DoorStatus = 'Locked' | 'Unlocked' | 'Restricted' | 'Disabled';

interface DoorAccess {
  id: string;
  name: string;
  status: DoorStatus;
  isFavorite?: boolean;
  accessRequested?: boolean;
  showAlerts?: boolean;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

// Sample door data
const doorData: DoorAccess[] = [
  {
    id: '1',
    name: 'Main Entrance',
    status: 'Locked',
    isFavorite: true,
    accessRequested: false
  },
  {
    id: '2',
    name: 'Server Room',
    status: 'Locked',
    isFavorite: true,
    accessRequested: false
  },
  {
    id: '3',
    name: 'Conference Room A',
    status: 'Restricted',
    isFavorite: true,
    accessRequested: false
  },
  {
    id: '4',
    name: 'Executive Suite',
    status: 'Disabled',
    isFavorite: true,
    accessRequested: false
  },
  {
    id: '5',
    name: 'Cafeteria',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '6',
    name: 'Parking Garage',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '7',
    name: 'Storage Area',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '8',
    name: 'IT Office',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '9',
    name: 'Rooftop Access',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '10',
    name: 'Training Room',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '11',
    name: 'Lobby Entrance',
    status: 'Locked',
    isFavorite: false,
    accessRequested: false
  },
  {
    id: '12',
    name: 'Supply Closet',
    status: 'Restricted',
    isFavorite: false,
    accessRequested: false
  }
];

// Sample location data
const locationData: Location[] = [
  {
    id: '1',
    name: 'Indianapolis HQ',
    address: '101 W Washington St, Indianapolis, IN 46204'
  },
  {
    id: '2',
    name: 'Chicago Office',
    address: '233 S Wacker Dr, Chicago, IL 60606'
  },
  {
    id: '3',
    name: 'New York Office',
    address: '350 5th Ave, New York, NY 10118'
  }
];

interface AccessScreenProps {
  onNavigateToHome?: () => void;
}

const AccessScreen = ({ onNavigateToHome }: AccessScreenProps) => {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [doors, setDoors] = useState<DoorAccess[]>(doorData);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    inRange: true
  });
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Location state
  const [locations] = useState<Location[]>(locationData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationData[0].id);
  const [selectedLocation, setSelectedLocation] = useState<Location>(locationData[0]);
  const [locationBottomSheetVisible, setLocationBottomSheetVisible] = useState(false);

  // Door Bottom Sheet state
  const [doorBottomSheetVisible, setDoorBottomSheetVisible] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState<DoorAccess | null>(null);

  // Set the selected location based on the selected ID
  useEffect(() => {
    const location = locations.find(loc => loc.id === selectedLocationId);
    if (location) {
      setSelectedLocation(location);
    }
  }, [selectedLocationId, locations]);

  // Filter doors based on search and categories
  const favoritesDoors = doors.filter(door => door.isFavorite);
  const inRangeDoors = doors.filter(door => !door.isFavorite);

  // Sort by ID to maintain stable positions instead of sorting by lock status
  const sortedFavoritesDoors = [...favoritesDoors].sort((a, b) => {
    return parseInt(a.id) - parseInt(b.id); // Sort by ID for stable positions
  });

  // Handle navigate to home
  const handleBackPress = () => {
    console.log('Navigating back to home');
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      // If no prop provided, we could dispatch an event or use context
      // For now, log that navigation would happen
      console.log('Would navigate to home screen (onNavigateToHome not provided)');
    }
  };

  // Function to handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    // Filter doors based on search text would go here
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  // Handle location selection
  const handleLocationButtonPress = () => {
    setLocationBottomSheetVisible(true);
  };

  const handleLocationSelection = (location: Location) => {
    setSelectedLocationId(location.id);
    setLocationBottomSheetVisible(false);
    // Here you would typically fetch doors for the new location
    console.log(`Selected location: ${location.name}`);
  };

  const handleCloseLocationBottomSheet = () => {
    setLocationBottomSheetVisible(false);
  };

  // Handle door unlock/lock
  const handleDoorUnlock = useCallback((doorId: string) => {
    console.log(`[DOOR] Door unlock initiated for door ID: ${doorId}`);
    
    // Use DoorTimerService to unlock the door
    DoorTimerService.unlockDoor(doorId);
    
    // Delay the status change to allow the button to complete its animation
    setTimeout(() => {
      console.log(`[DOOR] Updating door ${doorId} status to Unlocked`);
      setDoors(prevDoors => {
        // Create a completely new array with new door objects to prevent any state sharing
        const updatedDoors = prevDoors.map(door => {
          // Create a completely new object for EVERY door, not just the changed one
          // This ensures maximum isolation and forces React to treat all cards as new
          if (door.id === doorId) {
            console.log(`[DOOR] Creating new door object for ${door.id} (${door.name}), changing status from ${door.status} to Unlocked`);
            return {
              ...JSON.parse(JSON.stringify(door)), // Deep clone for total isolation
              status: 'Unlocked' as DoorStatus
            };
          }
          // Return a new deep copy even for unchanged doors to prevent reference sharing
          return JSON.parse(JSON.stringify(door));
        });
        
        console.log(`[DOOR] Door status update complete, doors updated: ${updatedDoors.filter(d => d.status === 'Unlocked').map(d => d.id).join(', ')}`);
        return updatedDoors;
      });
      console.log(`[DOOR] Door status updated to Unlocked: ${doorId}`);
    }, 300);
  }, []);
  
  const handleDoorLock = useCallback((doorId: string) => {
    console.log(`[DOOR] Door lock initiated for door ID: ${doorId}`);
    
    // Use DoorTimerService to lock the door
    DoorTimerService.lockDoor(doorId);
    
    // Update local state
    setDoors(prevDoors => {
      const updatedDoors = prevDoors.map(door => {
        if (door.id === doorId) {
          console.log(`[DOOR] Creating new door object for ${door.id} (${door.name}), changing status from ${door.status} to Locked`);
          return {
            ...JSON.parse(JSON.stringify(door)), // Deep clone for total isolation
            status: 'Locked' as DoorStatus
          };
        }
        return JSON.parse(JSON.stringify(door)); // Deep clone all doors
      });
      
      return updatedDoors;
    });
    console.log(`[DOOR] Door status updated to Locked: ${doorId}`);
  }, []);
  
  // Subscribe to door events to keep UI in sync
  useEffect(() => {
    const doorUnlockedHandler = (data: { doorId: string }) => {
      setDoors(prevDoors => {
        const updatedDoors = prevDoors.map(door => {
          if (door.id === data.doorId) {
            return {
              ...JSON.parse(JSON.stringify(door)),
              status: 'Unlocked' as DoorStatus
            };
          }
          return JSON.parse(JSON.stringify(door));
        });
        return updatedDoors;
      });
    };
    
    const doorLockedHandler = (data: { doorId: string }) => {
      setDoors(prevDoors => {
        const updatedDoors = prevDoors.map(door => {
          if (door.id === data.doorId) {
            return {
              ...JSON.parse(JSON.stringify(door)),
              status: 'Locked' as DoorStatus
            };
          }
          return JSON.parse(JSON.stringify(door));
        });
        return updatedDoors;
      });
    };
    
    DoorTimerService.subscribe(DoorTimerEvents.DOOR_UNLOCKED, doorUnlockedHandler);
    DoorTimerService.subscribe(DoorTimerEvents.DOOR_LOCKED, doorLockedHandler);
    
    return () => {
      DoorTimerService.unsubscribe(DoorTimerEvents.DOOR_UNLOCKED, doorUnlockedHandler);
      DoorTimerService.unsubscribe(DoorTimerEvents.DOOR_LOCKED, doorLockedHandler);
    };
  }, []);

  // Toggle section expansion
  const toggleSection = (section: 'favorites' | 'inRange') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle request access button press
  const handleRequestAccess = (doorId: string, doorName: string) => {
    console.log(`Access requested for: ${doorName}`);
    
    // Update the door to mark access as requested
    setDoors(prevDoors => 
      prevDoors.map(door => 
        door.id === doorId ? {...door, accessRequested: true} : door
      )
    );
    
    setToastMessage(`Access request for ${doorName} has been submitted`);
    setToastVisible(true);
  };

  // Handle toast dismiss
  const handleToastDismiss = () => {
    setToastVisible(false);
  };

  // Handle door select
  const handleDoorSelect = useCallback((door: DoorAccess) => {
    console.log(`[DOOR] Door selected: ${door.id} (${door.name})`);
    setSelectedDoor(door);
    setDoorBottomSheetVisible(true);
  }, []);

  const handleCloseDoorBottomSheet = () => {
    setDoorBottomSheetVisible(false);
  };

  // Handle unlock from bottom sheet
  const handleDoorBottomSheetUnlock = useCallback(() => {
    if (selectedDoor) {
      console.log(`[DOOR] Door unlock from bottom sheet: ${selectedDoor.id} (${selectedDoor.name})`);
      handleDoorUnlock(selectedDoor.id);
    }
  }, [selectedDoor, handleDoorUnlock]);

  const handleToggleDoorFavorite = (isFavorite: boolean) => {
    if (selectedDoor) {
      console.log(`[AccessScreen] handleToggleDoorFavorite called with value: ${isFavorite} for door: ${selectedDoor.id}`);
      console.log(`[AccessScreen] Current doors state before update:`, JSON.stringify(doors.map(d => ({ id: d.id, isFavorite: d.isFavorite }))));
      
      const updatedDoors = doors.map(door => {
        if (door.id === selectedDoor.id) {
          console.log(`[AccessScreen] Updating door ${door.id} isFavorite from ${door.isFavorite} to ${isFavorite}`);
          return { ...door, isFavorite };
        }
        return door;
      });
      
      console.log(`[AccessScreen] Setting doors state...`);
      setDoors(updatedDoors);
      console.log(`[AccessScreen] Updated doors state:`, JSON.stringify(updatedDoors.map(d => ({ id: d.id, isFavorite: d.isFavorite }))));
    }
  };

  // Handle toggle alerts for door
  const handleToggleAlerts = (showAlerts: boolean) => {
    if (selectedDoor) {
      console.log(`[AccessScreen] handleToggleAlerts called with value: ${showAlerts} for door: ${selectedDoor.id}`);
      console.log(`[AccessScreen] Current doors state before update:`, JSON.stringify(doors.map(d => ({ id: d.id, showAlerts: d.showAlerts }))));
      
      const updatedDoors = doors.map(door => {
        if (door.id === selectedDoor.id) {
          console.log(`[AccessScreen] Updating door ${door.id} showAlerts from ${door.showAlerts} to ${showAlerts}`);
          return { ...door, showAlerts };
        }
        return door;
      });
      
      console.log(`[AccessScreen] Setting doors state...`);
      setDoors(updatedDoors);
      console.log(`[AccessScreen] Updated doors state:`, JSON.stringify(updatedDoors.map(d => ({ id: d.id, showAlerts: d.showAlerts }))));
    }
  };

  const handleReportIssue = () => {
    if (selectedDoor) {
      setToastMessage(`Reported issue for ${selectedDoor.name}`);
      setToastVisible(true);
    }
  };

  // Component for section headers
  const SectionHeader = ({ 
    title, 
    expanded, 
    onToggle,
    count
  }: { 
    title: string; 
    expanded: boolean; 
    onToggle: () => void;
    count?: string;
  }) => {
    return (
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {count && (
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>{count}</Text>
            </View>
          )}
        </View>
        <ChevronIcon 
          width={24} 
          height={24} 
          fill="#FFFFFF" 
          direction={expanded ? 'up' : 'down'} 
        />
      </TouchableOpacity>
    );
  };

  // Create a completely isolated container component for each door
  const IsolatedDoorContainer = ({ 
    doorData, 
    isLastItem, 
    onUnlock, 
    onLock, 
    onRequestAccess,
    onSelect
  }: { 
    doorData: DoorAccess; 
    isLastItem: boolean; 
    onUnlock: (doorId: string) => void; 
    onLock: (doorId: string) => void; 
    onRequestAccess: (doorId: string, doorName: string) => void;
    onSelect: (door: DoorAccess) => void;
  }) => {
    console.log(`[ISOLATED] Container created for door ${doorData.id} (${doorData.name}) with status ${doorData.status}`);
    
    // Create a fully isolated local state that doesn't depend on props
    // This ensures changes to parent state don't cause unexpected issues
    const [door] = useState(() => {
      console.log(`[ISOLATED] Initializing local state for door ${doorData.id}`);
      return JSON.parse(JSON.stringify(doorData));
    });
    
    // Add state for tracking press
    const [isPressed, setIsPressed] = useState(false);
    
    // Create local component ID to track this specific instance
    const instanceId = useRef(`door-container-${door.id}-${Math.random().toString(36).substring(2, 9)}`);
    
    // Track if this component has been mounted
    const isMountedRef = useRef(true);
    
    // Determine if the door should be touchable
    const isTouchable = door.status !== 'Restricted' && door.status !== 'Disabled';
    
    // Create strictly local handlers that don't reference external state
    const handleDoorUnlock = useCallback(() => {
      if (!isMountedRef.current) return;
      
      console.log(`[ISOLATED:${instanceId.current}] Door unlock triggered for ${door.id}`);
      onUnlock(door.id);
    }, [door.id, onUnlock]);
    
    const handleDoorLock = useCallback(() => {
      if (!isMountedRef.current) return;
      
      console.log(`[ISOLATED:${instanceId.current}] Door lock triggered for ${door.id}`);
      onLock(door.id);
    }, [door.id, onLock]);
    
    const handleRequestAccess = useCallback(() => {
      if (!isMountedRef.current) return;
      
      console.log(`[ISOLATED:${instanceId.current}] Access request triggered for ${door.id}`);
      onRequestAccess(door.id, door.name);
    }, [door.id, door.name, onRequestAccess]);
    
    // Log mount/unmount for debugging
    useEffect(() => {
      const id = instanceId.current;
      console.log(`[ISOLATED:${id}] Container for door ${door.id} mounted`);
      
      return () => {
        console.log(`[ISOLATED:${id}] Container for door ${door.id} unmounting`);
        isMountedRef.current = false;
      };
    }, [door.id]);
    
    // Function to render status chip
    const renderStatusChip = useCallback(() => {
      let chipStyle = {};
      let textStyle = {};
      let statusText = door.status;
      
      switch (door.status) {
        case 'Unlocked':
          chipStyle = styles.unlockChip;
          textStyle = styles.unlockText;
          break;
        case 'Locked':
          chipStyle = styles.lockChip;
          textStyle = styles.lockText;
          break;
        case 'Restricted':
          chipStyle = styles.restrictedChip;
          textStyle = styles.restrictedText;
          break;
        case 'Disabled':
          chipStyle = styles.disabledChip;
          textStyle = styles.disabledText;
          break;
      }
      
      return (
        <View style={[styles.statusChip, chipStyle]}>
          <Text style={[styles.statusChipText, textStyle]}>{statusText}</Text>
        </View>
      );
    }, [door.status]);

    // Function to render door icon based on status
    const renderDoorIcon = useCallback(() => {
      switch (door.status) {
        case 'Unlocked':
          return <DoorIcon width={28} height={28} color="#FFFFFF" isOpen={true} />;
        case 'Locked':
          return <DoorIcon width={28} height={28} color="#FFFFFF" isOpen={false} />;
        case 'Restricted':
          return <DoorIcon width={28} height={28} color="#404759" isOpen={false} />;
        case 'Disabled':
          return <DoorIcon width={28} height={28} color="#404759" isOpen={false} />;
        default:
          return <DoorIcon width={28} height={28} color="#FFFFFF" isOpen={false} />;
      }
    }, [door.status]);

    // Only show swipe functionality for locked/unlocked doors
    const isSwipeable = door.status !== 'Disabled' && door.status !== 'Restricted';
    
    // Generate completely unique key for the swipe button
    // This is now regenerated on EVERY render to ensure maximum isolation
    const swipeButtonKey = `swipe-button-${door.id}-${door.status}-${instanceId.current}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`[ISOLATED:${instanceId.current}] Rendering with key ${swipeButtonKey}`);
    
    // Handle press events
    const handlePress = () => {
      onSelect(doorData);
    };
    
    // The content of the door card that is the same whether it's touchable or not
    const cardContent = (
      <>
        <View style={styles.doorContentLeft}>
          <View style={[
            styles.doorIconContainer,
            door.status === 'Unlocked' ? styles.unlockIconBg :
            door.status === 'Locked' ? styles.lockIconBg :
            door.status === 'Restricted' ? styles.restrictedIconBg : 
            styles.disabledIconBg
          ]}>
            {renderDoorIcon()}
          </View>
          <View style={styles.doorTextContainer}>
            <Text style={[
              styles.doorName,
              door.status === 'Disabled' && styles.doorNameDisabled
            ]} numberOfLines={1} ellipsizeMode="tail">
              {door.name}
            </Text>
            {renderStatusChip()}
          </View>
        </View>
        
        {/* Status specific actions */}
        <View style={styles.doorActions}>
          {door.status === 'Restricted' ? (
            <View style={[
              styles.requestAccessButtonContainer,
              door.accessRequested && styles.requestAccessButtonContainerDisabled
            ]}>
              <TouchableOpacity 
                style={styles.requestAccessButton}
                onPress={handleRequestAccess}
                disabled={door.accessRequested}
                activeOpacity={door.accessRequested ? 1 : 0.7}
              >
                <Text style={[
                  styles.requestAccessText,
                  door.accessRequested && styles.requestAccessTextDisabled
                ]}>
                  {door.accessRequested ? 'Access Requested' : 'Request Access'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : isSwipeable ? (
            <IsolatedSwipeButton
              doorId={door.id}
              key={swipeButtonKey}
              initialUnlocked={door.status === 'Unlocked'}
              onSwipe={handleDoorUnlock} 
              onLock={handleDoorLock}
              countdownDuration={60}
            />
          ) : null}
        </View>
      </>
    );
    
    return (
      <View style={[
        styles.doorCardContainer,
        isLastItem && styles.doorCardContainerLast
      ]}>
        {isTouchable ? (
          <TouchableOpacity 
            style={styles.doorCardContent}
            onPress={handlePress}
            activeOpacity={0.9}
          >
            {cardContent}
          </TouchableOpacity>
        ) : (
          <View style={styles.doorCardContent}>
            {cardContent}
          </View>
        )}
      </View>
    );
  };

  // Near the top of the file, add a new CardIsolator component
  // This wrapper forces a completely new component tree to be created each time
  const CardIsolator = React.memo(({ door, isLastItem, onUnlock, onLock, onRequestAccess, onSelect }: {
    door: DoorAccess; 
    isLastItem: boolean;
    onUnlock: (doorId: string) => void;
    onLock: (doorId: string) => void;
    onRequestAccess: (doorId: string, doorName: string) => void;
    onSelect: (door: DoorAccess) => void;
  }) => {
    // This component has no state, it simply passes the props to IsolatedDoorContainer
    // But by using React.memo and a unique key when rendering this component,
    // we ensure complete isolation
    console.log(`[ISOLATOR] Creating isolated card for door ${door.id} (${door.name}) with status ${door.status}`);
    
    return (
      <IsolatedDoorContainer
        doorData={door}
        isLastItem={isLastItem}
        onUnlock={onUnlock}
        onLock={onLock}
        onRequestAccess={onRequestAccess}
        onSelect={onSelect}
      />
    );
  }, (prevProps, nextProps) => {
    // Never reuse this component - always create a fresh instance
    return false;
  });

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

  // Center the text regardless of platform
  const getTextInputProps = () => {
    return {
      style: [
        styles.searchInput,
        isFocused && styles.searchInputFocused
      ],
      placeholder: "Search",
      placeholderTextColor: getPlaceholderColor(),
      value: searchText,
      onChangeText: handleSearch,
      returnKeyType: "search" as const,
      autoCapitalize: "none" as const,
      autoCorrect: false,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      selectionColor: "#6FDCFA",
    };
  };

  // SVG content for search close icon
  const searchCloseIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="close">
<path id="Icon" d="M4.8496 12L4 11.1504L7.1504 8L4 4.8496L4.8496 4L8 7.1504L11.1504 4L12 4.8496L8.8496 8L12 11.1504L11.1504 12L8 8.8496L4.8496 12Z" fill="white"/>
</g>
</svg>`;

  // The IsolatedSwipeButton component wrapper
  const IsolatedSwipeButton = useCallback(({ 
    doorId, 
    initialUnlocked, 
    onSwipe, 
    onLock,
    countdownDuration = 60
  }: {
    doorId: string;
    initialUnlocked: boolean;
    onSwipe: (doorId: string) => void;
    onLock?: (doorId: string) => void;
    countdownDuration?: number;
  }) => {
    // Generate a key when the locked state changes to force a complete re-render
    const swipeKey = `${doorId}-${initialUnlocked}-${Date.now()}`;
    
    const doorStatus = DoorTimerService.isDoorUnlocked(doorId) ? 'Unlocked' : 'Locked';
    console.log(`[ACCESSSCREEN:ISB] Rendering button for ${doorId}, status=${doorStatus}`);
    
    return (
      <View style={styles.doorSwipeButtonContainer} key={swipeKey}>
        <View style={{ width: 126, height: 36 }}>
          <IsolatedSwipeButtonComp
            doorId={doorId}
            initialUnlocked={initialUnlocked}
            onSwipe={() => onSwipe(doorId)}
            onLock={onLock ? () => onLock(doorId) : undefined}
            countdownDuration={countdownDuration}
          />
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <AccessTopBar
        title="Access" 
        onBackPress={handleBackPress}
        onBuildingPress={handleLocationButtonPress}
      />
      
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
              styles.placeholder, 
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
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favorites Section */}
        <View style={styles.section}>
          <SectionHeader 
            title="Favorites" 
            expanded={expandedSections.favorites}
            onToggle={() => toggleSection('favorites')}
          />
          
          {expandedSections.favorites && (
            <View style={styles.sectionContent}>
              {sortedFavoritesDoors.map((door, index) => {
                const isLastItem = index === sortedFavoritesDoors.length - 1;
                
                // Deep clone the door object to ensure no reference sharing
                const doorClone = JSON.parse(JSON.stringify(door));
                
                // Create a unique identifier that changes with ANY state change
                const instanceId = `door-${door.id}-${door.status}-${Date.now()}-${Math.random()}`;
                
                console.log(`Creating door card with key ${instanceId}`);
                
                return (
                  <View key={instanceId} style={styles.doorItemContainer}>
                    <CardIsolator
                      door={doorClone}
                      isLastItem={isLastItem}
                      onUnlock={handleDoorUnlock}
                      onLock={handleDoorLock}
                      onRequestAccess={handleRequestAccess}
                      onSelect={handleDoorSelect}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
        
        {/* In Range Section */}
        <View style={[styles.section, { paddingTop: 16 }]}>
          <SectionHeader 
            title="In Range" 
            expanded={expandedSections.inRange}
            onToggle={() => toggleSection('inRange')}
            count="50m"
          />
          
          {expandedSections.inRange && (
            <View style={styles.sectionContent}>
              {inRangeDoors.map((door, index) => {
                const isLastItem = index === inRangeDoors.length - 1;
                
                // Deep clone the door object to ensure no reference sharing
                const doorClone = JSON.parse(JSON.stringify(door));
                
                // Create a unique identifier that changes with ANY state change
                const instanceId = `door-${door.id}-${door.status}-${Date.now()}-${Math.random()}`;
                
                console.log(`Creating in-range door card with key ${instanceId}`);
                
                return (
                  <View key={instanceId} style={styles.doorItemContainer}>
                    <CardIsolator
                      door={doorClone}
                      isLastItem={isLastItem}
                      onUnlock={handleDoorUnlock}
                      onLock={handleDoorLock}
                      onRequestAccess={handleRequestAccess}
                      onSelect={handleDoorSelect}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Location Bottom Sheet */}
      <LocationBottomSheet 
        visible={locationBottomSheetVisible}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onClose={handleCloseLocationBottomSheet}
        onSelectLocation={handleLocationSelection}
      />
      
      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={handleToastDismiss}
        duration={3000}
        showDismissButton={true}
        hapticFeedback={true}
        hapticType="success"
      />
      
      {/* Door Bottom Sheet */}
      {selectedDoor && (
        <DoorBottomSheet
          visible={doorBottomSheetVisible}
          onClose={handleCloseDoorBottomSheet}
          doorName={selectedDoor.name}
          doorId={selectedDoor.id}
          onUnlock={handleDoorBottomSheetUnlock}
          onReportIssue={handleReportIssue}
          onToggleFavorite={handleToggleDoorFavorite}
          isFavorite={selectedDoor.isFavorite || false}
          showAlerts={selectedDoor.showAlerts || false}
          onToggleAlerts={handleToggleAlerts}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 20,
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
  placeholder: {
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
  section: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#FFFFFF'
  },
  counterContainer: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD_ALT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  counterText: {
    color: '#6FDCFA',
    fontSize: 12,
    fontFamily: 'Outfit-SemiBold',
    lineHeight: 14,
    fontWeight: '600',
  },
  chevronIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '225deg' }],
  },
  chevronDown: {
    transform: [{ rotate: '45deg' }],
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  doorCardContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
    width: '100%',
    paddingVertical: 20,
  },
  doorCardContainerLast: {
    borderBottomWidth: 0,
  },
  doorCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  doorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 0,
  },
  unlockIconBg: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
  },
  lockIconBg: {
    backgroundColor: '#23262D',
  },
  restrictedIconBg: {
    backgroundColor: 'rgba(46, 51, 61, 0.35)',
  },
  disabledIconBg: {
    backgroundColor: 'rgba(46, 51, 61, 0.35)',
  },
  doorTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    minWidth: 120,
    paddingRight: 8,
    height: 44,
  },
  doorName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  doorNameDisabled: {
    color: '#404759',
  },
  statusChip: {
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    lineHeight: 20,
  },
  unlockChip: {},
  unlockText: {
    color: '#C3FF79',
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
  },
  lockChip: {},
  lockText: {
    color: '#717C98',
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  restrictedChip: {},
  restrictedText: {
    color: '#404759',
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
  },
  disabledChip: {},
  disabledText: {
    color: '#404759',
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
  },
  requestAccessButtonContainer: {
    width: 128,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2E333D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  requestAccessButtonContainerDisabled: {
    backgroundColor: 'rgba(46, 51, 61, 0.35)',
  },
  requestAccessButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    height: 32,
    width: '100%',
  },
  requestAccessText: {
    color: '#B6BDCD',
    fontSize: 12,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 16,
    textAlign: 'center',
    flexShrink: 1,
  },
  requestAccessTextDisabled: {
    color: '#404759',
  },
  cardContainer: {
    width: '100%',
  },
  doorItemContainer: {
    width: '100%',
    marginBottom: 8,
  },
  doorContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  doorActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 128,
    flexShrink: 0
  },
  doorSwipeButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessScreen; 