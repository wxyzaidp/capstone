import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../design-system';
import MoreTopBar from '../components/MoreTopBar';
import { Feather } from '@expo/vector-icons';
import CustomToggle from '../components/ui/CustomToggle';

interface MoreScreenProps {
  onNavigateToHome?: () => void;
}

const MoreScreen: React.FC<MoreScreenProps> = ({ onNavigateToHome }) => {
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Mock user profile data
  const user = {
    name: 'Jacob B',
    role: 'Administrator',
    email: 'jacob.b@exacq.com',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  };

  const handleBackPress = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Menu sections with items
  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'My Profile',
          icon: 'user',
          action: () => console.log('Profile pressed')
        },
        {
          id: 'credentials',
          title: 'Credentials & Access',
          icon: 'key',
          action: () => console.log('Credentials pressed')
        },
        {
          id: 'logs',
          title: 'Access Logs',
          icon: 'clock',
          action: () => console.log('Logs pressed')
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'bell',
          toggle: true,
          value: notificationsEnabled,
          onToggle: (value) => setNotificationsEnabled(value)
        },
        {
          id: 'biometric',
          title: 'Biometric Authentication',
          icon: 'shield',
          toggle: true,
          value: biometricEnabled,
          onToggle: (value) => setBiometricEnabled(value)
        },
        {
          id: 'location',
          title: 'Location Services',
          icon: 'map-pin',
          toggle: true,
          value: locationEnabled,
          onToggle: (value) => setLocationEnabled(value)
        }
      ]
    },
    {
      title: 'System',
      items: [
        {
          id: 'appearance',
          title: 'Dark Mode',
          icon: 'moon',
          toggle: true,
          value: darkModeEnabled,
          onToggle: (value) => setDarkModeEnabled(value)
        },
        {
          id: 'help',
          title: 'Help & Support',
          icon: 'help-circle',
          action: () => console.log('Help pressed')
        },
        {
          id: 'about',
          title: 'About Exacq Mobile',
          icon: 'info',
          action: () => console.log('About pressed')
        }
      ]
    }
  ];

  const renderProfileSection = () => (
    <View style={styles.profileContainer}>
      <Image 
        source={{ uri: user.profileImage }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileRole}>{user.role}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.menuItem}
      onPress={item.toggle ? undefined : item.action}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Feather name={item.icon} size={20} color={UI_COLORS.TEXT.PRIMARY} />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      
      {item.toggle ? (
        <CustomToggle
          value={item.value}
          onValueChange={item.onToggle}
        />
      ) : (
        <Feather name="chevron-right" size={20} color={UI_COLORS.TEXT.SECONDARY} />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section, index) => (
    <View key={section.title} style={[styles.section, index > 0 && styles.sectionMargin]}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderMenuItem)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MoreTopBar 
        title="Settings & More"
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderProfileSection()}
        
        {menuSections.map(renderSection)}

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Exacq Mobile v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: UI_COLORS.BORDER.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(70, 78, 97, 0.25)',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    ...applyTypography(UI_TYPOGRAPHY.HEADING_2, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 4,
  },
  profileRole: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    marginBottom: 4,
  },
  profileEmail: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_SMALL, {
      color: UI_COLORS.TEXT.TERTIARY,
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionMargin: {
    marginTop: 8,
  },
  sectionTitle: {
    ...applyTypography(UI_TYPOGRAPHY.CATEGORY, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: UI_COLORS.BORDER.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(70, 78, 97, 0.25)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
  },
  logoutButton: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: UI_COLORS.BORDER.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(70, 78, 97, 0.25)',
  },
  logoutText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_MEDIUM, {
      color: '#F26D5F',
    }),
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_SMALL, {
      color: UI_COLORS.TEXT.TERTIARY,
    }),
  },
});

export default MoreScreen; 