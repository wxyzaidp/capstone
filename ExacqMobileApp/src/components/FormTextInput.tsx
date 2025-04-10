import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { UI_COLORS } from '../design-system';
import { CommonStyles } from '../styles';

// Eye icon component for password visibility toggle
const EyeIcon: React.FC<{ color: string; isVisible: boolean }> = ({ color, isVisible }) => {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      {isVisible ? (
        <Text style={{ color, fontSize: 16 }}>👁</Text>
      ) : (
        <Text style={{ color, fontSize: 16 }}>👁‍🗨</Text>
      )}
    </View>
  );
};

interface FormTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  onSubmit?: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  error?: string;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  testID?: string;
}

/**
 * A reusable text input component with floating label
 */
const FormTextInput: React.FC<FormTextInputProps> = ({
  label,
  value,
  onChangeText,
  secure = false,
  returnKeyType = 'next',
  onSubmit,
  onToggleVisibility,
  isVisible,
  error,
  rightIcon,
  containerStyle,
  testID,
  autoFocus = false,
  autoComplete,
  ...restProps
}) => {
  // Local state for this field only
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Clear selection on blur to prevent highlight issues
  const clearSelection = () => {
    if (inputRef.current) {
      inputRef.current.setNativeProps({
        selection: { start: 0, end: 0 }
      });
    }
  };
  
  const handleSubmit = () => {
    clearSelection();
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Small delay to ensure proper event order
    if (onSubmit) {
      setTimeout(onSubmit, 50);
    }
  };
  
  // Handle focus styling
  const showFloatingLabel = focused || value.length > 0;
  
  useEffect(() => {
    // Auto focus if needed, but with a delay to ensure component is fully mounted
    if (autoFocus) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View>
      <View style={[
        styles.container,
        focused ? styles.containerFocused : null,
        error ? styles.containerError : null,
        containerStyle
      ]}>
        {showFloatingLabel && (
          <Text style={styles.label}>{label}</Text>
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            showFloatingLabel ? styles.inputWithLabel : null,
          ]}
          placeholder={showFloatingLabel ? '' : label}
          placeholderTextColor="#B6BDCD"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !isVisible}
          returnKeyType={returnKeyType}
          blurOnSubmit={true}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          textContentType={secure ? 'password' : 'username'}
          autoComplete={autoComplete}
          testID={testID}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            clearSelection();
          }}
          onSubmitEditing={handleSubmit}
          selectionColor={UI_COLORS.PRIMARY.DEFAULT}
          {...restProps}
        />
        
        {secure && onToggleVisibility && (
          <TouchableOpacity 
            style={styles.visibilityToggle} 
            onPress={onToggleVisibility} 
            activeOpacity={0.7}
          >
            <EyeIcon color="#B6BDCD" isVisible={isVisible || false} />
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Styles specific to this component using CommonStyles where possible
const styles = StyleSheet.create({
  container: {
    ...CommonStyles.input,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 0, // Override padding to ensure exact height
  },
  containerFocused: {
    ...CommonStyles.inputFocused,
  },
  containerError: {
    borderColor: UI_COLORS.STATUS.ERROR,
  },
  label: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#B6BDCD',
  },
  input: {
    flex: 1,
    height: '100%',
    color: UI_COLORS.TEXT.PRIMARY,
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    paddingVertical: 0,
  },
  inputWithLabel: {
    paddingTop: 16,
  },
  visibilityToggle: {
    padding: 8,
  },
  rightIcon: {
    paddingLeft: 8,
  },
  errorText: {
    ...CommonStyles.captionText,
    color: UI_COLORS.STATUS.ERROR,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default FormTextInput; 