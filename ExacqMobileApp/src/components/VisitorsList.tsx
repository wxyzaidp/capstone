import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Visitor {
  id: string;
  name: string;
  date: string;
  timeRange: string;
  imageUrl: string;
}

interface VisitorsListProps {
  visitors?: Visitor[];
  onInvitePress?: () => void;
  showTitle?: boolean;
  title?: string;
}

const VisitorsList: React.FC<VisitorsListProps> = ({ 
  visitors,
  onInvitePress,
  showTitle = false,
  title = "UPCOMING VISITORS"
}) => {
  // Default sample data matching Figma
  const displayVisitors = visitors?.length > 0 ? visitors : [
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

  const renderVisitorItem = (item: Visitor) => (
    <View style={styles.visitorItemContainer}>
      <View style={styles.avatar}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.avatar} 
            resizeMode="cover"
          />
        ) : null}
      </View>
      <View style={styles.visitorDetails}>
        <Text 
          style={styles.visitorName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <View style={styles.timeInfo}>
          <Text 
            style={styles.timeText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.date}
          </Text>
          <View style={styles.dotSeparator} />
          <Text 
            style={styles.timeText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.timeRange}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showTitle && <Text style={styles.sectionTitle}>{title}</Text>}
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={onInvitePress}
        >
          <Feather name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.inviteText}>Invite</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.visitorsList}>
        {displayVisitors.map((visitor, index) => (
          <React.Fragment key={visitor.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.visitorItem}>
              {renderVisitorItem(visitor)}
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: '#B6BDCD',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2E333D',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inviteText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  visitorsList: {
  },
  visitorItem: {
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
  },
  visitorItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#404550',
  },
  visitorDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  visitorName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#B6BDCD',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#717C98',
  }
});

export default VisitorsList; 