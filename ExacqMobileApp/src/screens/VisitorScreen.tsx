import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../design-system';
import AccessTopBar from '../components/AccessTopBar';
import VisitorsList from '../components/VisitorsList';
import LocationBottomSheet from '../components/LocationBottomSheet';
import { Feather } from '@expo/vector-icons';
import ChevronIcon from '../components/icons/ChevronIcon';
import CreateInviteScreen from './CreateInviteScreen';
import InviteService, { Invite as InviteType } from '../services/InviteService';
import TimeService from '../services/TimeService';
import Toast from '../components/Toast';

// Define enum for active tab
enum VisitorTab {
  INVITATION = 'invitation',
  ADDRESS_BOOK = 'addressBook'
}

// Define interfaces for visitor data
interface Visitor {
  id: string;
  name: string;
  date: string;
  timeRange: string;
  imageUrl: string;
  status: 'invited' | 'checkedIn';
}

// Sample location data
const locationData = [
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

interface VisitorScreenProps {
  onNavigateToHome?: () => void;
  onInviteFlowStateChange?: (isActive: boolean) => void;
}

const VisitorScreen = ({ onNavigateToHome, onInviteFlowStateChange }: VisitorScreenProps) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<VisitorTab>(VisitorTab.INVITATION);
  
  // Location state
  const [locations] = useState(locationData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationData[0].id);
  const [selectedLocation, setSelectedLocation] = useState(locationData[0]);
  const [locationBottomSheetVisible, setLocationBottomSheetVisible] = useState(false);
  
  // Create invite screen state
  const [showCreateInvite, setShowCreateInvite] = useState(false);

  // Add state for invites from InviteService
  const [invites, setInvites] = useState<InviteType[]>([]);
  
  // Add toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sample visitor data for today - keep for now as fallback
  const todayVisitors: Visitor[] = [
    {
      id: '1',
      name: 'Graham Stephen',
      date: '03/22/25',
      timeRange: '9:30 AM - 11:00 AM',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'checkedIn'
    },
    {
      id: '2',
      name: 'Adam Smith',
      date: '03/22/25',
      timeRange: '12:30 PM - 1:30 PM',
      imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
      status: 'invited'
    },
    {
      id: '3',
      name: 'Henry Wells',
      date: '03/22/25',
      timeRange: '3:00 PM - 4:00 PM',
      imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg',
      status: 'invited'
    }
  ];

  // Update the useEffect to add more detailed logging
  useEffect(() => {
    console.log('[VisitorScreen] ==================== SETTING UP VISITOR SCREEN ====================');
    console.log('[VisitorScreen] Setting up InviteService listener');
    
    // Function to load invites with detailed logging
    const loadInvites = () => {
      console.log('[VisitorScreen] Loading invites from InviteService');
      const serviceInvites = InviteService.getInvites();
      console.log(`[VisitorScreen] Loaded ${serviceInvites.length} invites:`, 
        serviceInvites.map(inv => `${inv.id.substring(0, 10)}... - ${inv.visitorName}`));
      
      if (serviceInvites.length > 0) {
        console.log('[VisitorScreen] Setting invites to state');
        setInvites(serviceInvites);
      } else {
        console.log('[VisitorScreen] No invites loaded, using sample data');
      }
    };
    
    // Load initial invites
    loadInvites();
    
    // Set up listener for new invites with better error handling
    const handleNewInvite = (invite) => {
      try {
        console.log('[VisitorScreen] ✅ New invite received:', invite.id);
        console.log('[VisitorScreen] Invite details:', JSON.stringify(invite, null, 2));
        
        // Add to state with current state reference to avoid closure issues
        setInvites(currentInvites => {
          console.log(`[VisitorScreen] Adding new invite to ${currentInvites.length} existing invites`);
          return [...currentInvites, invite];
        });
      } catch (error) {
        console.error('[VisitorScreen] Error handling new invite:', error);
      }
    };
    
    // Register callback
    console.log('[VisitorScreen] Registering direct callback with InviteService');
    InviteService.registerCallback(handleNewInvite);
    
    // Clean up on unmount (app restart)
    return () => {
      console.log('[VisitorScreen] Cleaning up InviteService listener');
      InviteService.unregisterCallback(handleNewInvite);
    };
  }, []);

  // Handler for tab change
  const handleTabChange = (tab: VisitorTab) => {
    setActiveTab(tab);
  };

  // Handler for add button press
  const handleAddPress = () => {
    console.log('Add visitor button pressed');
    setShowCreateInvite(true);
    // Notify parent that invite flow is active
    if (onInviteFlowStateChange) {
      onInviteFlowStateChange(true);
    }
  };

  // Handle closing the create invite screen
  const handleCloseCreateInvite = () => {
    setShowCreateInvite(false);
    // Notify parent that invite flow is no longer active
    if (onInviteFlowStateChange) {
      onInviteFlowStateChange(false);
    }
  };

  // Update the handle create invite function to avoid duplicate creation
  const handleCreateInvite = async (inviteData) => {
    console.log('[VisitorScreen] Received invite creation callback:', inviteData);
    
    // Show success toast - the invite is already created by CreateInviteScreen
    setToastMessage('Invitation has been created successfully');
    setToastVisible(true);
    
    // Close the invite screen
    setShowCreateInvite(false);
    
    // Notify parent that invite flow is no longer active
    if (onInviteFlowStateChange) {
      onInviteFlowStateChange(false);
    }
  };

  // Handle the toast dismiss action
  const handleToastDismiss = () => {
    setToastVisible(false);
  };

  // Handle navigate to home
  const handleBackPress = () => {
    console.log('Navigating back to home');
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      // If no prop provided, we could dispatch an event or use context
      console.log('Would navigate to home screen (onNavigateToHome not provided)');
    }
  };

  // Handle location selection
  const handleLocationButtonPress = () => {
    setLocationBottomSheetVisible(true);
    console.log('Building/location button pressed');
  };

  const handleLocationSelection = (location) => {
    setSelectedLocationId(location.id);
    setLocationBottomSheetVisible(false);
    console.log(`Selected location: ${location.name}`);
  };

  const handleCloseLocationBottomSheet = () => {
    setLocationBottomSheetVisible(false);
  };

  // Generate a color based on the visitor's name
  const getColorFromName = (name: string): string => {
    if (!name) return '#404550'; // Default color
    
    // Generate a color based on the first character code
    const charCode = name.charCodeAt(0);
    const colors = [
      '#6FDCFA', // Light blue (primary app color)
      '#C3FF79', // Light green (secondary app color)
      '#FF5A5A', // Red
      '#FFB800', // Orange/Gold
      '#AB7CF7', // Purple
      '#FF80D5', // Pink
      '#39B388', // Teal
      '#5271FF', // Blue
      '#FF9650', // Light orange
      '#00D5C0'  // Cyan
    ];
    
    // Use the character code to select a color
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };

  // Render visitor item with status button
  const renderVisitorItem = (visitor: Visitor) => (
    <View style={styles.visitorItem} key={visitor.id}>
      <View style={styles.visitorDetails}>
        <View style={styles.avatar}>
          {visitor.imageUrl ? (
            <Image 
              source={{ uri: visitor.imageUrl }} 
              style={styles.avatarImage} 
              resizeMode="cover"
            />
          ) : null}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.visitorName}>{visitor.name}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{visitor.date}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.timeText}>{visitor.timeRange}</Text>
          </View>
        </View>
      </View>
      <Text 
        style={[
          styles.statusText,
          visitor.status === 'checkedIn' ? styles.checkedInText : styles.invitedText
        ]}
      >
        {visitor.status === 'checkedIn' ? 'Checked In' : 'Invited'}
      </Text>
    </View>
  );

  // Add function to format invite date/time for display
  const formatInviteDateTime = (invite: InviteType) => {
    try {
      console.log('[VisitorScreen] Formatting date/time for invite:', invite.id);
      
      // Log the raw date strings for debugging
      console.log('[VisitorScreen] Raw date strings:');
      console.log(`- From: "${invite.validFrom}"`);
      console.log(`- Until: "${invite.validUntil}"`);
      
      // Check if the times indicate an all-day event (12:00 AM and 11:59 PM)
      const isFromAllDayStart = invite.validFrom.includes('12:00 AM');
      const isUntilAllDayEnd = invite.validUntil.includes('11:59 PM');
      const isLikelyAllDay = isFromAllDayStart && isUntilAllDayEnd;
      
      console.log(`[VisitorScreen] All-day detection: ${isLikelyAllDay} (start: ${isFromAllDayStart}, end: ${isUntilAllDayEnd})`);
      
      // Use TimeService to parse dates from ISO strings
      const startDate = TimeService.fromISOString(invite.validFrom);
      const endDate = TimeService.fromISOString(invite.validUntil);
      
      // Check if dates are valid before formatting
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('[VisitorScreen] Invalid date(s):', { 
          from: invite.validFrom, 
          until: invite.validUntil 
        });
        return { date: 'Invalid date', timeRange: 'Invalid time' };
      }
      
      // Log the parsed Date objects
      console.log('[VisitorScreen] Parsed Date objects:');
      console.log(`- Start: ${startDate.toString()}`);
      console.log(`- End: ${endDate.toString()}`);
      
      // Use TimeService to format the date and time range
      // If it looks like an all-day event, tell the formatter
      if (isLikelyAllDay) {
        // Create proper all-day dates (0:00 and 23:59)
        const allDayStart = new Date(startDate);
        allDayStart.setHours(0, 0, 0, 0);
        
        const allDayEnd = new Date(endDate);
        allDayEnd.setHours(23, 59, 59, 999);
        
        const result = TimeService.formatDateTimeRange(allDayStart, allDayEnd);
        console.log('[VisitorScreen] Formatted as all-day event:', result);
        return result;
      } else {
        const result = TimeService.formatDateTimeRange(startDate, endDate);
        console.log('[VisitorScreen] Formatted as regular event:', result);
        return result;
      }
    } catch (error) {
      console.error('[VisitorScreen] Error formatting date/time:', error);
      return {
        date: 'Invalid date',
        timeRange: 'Invalid time'
      };
    }
  };

  // Add debug button to test invite creation directly in VisitorScreen
  const renderDebugButton = () => {
    // Removed debug buttons as requested
    return null;
  };

  // Add a utility function to categorize dates
  const categorizeDates = (invites: InviteType[]) => {
    console.log(`[VisitorScreen] Categorizing ${invites.length} invites`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 2); // Start 2 days from today
    
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 7);
    
    const thisMonthStart = new Date(today);
    thisMonthStart.setDate(8); // Assuming "next week" covers the first 7 days
    
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    // Month names for future months
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    console.log(`[VisitorScreen] Date ranges for categorization:`);
    console.log(`- Today: ${today.toDateString()}`);
    console.log(`- Tomorrow: ${tomorrow.toDateString()}`);
    console.log(`- Next week: ${nextWeekStart.toDateString()} to ${nextWeekEnd.toDateString()}`);
    console.log(`- This month: ${thisMonthStart.toDateString()} to ${thisMonthEnd.toDateString()}`);
    console.log(`- Next month: ${nextMonthStart.toDateString()} to ${nextMonthEnd.toDateString()}`);
    
    // Initialize categories
    const categories: {[key: string]: InviteType[]} = {
      'Today': [],
      'Tomorrow': [],
      'Next Week': [],
      'This Month': [],
      'Next Month': []
    };
    
    // Special case for future months
    const futureMonths: {[key: string]: InviteType[]} = {};
    
    // Categorize each invite
    invites.forEach(invite => {
      try {
        console.log(`[VisitorScreen] Categorizing invite: ${invite.id}`);
        console.log(`[VisitorScreen] Date string: "${invite.validFrom}"`);
        
        // Use our improved TimeService to parse the date
        const inviteDate = TimeService.fromISOString(invite.validFrom);
        
        // Reset time portion for comparison
        const dateForComparison = new Date(inviteDate);
        dateForComparison.setHours(0, 0, 0, 0);
        
        console.log(`[VisitorScreen] Parsed date: ${dateForComparison.toDateString()}`);
        
        // Categorize based on date
        if (dateForComparison.getTime() === today.getTime()) {
          console.log(`[VisitorScreen] Categorized as: Today`);
          categories['Today'].push(invite);
        } 
        else if (dateForComparison.getTime() === tomorrow.getTime()) {
          console.log(`[VisitorScreen] Categorized as: Tomorrow`);
          categories['Tomorrow'].push(invite);
        } 
        else if (
          dateForComparison >= nextWeekStart && 
          dateForComparison <= nextWeekEnd
        ) {
          console.log(`[VisitorScreen] Categorized as: Next Week`);
          categories['Next Week'].push(invite);
        } 
        else if (
          dateForComparison >= thisMonthStart && 
          dateForComparison <= thisMonthEnd
        ) {
          console.log(`[VisitorScreen] Categorized as: This Month`);
          categories['This Month'].push(invite);
        } 
        else if (
          dateForComparison >= nextMonthStart && 
          dateForComparison <= nextMonthEnd
        ) {
          console.log(`[VisitorScreen] Categorized as: Next Month`);
          categories['Next Month'].push(invite);
        } 
        else if (dateForComparison > nextMonthEnd) {
          // For dates beyond next month, categorize by month name
          const monthYear = `${monthNames[dateForComparison.getMonth()]} ${dateForComparison.getFullYear()}`;
          console.log(`[VisitorScreen] Categorized as: ${monthYear}`);
          
          if (!futureMonths[monthYear]) {
            futureMonths[monthYear] = [];
          }
          futureMonths[monthYear].push(invite);
        } 
        else {
          console.log(`[VisitorScreen] Invite date is in the past, adding to Today category`);
          categories['Today'].push(invite);
        }
      } catch (error) {
        console.error(`[VisitorScreen] Error categorizing invite:`, error);
        categories['Today'].push(invite); // Default to Today if there's an error
      }
    });
    
    // Combine regular categories with future month categories
    const allCategories = { ...categories, ...futureMonths };
    
    // Log the results
    Object.keys(allCategories).forEach(category => {
      console.log(`[VisitorScreen] Category "${category}" has ${allCategories[category].length} invites`);
    });
    
    return allCategories;
  };

  // Generate a sorted list of categories with their invites
  const getSortedCategories = (invites: InviteType[]) => {
    const categorized = categorizeDates(invites);
    
    // Define the order for the standard categories
    const categoryOrder = ['Today', 'Tomorrow', 'Next Week', 'This Month', 'Next Month'];
    
    // Start with the standard categories in the correct order
    const sortedCategories = categoryOrder
      .filter(category => categorized[category] && categorized[category].length > 0)
      .map(category => ({
        name: category,
        invites: categorized[category]
      }));
    
    // Add future month categories in chronological order
    const futureMonthCategories = Object.keys(categorized)
      .filter(category => !categoryOrder.includes(category) && categorized[category].length > 0)
      .sort() // This will sort alphabetically, which works for "Month Year" format
      .map(category => ({
        name: category,
        invites: categorized[category]
      }));
    
    return [...sortedCategories, ...futureMonthCategories];
  };

  // Update the main content section in the return statement to use categorized invites
  const renderCategorizedInvites = () => {
    // Create a combined array with both real invites and sample data
    const combinedInvites = [...invites];
    const hasRealInvites = invites.length > 0;
    
    // If there are no invites or explicitly including sample data, add the dummy entries
    if (!hasRealInvites || true) { // Always add dummy entries
      console.log('[VisitorScreen] Adding sample visitor data');
      
      // Get today's date formatted for the sample data
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = dayNames[today.getDay()];
      const monthName = monthNames[today.getMonth()];
      const day = today.getDate();
      const year = today.getFullYear();
      
      const formattedToday = `${dayName}, ${monthName} ${day} ${year}`;
      console.log(`[VisitorScreen] Using today's date for samples: ${formattedToday}`);
      
      // Convert sample data to Invite format
      const dummyInvites: InviteType[] = todayVisitors.map(visitor => ({
        id: `sample-${visitor.id}`,
        visitorName: visitor.name,
        // Format the date string in a way compatible with our parser, using today's date
        validFrom: `${formattedToday}, ${visitor.timeRange.split(' - ')[0]}`,
        validUntil: `${formattedToday}, ${visitor.timeRange.split(' - ')[1]}`,
        status: visitor.status === 'checkedIn' ? 'Active' : 'Pending',
        hostName: 'Demo Host'
      }));
      
      // Add dummy invites to our array
      combinedInvites.push(...dummyInvites);
    }
    
    if (combinedInvites.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No invites found</Text>
        </View>
      );
    }
    
    const sortedCategories = getSortedCategories(combinedInvites);
    
    return (
      <>
        {sortedCategories.map(category => (
          <View key={category.name} style={styles.visitorsList}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>{category.name}</Text>
            </View>
            
            {category.invites.map((invite, index) => {
              // Format the date and time
              const { date, timeRange } = formatInviteDateTime(invite);
              
              // Check if this is a sample invite (to show checked-in status)
              const isSampleInvite = invite.id.startsWith('sample-');
              const sampleVisitor = isSampleInvite ? 
                todayVisitors.find(v => `sample-${v.id}` === invite.id) : 
                null;
              
              return (
                <React.Fragment key={invite.id}>
                  <View style={styles.visitorItem}>
                    <View style={styles.visitorDetails}>
                      <View style={styles.avatar}>
                        {/* Show image for sample visitors if available */}
                        {sampleVisitor && sampleVisitor.imageUrl ? (
                          <Image 
                            source={{ uri: sampleVisitor.imageUrl }} 
                            style={styles.avatarImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          // Show first letter of visitor's name for user-created invites
                          <View 
                            style={[
                              styles.initialAvatar,
                              { backgroundColor: '#2E333D' }
                            ]}
                          >
                            <Text style={styles.initialText}>
                              {invite.visitorName 
                                ? invite.visitorName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase() 
                                : '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.visitorName}>{invite.visitorName}</Text>
                        <View style={styles.timeContainer}>
                          <Text style={styles.timeText}>{date}</Text>
                          <View style={styles.dotSeparator} />
                          <Text style={styles.timeText}>{timeRange}</Text>
                        </View>
                      </View>
                    </View>
                    <Text 
                      style={[
                        styles.statusText,
                        sampleVisitor && sampleVisitor.status === 'checkedIn' 
                          ? styles.checkedInText 
                          : styles.invitedText
                      ]}
                    >
                      {sampleVisitor && sampleVisitor.status === 'checkedIn' ? 'Checked In' : 'Invited'}
                    </Text>
                  </View>
                  {index < category.invites.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {showCreateInvite ? (
        <CreateInviteScreen 
          onClose={handleCloseCreateInvite}
          onCreateInvite={handleCreateInvite}
        />
      ) : (
        <>
          {/* Add debug button in development */}
          {renderDebugButton()}
          
          {/* Top Bar - Using AccessTopBar with same configuration as AccessScreen */}
          <AccessTopBar 
            title="Visitor" 
            onBackPress={handleBackPress}
            onBuildingPress={handleLocationButtonPress}
          />
          
          {/* Segmented Control */}
          <View style={styles.tabContainer}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === VisitorTab.INVITATION && styles.activeTabButton
                ]}
                onPress={() => handleTabChange(VisitorTab.INVITATION)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === VisitorTab.INVITATION && styles.activeTabButtonText
                  ]}
                >
                  Invitation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === VisitorTab.ADDRESS_BOOK && styles.activeTabButton
                ]}
                onPress={() => handleTabChange(VisitorTab.ADDRESS_BOOK)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === VisitorTab.ADDRESS_BOOK && styles.activeTabButtonText
                  ]}
                >
                  Address Book
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Main Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {activeTab === VisitorTab.INVITATION && (
              renderCategorizedInvites()
            )}
            
            {activeTab === VisitorTab.ADDRESS_BOOK && (
              <View style={styles.addressBookContainer}>
                <Text style={styles.emptyText}>Address book content will go here</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Feather name="plus" size={24} color="#131515" />
          </TouchableOpacity>

          {/* Location Bottom Sheet */}
          <LocationBottomSheet
            visible={locationBottomSheetVisible}
            locations={locations}
            selectedLocationId={selectedLocationId}
            onClose={handleCloseLocationBottomSheet}
            onSelectLocation={handleLocationSelection}
          />

          {/* Toast Notification */}
          <Toast
            visible={toastVisible}
            message={toastMessage}
            onDismiss={handleToastDismiss}
            duration={4000}
            showDismissButton={true}
            hapticFeedback={true}
            hapticType="success"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  tabContainer: {
    backgroundColor: '#1E2021',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(70, 78, 97, 0.35)',
    borderRadius: 16,
    padding: 4,
    height: 56,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#6FDCFA',
  },
  tabButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  activeTabButtonText: {
    color: '#131515',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  visitorsList: {
    width: '100%',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  visitorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  visitorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#404550',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoContainer: {
    flex: 1,
  },
  visitorName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#B6BDCD',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#717C98',
    marginHorizontal: 8,
  },
  statusText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  invitedText: {
    color: '#6FDCFA',
  },
  checkedInText: {
    color: '#C3FF79',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    marginLeft: 16,
  },
  addressBookContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#B6BDCD',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6FDCFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(19, 21, 21, 0.28)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#B6BDCD',
    textAlign: 'center',
  },
  initialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E333D',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 2,
  },
  initialText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default VisitorScreen; 