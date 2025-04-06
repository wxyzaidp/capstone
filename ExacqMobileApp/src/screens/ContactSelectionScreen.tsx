import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Image 
} from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../design-system';
import ChevronIcon from '../components/icons/ChevronIcon';

interface ContactSelectionScreenProps {
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  title: string;
  contacts: Contact[];
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  role?: string;
}

const ContactSelectionScreen: React.FC<ContactSelectionScreenProps> = ({ 
  onClose,
  onSelectContact,
  title,
  contacts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter contacts based on search query
  const filteredContacts = searchQuery.trim() === '' 
    ? contacts 
    : contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Render a contact item
  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => onSelectContact(item)}
    >
      <View style={styles.contactAvatar}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.avatarImage} 
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.avatarPlaceholder}>
            {item.name.charAt(0)}
          </Text>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.role && <Text style={styles.contactRole}>{item.role}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <ChevronIcon direction="left" width={24} height={24} fill="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor="#B6BDCD"
          />
        </View>
      </View>

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E2021',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_LARGE, {
      color: '#FFFFFF',
    }),
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
  },
  rightPlaceholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1E2021',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#2E333D',
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    height: 40,
  },
  listContainer: {
    flexGrow: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#404550',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Outfit-Medium',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
  },
  contactRole: {
    color: '#B6BDCD',
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    marginLeft: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#B6BDCD',
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
  },
});

export default ContactSelectionScreen; 