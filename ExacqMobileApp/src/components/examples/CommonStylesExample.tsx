import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { CommonStyles } from '../../styles';
import { UI_COLORS, UI_TYPOGRAPHY, applyTypography } from '../../design-system';

/**
 * Example component that demonstrates how to use CommonStyles
 */
const CommonStylesExample: React.FC = () => {
  return (
    <View style={CommonStyles.container}>
      <ScrollView contentContainerStyle={CommonStyles.contentContainer}>
        <Text style={CommonStyles.title}>Common Styles Example</Text>
        <Text style={CommonStyles.subtitle}>This screen demonstrates reusable styles from CommonStyles.ts</Text>
        
        <View style={CommonStyles.mb24}>
          <Text style={CommonStyles.sectionTitle}>Layout Styles</Text>
          
          <View style={[CommonStyles.card, CommonStyles.mb16]}>
            <Text style={CommonStyles.bodyText}>Container with card style</Text>
          </View>
          
          <View style={[CommonStyles.row, CommonStyles.mb16, { backgroundColor: UI_COLORS.BACKGROUND.CARD, padding: 16 }]}>
            <Text style={CommonStyles.bodyText}>Row layout</Text>
            <View style={{ flex: 1 }} />
            <Text style={CommonStyles.bodyTextSecondary}>with space between</Text>
          </View>
          
          <View style={[CommonStyles.centerContent, CommonStyles.mb16, { height: 80, backgroundColor: UI_COLORS.BACKGROUND.CARD_ALT }]}>
            <Text style={CommonStyles.bodyText}>Centered content</Text>
          </View>
          
          <View style={[CommonStyles.spaceBetween, CommonStyles.ph16, CommonStyles.pv16, CommonStyles.mb16, { backgroundColor: UI_COLORS.BACKGROUND.CARD }]}>
            <Text style={CommonStyles.bodyText}>Space between</Text>
            <Text style={CommonStyles.bodyTextSecondary}>items aligned</Text>
          </View>
        </View>
        
        <View style={CommonStyles.mb24}>
          <Text style={CommonStyles.sectionTitle}>Typography Styles</Text>
          
          <View style={CommonStyles.card}>
            <Text style={CommonStyles.title}>Title Text</Text>
            <Text style={CommonStyles.subtitle}>Subtitle Text</Text>
            <Text style={CommonStyles.sectionTitle}>Section Title</Text>
            <Text style={CommonStyles.bodyText}>Body Text - Primary</Text>
            <Text style={CommonStyles.bodyTextSecondary}>Body Text - Secondary</Text>
            <Text style={CommonStyles.labelText}>Label Text</Text>
            <Text style={CommonStyles.captionText}>Caption Text</Text>
          </View>
        </View>
        
        <View style={CommonStyles.mb24}>
          <Text style={CommonStyles.sectionTitle}>Button Styles</Text>
          
          <TouchableOpacity style={[CommonStyles.button, CommonStyles.mb16]}>
            <Text style={CommonStyles.buttonText}>Primary Button</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[CommonStyles.buttonDisabled, CommonStyles.mb16]}>
            <Text style={CommonStyles.buttonText}>Disabled Button</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[CommonStyles.buttonSmall, CommonStyles.mb16]}>
            <Text style={CommonStyles.buttonTextSmall}>Small Button</Text>
          </TouchableOpacity>
        </View>
        
        <View style={CommonStyles.mb24}>
          <Text style={CommonStyles.sectionTitle}>Utility Styles</Text>
          
          <View style={[CommonStyles.card, CommonStyles.mb16]}>
            <Text style={CommonStyles.bodyText}>Card with shadow</Text>
          </View>
          
          <View style={CommonStyles.mb16}>
            <View style={CommonStyles.separator} />
            <Text style={[CommonStyles.bodyText, CommonStyles.mt8]}>Separator line above</Text>
          </View>
          
          <View style={[{ height: 100, width: 100, backgroundColor: UI_COLORS.PRIMARY.DEFAULT }, CommonStyles.roundedImage, CommonStyles.mb16, CommonStyles.centerContent]}>
            <Text style={{ color: '#FFFFFF' }}>Rounded Box</Text>
          </View>
        </View>
        
        <View style={CommonStyles.mb24}>
          <Text style={CommonStyles.sectionTitle}>Spacing Utilities</Text>
          
          <View style={[CommonStyles.card, CommonStyles.mb16]}>
            <Text style={CommonStyles.bodyText}>mb16 - 16pt margin bottom</Text>
          </View>
          
          <View style={[CommonStyles.row, { backgroundColor: UI_COLORS.BACKGROUND.CARD, padding: 8 }]}>
            <View style={[{ width: 40, height: 40, backgroundColor: UI_COLORS.PRIMARY.DEFAULT }, CommonStyles.mr8]} />
            <View style={[{ width: 40, height: 40, backgroundColor: UI_COLORS.PRIMARY.DEFAULT }, CommonStyles.mr8]} />
            <View style={[{ width: 40, height: 40, backgroundColor: UI_COLORS.PRIMARY.DEFAULT }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CommonStylesExample; 