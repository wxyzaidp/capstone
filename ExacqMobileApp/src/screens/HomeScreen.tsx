import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography, PRIMITIVE } from '../design-system';
import TopBar from '../components/TopBar';
import SwipeUnlock from '../components/SwipeUnlock';
import VisitorsList from '../components/VisitorsList';
import BottomNavigation from '../components/BottomNavigation';
import SimpleCard from '../components/SimpleCard';
import PaginationDots from '../components/PaginationDots';
import LocationBottomSheet from '../components/LocationBottomSheet';
import Svg, { Rect, Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Define app-wide constants
const APP_HORIZONTAL_MARGIN = 16;
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (APP_HORIZONTAL_MARGIN * 2); // Card takes full width minus margins
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Maintain aspect ratio
const CARD_SPACING = 12; // Gap between cards from Figma
const DOOR_CARD_WIDTH = 247; // Fixed door card width from SwipeUnlock component
const DOOR_CARD_SPACING = 12; // Spacing between door cards

// Simplified but complete wallet icon SVG that includes all colors and elements
const walletIconSvg = `<svg width="30" height="23" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M29.05 1.37H0.925V20.95H29.05V1.37Z" fill="#DEDBCE"/>
  <path d="M28.75 1.68H1.25V13.35H28.75V1.68Z" fill="#40A5D9"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M28.75 6.64C28.75 6.55 28.75 6.46 28.75 6.36C28.75 6.28 28.75 6.2 28.75 6.12C28.74 5.95 28.73 5.78 28.7 5.61C28.67 5.43 28.62 5.27 28.54 5.12C28.46 4.96 28.36 4.82 28.24 4.7C28.11 4.57 27.97 4.47 27.82 4.39C27.66 4.31 27.5 4.26 27.33 4.23C27.15 4.2 26.98 4.19 26.81 4.18C26.73 4.18 26.65 4.18 26.57 4.18C26.48 4.18 26.38 4.18 26.29 4.18H26.21H4.79H3.71C3.62 4.18 3.52 4.18 3.43 4.18C3.35 4.18 3.27 4.18 3.19 4.18C3.02 4.19 2.85 4.2 2.67 4.23C2.5 4.26 2.34 4.31 2.18 4.39C2.03 4.47 1.89 4.57 1.76 4.7C1.64 4.82 1.54 4.96 1.46 5.12C1.38 5.27 1.33 5.43 1.3 5.61C1.27 5.78 1.26 5.95 1.25 6.12C1.25 6.2 1.25 6.28 1.25 6.36C1.25 6.46 1.25 6.55 1.25 6.64V7.72V6.88V15.85H28.75V6.93V6.64Z" fill="#FFB003"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M28.75 9.14C28.75 9.05 28.75 8.96 28.75 8.86C28.75 8.78 28.75 8.7 28.75 8.62C28.74 8.45 28.73 8.28 28.7 8.11C28.67 7.93 28.62 7.77 28.54 7.62C28.46 7.46 28.36 7.32 28.24 7.2C28.11 7.07 27.97 6.97 27.82 6.89C27.66 6.81 27.5 6.76 27.33 6.73C27.15 6.7 26.98 6.69 26.81 6.68C26.73 6.68 26.65 6.68 26.57 6.68C26.48 6.68 26.38 6.68 26.29 6.68H26.21H4.79H3.71C3.62 6.68 3.52 6.68 3.43 6.68C3.35 6.68 3.27 6.68 3.19 6.68C3.02 6.69 2.85 6.7 2.67 6.73C2.5 6.76 2.34 6.81 2.18 6.89C2.03 6.97 1.89 7.07 1.76 7.2C1.64 7.32 1.54 7.46 1.46 7.62C1.38 7.77 1.33 7.93 1.3 8.11C1.27 8.28 1.26 8.45 1.25 8.62C1.25 8.7 1.25 8.78 1.25 8.86C1.25 8.96 1.25 9.05 1.25 9.14V10.22V9.38V18.35H28.75V9.43V9.14Z" fill="#40C740"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M28.75 11.64C28.75 11.55 28.75 11.46 28.75 11.36C28.75 11.28 28.75 11.2 28.75 11.12C28.74 10.95 28.73 10.78 28.7 10.61C28.67 10.43 28.62 10.27 28.54 10.12C28.46 9.96 28.36 9.82 28.24 9.7C28.11 9.57 27.97 9.47 27.82 9.39C27.66 9.31 27.5 9.26 27.33 9.23C27.15 9.2 26.98 9.19 26.81 9.18C26.73 9.18 26.65 9.18 26.57 9.18C26.48 9.18 26.38 9.18 26.29 9.18H26.21H4.79H3.71C3.62 9.18 3.52 9.18 3.43 9.18C3.35 9.18 3.27 9.18 3.19 9.18C3.02 9.19 2.85 9.2 2.67 9.23C2.5 9.26 2.34 9.31 2.18 9.39C2.03 9.47 1.89 9.57 1.76 9.7C1.64 9.82 1.54 9.96 1.46 10.12C1.38 10.27 1.33 10.43 1.3 10.61C1.27 10.78 1.26 10.95 1.25 11.12C1.25 11.2 1.25 11.28 1.25 11.36C1.25 11.46 1.25 11.55 1.25 11.64V12.72V11.88V20.85H28.75V11.93V11.64Z" fill="#F26D5F"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M-0.417 0.016V12.93H1.25V5.22V4.14C1.25 4.05 1.25 3.96 1.25 3.86C1.25 3.78 1.25 3.7 1.25 3.62C1.26 3.45 1.27 3.28 1.3 3.11C1.33 2.93 1.38 2.77 1.46 2.62C1.54 2.46 1.64 2.32 1.76 2.2C1.89 2.08 2.03 1.97 2.18 1.89C2.34 1.81 2.5 1.76 2.67 1.73C2.85 1.7 3.02 1.69 3.19 1.69C3.27 1.68 3.35 1.68 3.43 1.68C3.52 1.68 3.62 1.68 3.71 1.68H4.79H26.2H26.29C26.38 1.68 26.48 1.68 26.57 1.68C26.65 1.68 26.73 1.68 26.81 1.69C26.98 1.69 27.15 1.7 27.33 1.73C27.5 1.76 27.66 1.81 27.82 1.89C27.97 1.97 28.11 2.08 28.24 2.2C28.36 2.32 28.46 2.46 28.54 2.62C28.62 2.78 28.67 2.94 28.7 3.11C28.73 3.28 28.74 3.45 28.75 3.63C28.75 3.71 28.75 3.79 28.75 3.86C28.75 3.96 28.75 4.05 28.75 4.15V5.23V12.94H30.42V0.016H-0.417Z" fill="#D9D6CC"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M22.67 11.68C22.49 11.68 22.31 11.68 22.13 11.68C21.98 11.69 21.83 11.69 21.68 11.69C21.36 11.7 21.02 11.72 20.7 11.78C20.37 11.84 20.06 11.93 19.76 12.09C19.73 12.11 18.9 12.48 18.16 13.63C17.6 14.5 16.51 15.43 14.98 15.43C13.45 15.43 12.36 14.5 11.8 13.63C11.02 12.42 10.13 12.05 10.2 12.09C9.9 11.93 9.59 11.84 9.26 11.78C8.94 11.72 8.61 11.7 8.28 11.69C8.13 11.69 7.98 11.69 7.83 11.68C7.65 11.68 7.47 11.68 7.29 11.68H-0.414V23.35H30.42V11.68H22.67Z" fill="#DEDBCE"/>
</svg>`;

// Utility function to shuffle an array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Define the door access type
type DoorStatus = 'Locked' | 'Unlocked';

interface DoorAccess {
  id: string;
  name: string;
  status: DoorStatus;
}

// Define location data
const locationData = [
  {
    id: '1',
    name: 'Exacq HQ - Indiana',
    address: '11955 Exit Five Parkway, Fishers, IN 46037'
  },
  {
    id: '2',
    name: 'Tyco Integrated Security',
    address: '702 N Capitol Ave, Indianapolis, IN 46202'
  },
  {
    id: '3',
    name: 'Johnsons Control Indianapolis Office',
    address: '1255 N Senate Ave, Indianapolis, IN 46202'
  }
];

const HomeScreen = () => {
  // State for the active card index for pagination
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  // State for the active door card index for pagination
  const [activeDoorIndex, setActiveDoorIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const doorScrollViewRef = useRef<ScrollView>(null);
  
  // State to control whether scrolling is enabled in the door carousel
  const [doorCarouselScrollEnabled, setDoorCarouselScrollEnabled] = useState(true);

  // State for access cards - shuffled on initial render
  const [userCards, setUserCards] = useState(() => shuffleArray([
    {
      id: '1',
      name: 'Jacob B',
      role: 'Guest'
    },
    {
      id: '2',
      name: 'Jacob B',
      role: 'Employee'
    },
    {
      id: '3',
      name: 'Jacob B',
      role: 'Security'
    },
    {
      id: '4',
      name: 'Jacob B',
      role: 'Admin'
    }
  ]));
  
  // Log the typography style for section titles
  useEffect(() => {
    console.log('CATEGORY Typography Definition:', UI_TYPOGRAPHY.CATEGORY);
    
    // Log the computed style for section titles
    const sectionTitleStyle = applyTypography(UI_TYPOGRAPHY.CATEGORY, {
      color: UI_COLORS.TEXT.SECONDARY
    });
    console.log('Computed Section Title Style:', sectionTitleStyle);
    
    // Log the actual style object after StyleSheet processing
    console.log('StyleSheet Section Title Style:', styles.sectionTitle);
  }, []);

  // Handler for scroll events to update the active card
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const cardWidth = CARD_WIDTH + CARD_SPACING;
    const index = Math.floor((scrollX + cardWidth / 2) / cardWidth);
    
    if (index !== activeCardIndex) {
      setActiveCardIndex(index);
    }
  };
  
  // Handler for door carousel scroll events
  const handleDoorScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    // Calculate index based on scroll position
    const doorWidth = DOOR_CARD_WIDTH + DOOR_CARD_SPACING;
    const index = Math.max(0, Math.min(
      Math.round(scrollX / doorWidth), 
      doorAccess.length - 1
    ));
    
    if (index !== activeDoorIndex) {
      setActiveDoorIndex(index);
    }
  };

  // Handler for card press
  const handleCardPress = (cardId: string) => {
    // Find the selected card
    const selectedCard = userCards.find(card => card.id === cardId);
    
    // Show card details or navigate to card detail screen
    Alert.alert(
      `${selectedCard?.name}`,
      `You selected the access card for ${selectedCard?.role}`,
      [{ text: 'OK', onPress: () => console.log('Card selected:', cardId) }]
    );
  };
  
  // Sample data for visitors
  const sampleVisitors = [
    {
      id: '1',
      name: 'Graham Stephen',
      date: '03/22/25',
      timeRange: '9:30 AM - 11:00 AM',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '2',
      name: 'Adam Smith',
      date: '03/22/25',
      timeRange: '12:30 PM - 1:30 PM',
      imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg'
    },
    {
      id: '3',
      name: 'Henry Wells',
      date: '03/22/25',
      timeRange: '3:00 PM - 4:00 PM',
      imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg'
    }
  ];

  // Sample data for doors
  const [doorAccess, setDoorAccess] = useState<DoorAccess[]>([
    {
      id: '1',
      name: 'Indy Office Dr #02',
      status: 'Locked',
    },
    {
      id: '2',
      name: 'Main Entrance',
      status: 'Locked',
    },
    {
      id: '3',
      name: 'Conference Room',
      status: 'Locked',
    },
    {
      id: '4',
      name: 'Server Room',
      status: 'Locked',
    },
    {
      id: '5',
      name: 'Executive Suite',
      status: 'Locked',
    }
  ]);

  // Track the currently unlocking door
  const [unlockingDoorId, setUnlockingDoorId] = useState<string | null>(null);

  // Handle door unlock
  const handleDoorUnlock = (doorId: string) => {
    console.log(`Door unlocked: ${doorId}`);
    
    // Set the currently unlocking door
    setUnlockingDoorId(doorId);
    
    // Update the door status to Unlocked
    setDoorAccess(doors => 
      doors.map(d => 
        d.id === doorId ? {...d, status: 'Unlocked'} : d
      )
    );
  };
  
  // Handle door lock
  const handleDoorLock = (doorId: string) => {
    console.log(`Door locked: ${doorId}`);
    
    // Clear the unlocking door
    setUnlockingDoorId(null);
    
    // Update the door status to Locked
    setDoorAccess(doors => 
      doors.map(d => 
        d.id === doorId ? {...d, status: 'Locked'} : d
      )
    );
  };

  // Proper section header that matches Figma design exactly
  const SectionHeader = ({ title }: { title: string }) => {
    const formattedTitle = title.toUpperCase();
    return <Text style={styles.sectionTitle}>{formattedTitle}</Text>;
  };

  // Add Wallet button component - properly matches Figma design
  const AddToWalletButton = ({ onPress }) => (
    <View style={styles.walletContainer}>
      <TouchableOpacity
        style={[styles.walletButton, { backgroundColor: '#2E333D' }]}
        onPress={onPress}
      >
        <View style={styles.walletButtonContent}>
          <View style={styles.walletIconContainer}>
            <SvgXml xml={walletIconSvg} width={30} height={23} />
          </View>
          <Text style={styles.walletButtonText}>Add to Apple Wallet</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Handlers for slider interaction - enhanced approach
  const handleSliderInteractionStart = () => {
    // Immediately disable carousel scrolling
    setDoorCarouselScrollEnabled(false);
  };
  
  const handleSliderInteractionEnd = () => {
    // Use requestAnimationFrame to ensure this runs on the next UI cycle
    // This prevents any race conditions with touch events
    requestAnimationFrame(() => {
      setDoorCarouselScrollEnabled(true);
    });
  };

  // Utility to scroll to a specific door
  const scrollToDoor = (index: number) => {
    if (doorScrollViewRef.current && index >= 0 && index < doorAccess.length) {
      const doorWidth = DOOR_CARD_WIDTH + DOOR_CARD_SPACING;
      const x = index * doorWidth;
      doorScrollViewRef.current.scrollTo({ x, animated: true });
      setActiveDoorIndex(index);
    }
  };

  // Handle dot press for door pagination
  const handleDoorDotPress = (index: number) => {
    scrollToDoor(index);
  };

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locationData[0]);

  // Handle location selection from bottom sheet
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsBottomSheetVisible(false);
    // In a real app, you might want to fetch data for the selected location here
  };

  return (
    <View style={styles.container}>
      <TopBar 
        title={selectedLocation.name} 
        onLocationPress={() => setIsBottomSheetVisible(true)}
        onNotificationPress={() => console.log('Notification pressed')}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <SectionHeader title="MY CARDS" />
          <View>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              pagingEnabled={false}
            >
              {userCards.map((card, index) => (
                <SimpleCard 
                  key={card.id}
                  name={card.name}
                  role={card.role}
                  index={index}
                  onPress={() => handleCardPress(card.id)}
                />
              ))}
            </ScrollView>
            
            <View style={styles.cardExtras}>
              <PaginationDots total={userCards.length} active={activeCardIndex} />
              <AddToWalletButton 
                onPress={() => Alert.alert('Add to Wallet', 'This would add the card to Apple Wallet')}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <SectionHeader title="QUICK DOOR ACCESS" />
          <View>
            <ScrollView
              ref={doorScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.doorsContainer}
              snapToInterval={DOOR_CARD_WIDTH + DOOR_CARD_SPACING}
              decelerationRate="fast"
              pagingEnabled={false}
              scrollEventThrottle={16}
              snapToAlignment="start"
              scrollEnabled={doorCarouselScrollEnabled}
              onScroll={handleDoorScroll}
              directionalLockEnabled={true}
              onMomentumScrollEnd={handleDoorScroll}
              keyboardShouldPersistTaps="handled"
            >
              {doorAccess.map((door) => (
                <View key={door.id} style={styles.doorCardWrapper}>
                  <SwipeUnlock
                    doorName={door.name}
                    doorStatus={door.status}
                    onUnlock={() => handleDoorUnlock(door.id)}
                    onLock={() => handleDoorLock(door.id)}
                    onSliderInteractionStart={handleSliderInteractionStart}
                    onSliderInteractionEnd={handleSliderInteractionEnd}
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.doorPaginationContainer}>
              <PaginationDots 
                total={doorAccess.length} 
                active={activeDoorIndex}
                onDotPress={handleDoorDotPress}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.visitorContainer}>
            <VisitorsList 
              visitors={sampleVisitors} 
              showTitle={true}
              title="UPCOMING VISITORS"
              onInvitePress={() => Alert.alert('Invite', 'This would open the visitor invite flow')}
            />
          </View>
        </View>
      </ScrollView>
      
      <LocationBottomSheet
        visible={isBottomSheetVisible}
        locations={locationData}
        selectedLocationId={selectedLocation.id}
        onClose={() => setIsBottomSheetVisible(false)}
        onSelectLocation={handleLocationSelect}
      />
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
  scrollContainer: {
    paddingBottom: 32, // Increased padding at bottom for more space above BottomNavigation
    paddingTop: 16,
  },
  section: {
    marginBottom: 32, // Increased spacing between sections for better visual separation
  },
  cardsContainer: {
    paddingLeft: APP_HORIZONTAL_MARGIN,
    paddingRight: APP_HORIZONTAL_MARGIN - CARD_SPACING, // Adjust right padding to account for card spacing
  },
  cardWrapper: {
    marginRight: CARD_SPACING,
  },
  componentContainer: {
    paddingHorizontal: APP_HORIZONTAL_MARGIN,
  },
  visitorContainer: {
    paddingHorizontal: APP_HORIZONTAL_MARGIN,
    marginBottom: 8, // Add some bottom spacing
  },
  sectionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    lineHeight: 12, // 1.2em × 10px
    letterSpacing: 2.5, // 25% of font size
    textTransform: 'uppercase',
    color: '#B6BDCD', // Exact color from Figma
    marginBottom: 16, // Space between title and content
    paddingHorizontal: APP_HORIZONTAL_MARGIN, // 16px padding from sides
  },
  walletContainer: {
    width: CARD_WIDTH, // Match card width
    marginTop: 20, // Increased from 12px to 20px to add more space above the button
    marginBottom: 8, // Reduced from 24 to 8 to bring closer to pagination dots
    borderRadius: 10,
    overflow: 'hidden', // For the gradient to respect border radius
    // Shadow for iOS
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 1,
    // Shadow for Android
    elevation: 6,
  },
  walletButton: {
    width: '100%',
    paddingVertical: 16, // Vertical padding per Figma (16px)
    paddingHorizontal: 24, // Horizontal padding per Figma (24px)
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E333D', // Exact dark gray from Figma
  },
  walletButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Space between icon and text
  },
  walletIconContainer: {
    borderRadius: 4, // 4px rounded edges for the icon only  
    overflow: 'hidden', // Ensure the rounded corners are visible
  },
  walletButtonText: {
    color: '#FFFFFF', // White text per Figma
    fontFamily: 'Outfit-Medium', // Medium weight per Figma
    fontSize: 16, // Font size per Figma (16px)
    lineHeight: 24, // Line height per Figma (1.5em = 24px)
  },
  cardExtras: {
    alignItems: 'center',
    marginTop: 16, // Restored to original 16px spacing
  },
  doorsContainer: {
    paddingLeft: APP_HORIZONTAL_MARGIN,
    paddingRight: APP_HORIZONTAL_MARGIN, // Equal padding on both sides
    flexDirection: 'row',
  },
  doorCardWrapper: {
    marginRight: DOOR_CARD_SPACING,
  },
  doorPaginationContainer: {
    alignItems: 'center',
    marginTop: 8, // Reduced from 16px to 8px to bring dots closer to door cards
    marginBottom: 8,
  },
});

export default HomeScreen; 