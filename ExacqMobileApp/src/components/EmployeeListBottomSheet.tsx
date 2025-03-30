import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';

// Define types
interface Employee {
  id: string;
  name: string;
}

interface EmployeeListBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (employee: Employee) => void;
  employees: Employee[];
}

const ACCENT_COLOR = '#6FDCFA';

const EmployeeListBottomSheet: React.FC<EmployeeListBottomSheetProps> = ({ 
  visible, 
  onClose, 
  onSelect,
  employees
}) => {
  // Animation values for bottom sheet
  const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height * 0.6;
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Show the bottom sheet
      translateY.setValue(BOTTOM_SHEET_HEIGHT);
      opacity.setValue(0);
      
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
    } else {
      // Hide the bottom sheet
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
      ]).start();
    }
  }, [visible, translateY, opacity, BOTTOM_SHEET_HEIGHT]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.bottomSheetOverlay, { opacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.bottomSheetContainer, 
                { transform: [{ translateY }] }
              ]}
            >
              {/* Bottom sheet handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              
              {/* Header */}
              <View style={styles.bottomSheetHeader}>
                <TouchableOpacity 
                  style={styles.headerButtonLeft}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={styles.headerTitleText}>Select Host</Text>
                
                <View style={styles.headerButtonRight} />
              </View>
              
              {/* Employee list */}
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {employees.map((employee) => (
                  <TouchableOpacity
                    key={employee.id}
                    style={styles.employeeItem}
                    onPress={() => onSelect(employee)}
                  >
                    <Text style={styles.employeeName}>{employee.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#23262D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: Dimensions.get('window').height * 0.9,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  employeeItem: {
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  employeeName: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default EmployeeListBottomSheet; 