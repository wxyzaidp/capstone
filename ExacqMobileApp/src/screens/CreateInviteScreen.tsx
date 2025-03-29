import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView 
} from 'react-native';
import { UI_COLORS } from '../design-system';
import ChevronIcon from '../components/icons/ChevronIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import ContactSelectionScreen from './ContactSelectionScreen';

interface CreateInviteScreenProps {
  onClose: () => void;
  onCreateInvite?: (inviteData: InviteData) => void;
}

interface InviteData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  validFrom: string;
  validUntil: string;
  hostName: string;
  reasonForVisit?: string;
  notesForVisitor?: string;
  notesForReception?: string;
}

enum DatePickerField {
  NONE,
  VALID_FROM,
  VALID_UNTIL
}

enum ContactSelectionField {
  NONE,
  VISITOR,
  HOST
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  role?: string;
}

const CreateInviteScreen: React.FC<CreateInviteScreenProps> = ({ 
  onClose,
  onCreateInvite 
}) => {
  // Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState<DatePickerField>(DatePickerField.NONE);
  const [validFromDate, setValidFromDate] = useState<Date>(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  });

  // Contact selection state
  const [contactSelectionField, setContactSelectionField] = useState<ContactSelectionField>(ContactSelectionField.NONE);

  // Form state
  const [inviteData, setInviteData] = useState<InviteData>({
    visitorName: 'Jamie Robbins',
    visitorEmail: 'Jamie@jci.com',
    visitorPhone: '',
    validFrom: formatDateTime(validFromDate),
    validUntil: formatDateTime(validUntilDate),
    hostName: 'Jorge Scott',
    reasonForVisit: '',
    notesForVisitor: 'Come on 2nd Floor. Room 204',
    notesForReception: ''
  });

  // Sample contacts data
  const visitors: Contact[] = [
    {
      id: '1',
      name: 'Jamie Robbins',
      email: 'Jamie@jci.com',
      imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
      role: 'Johnson Controls'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Marketing Director'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.b@partners.org',
      imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
      role: 'Client'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma.w@associates.net',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      role: 'Consultant'
    }
  ];

  const hosts: Contact[] = [
    {
      id: '1',
      name: 'Jorge Scott',
      email: 'jorge.s@jci.com',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'Security Manager'
    },
    {
      id: '2',
      name: 'Alex Turner',
      email: 'alex.t@jci.com',
      imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
      role: 'Director of Operations'
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria.r@jci.com',
      imageUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
      role: 'Office Manager'
    }
  ];

  // Format date for display
  function formatDateTime(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert hour '0' to '12'
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${dayName}, ${monthName} ${day}, ${hours}:${minutesStr} ${ampm}`;
  }

  // Update form fields
  const updateField = (field: keyof InviteData, value: string) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle create invite
  const handleCreateInvite = () => {
    if (onCreateInvite) {
      onCreateInvite(inviteData);
    }
    onClose();
  };

  // Handle opening date picker for a specific field
  const handleOpenDatePicker = (field: DatePickerField) => {
    setDatePickerVisible(field);
  };

  // Handle opening contact selection for a specific field
  const handleOpenContactSelection = (field: ContactSelectionField) => {
    setContactSelectionField(field);
  };

  // Handle contact selection
  const handleContactSelected = (contact: Contact) => {
    if (contactSelectionField === ContactSelectionField.VISITOR) {
      setInviteData(prev => ({
        ...prev,
        visitorName: contact.name,
        visitorEmail: contact.email || '',
        visitorPhone: contact.phone || ''
      }));
    } else if (contactSelectionField === ContactSelectionField.HOST) {
      setInviteData(prev => ({
        ...prev,
        hostName: contact.name
      }));
    }
    setContactSelectionField(ContactSelectionField.NONE);
  };

  // Handle date change from the date picker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(DatePickerField.NONE);
    }

    if (selectedDate) {
      if (datePickerVisible === DatePickerField.VALID_FROM) {
        setValidFromDate(selectedDate);
        updateField('validFrom', formatDateTime(selectedDate));
      } else if (datePickerVisible === DatePickerField.VALID_UNTIL) {
        setValidUntilDate(selectedDate);
        updateField('validUntil', formatDateTime(selectedDate));
      }
    }
  };

  // Handle closing the date picker on iOS
  const handleIOSDatePickerDone = () => {
    setDatePickerVisible(DatePickerField.NONE);
  };

  // Handle closing contact selection
  const handleCloseContactSelection = () => {
    setContactSelectionField(ContactSelectionField.NONE);
  };

  // Render text input field
  const renderInputField = (
    label: string, 
    field: keyof InviteData, 
    placeholder: string = '',
    hasChevron: boolean = false,
    optional: boolean = false
  ) => {
    const value = inviteData[field];
    const showLabel = Boolean(value) || optional;
    
    // For date fields, handle special click behavior
    const handlePress = () => {
      if (field === 'validFrom') {
        handleOpenDatePicker(DatePickerField.VALID_FROM);
      } else if (field === 'validUntil') {
        handleOpenDatePicker(DatePickerField.VALID_UNTIL);
      } else if (field === 'visitorName') {
        handleOpenContactSelection(ContactSelectionField.VISITOR);
      } else if (field === 'hostName') {
        handleOpenContactSelection(ContactSelectionField.HOST);
      } else if (hasChevron) {
        console.log(`Open selection for ${field}`);
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        {showLabel && (
          <Text style={styles.inputLabel}>
            {label}{optional ? ' (optional)' : ''}
          </Text>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => updateField(field, text)}
          placeholder={!showLabel ? label : placeholder}
          placeholderTextColor="#B6BDCD"
          editable={!hasChevron && field !== 'validFrom' && field !== 'validUntil' && field !== 'visitorName' && field !== 'hostName'}
          pointerEvents={hasChevron || field === 'validFrom' || field === 'validUntil' || field === 'visitorName' || field === 'hostName' ? 'none' : 'auto'}
        />
        {hasChevron && (
          <ChevronIcon 
            direction="right" 
            width={20} 
            height={20} 
            fill="#FFFFFF" 
          />
        )}
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // If contact selection is active, show the contact selection screen
  if (contactSelectionField !== ContactSelectionField.NONE) {
    return (
      <ContactSelectionScreen
        onClose={handleCloseContactSelection}
        onSelectContact={handleContactSelected}
        title={contactSelectionField === ContactSelectionField.VISITOR ? 'Select Visitor' : 'Select Host'}
        contacts={contactSelectionField === ContactSelectionField.VISITOR ? visitors : hosts}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
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
            {/* Visitor Information Section */}
            <View style={styles.section}>
              {renderSectionHeader('Visitor Information')}
              <View style={styles.formSection}>
                {renderInputField('Visitor Name', 'visitorName', '', true)}
                {renderInputField('Visitor Email', 'visitorEmail')}
                {renderInputField('Phone Number', 'visitorPhone', '', false, true)}
              </View>
            </View>

            {/* Invite Duration Section */}
            <View style={styles.section}>
              {renderSectionHeader('Invite Duration')}
              <View style={styles.formSection}>
                {renderInputField('Valid From', 'validFrom', '', true)}
                {renderInputField('Valid Until', 'validUntil', '', true)}
              </View>
            </View>

            {/* Visit Details Section */}
            <View style={styles.section}>
              {renderSectionHeader('Visit Details')}
              <View style={styles.formSection}>
                {renderInputField('Host Name', 'hostName', '', true)}
                {renderInputField('Reason for Visit', 'reasonForVisit', '', false, true)}
                {renderInputField('Notes for Visitor', 'notesForVisitor', '', false, true)}
                {renderInputField('Notes for Reception', 'notesForReception', '', false, true)}
              </View>
            </View>

            {/* Bottom padding for content scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Bottom Bar with Create Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateInvite}
            >
              <Text style={styles.createButtonText}>Create Invite</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Date Picker Modal (conditionally rendered) */}
        {datePickerVisible !== DatePickerField.NONE && (
          <>
            {Platform.OS === 'ios' && (
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={handleIOSDatePickerDone} style={styles.datePickerDoneButton}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={datePickerVisible === DatePickerField.VALID_FROM ? validFromDate : validUntilDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              style={Platform.OS === 'ios' ? styles.datePicker : {}}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#23262D', // Status bar background color
  },
  container: {
    flex: 1,
    backgroundColor: '#131515', // Dark background from Figma
  },
  topBar: {
    backgroundColor: '#1E2021', 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
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
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Outfit-Medium',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#717C98',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    marginBottom: 8,
  },
  inputLabel: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 12,
    color: '#B6BDCD',
    fontFamily: 'Outfit-Regular',
    lineHeight: 16,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    paddingTop: 16, // To make room for the label
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100, // Extra padding to ensure content is scrollable above the bottom bar
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
    backgroundColor: '#6FDCFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#131515',
  },
  datePicker: {
    backgroundColor: '#2E333D',
    width: '100%',
  },
  datePickerHeader: {
    backgroundColor: '#2E333D',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 78, 97, 0.5)',
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    color: '#6FDCFA',
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
  },
});

export default CreateInviteScreen; 