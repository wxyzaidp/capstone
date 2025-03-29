import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../design-system';
import AccessTopBar from '../components/AccessTopBar';
import VisitorsList from '../components/VisitorsList';
import LocationBottomSheet from '../components/LocationBottomSheet';
import { Feather } from '@expo/vector-icons';
import ChevronIcon from '../components/icons/ChevronIcon';
import CreateInviteScreen from './CreateInviteScreen';

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
}

const VisitorScreen = ({ onNavigateToHome }: VisitorScreenProps) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<VisitorTab>(VisitorTab.INVITATION);
  
  // Location state
  const [locations] = useState(locationData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationData[0].id);
  const [selectedLocation, setSelectedLocation] = useState(locationData[0]);
  const [locationBottomSheetVisible, setLocationBottomSheetVisible] = useState(false);
  
  // Create invite screen state
  const [showCreateInvite, setShowCreateInvite] = useState(false);

  // Sample visitor data for today
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

  // Handler for tab change
  const handleTabChange = (tab: VisitorTab) => {
    setActiveTab(tab);
  };

  // Handler for add button press
  const handleAddPress = () => {
    console.log('Add visitor button pressed');
    setShowCreateInvite(true);
  };

  // Handle closing the create invite screen
  const handleCloseCreateInvite = () => {
    setShowCreateInvite(false);
  };

  // Handler for saving a new invite
  const handleCreateInvite = (inviteData) => {
    console.log('New invite created:', inviteData);
    
    // Create a new visitor object based on the invite data
    const newVisitor: Visitor = {
      id: `${todayVisitors.length + 1}`,
      name: inviteData.visitorName,
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }),
      timeRange: inviteData.validFrom.split(', ')[2] + ' - ' + inviteData.validUntil.split(', ')[2],
      imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg', // Placeholder image
      status: 'invited'
    };
    
    // Add the new visitor to the todayVisitors array
    const updatedVisitors = [newVisitor, ...todayVisitors];
    
    // Update the visitors state with the new array
    setTodayVisitors(updatedVisitors);
    
    // Close the create invite screen
    setShowCreateInvite(false);
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

  return (
    <View style={styles.container}>
      {showCreateInvite ? (
        <CreateInviteScreen 
          onClose={handleCloseCreateInvite}
          onCreateInvite={handleCreateInvite}
        />
      ) : (
        <>
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
              <View style={styles.visitorsList}>
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>Today</Text>
                </View>
                
                {todayVisitors.map((visitor) => (
                  <React.Fragment key={visitor.id}>
                    {renderVisitorItem(visitor)}
                    {visitor.id !== todayVisitors[todayVisitors.length - 1].id && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
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
});

export default VisitorScreen; 