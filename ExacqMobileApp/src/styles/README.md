# Common Styles Documentation

This document provides information about using the `CommonStyles` utility in the ExacqMobileApp.

## Overview

The `CommonStyles` utility provides a collection of reusable styles to maintain consistency across the app while reducing code duplication. By leveraging these shared styles, you can ensure UI elements have a consistent look and feel, and make global style updates in a single place.

## Importing CommonStyles

```javascript
import { CommonStyles } from '../styles';
```

## Available Style Categories

### Layout Styles

Styles for common layout patterns:

```javascript
<View style={CommonStyles.container}>
  {/* Full screen container with app background */}
</View>

<View style={CommonStyles.contentContainer}>
  {/* Padded content area */}
</View>

<View style={CommonStyles.row}>
  {/* Horizontal row with aligned items */}
</View>

<View style={CommonStyles.centerContent}>
  {/* Centered content both horizontally and vertically */}
</View>

<View style={CommonStyles.spaceBetween}>
  {/* Row with items spaced evenly */}
</View>
```

### Card Styles

Styles for card components:

```javascript
<View style={CommonStyles.card}>
  {/* Standard card with shadow */}
</View>

<View style={CommonStyles.cardAlt}>
  {/* Alternative card style */}
</View>
```

### Button Styles

Styles for buttons:

```javascript
<TouchableOpacity style={CommonStyles.button}>
  <Text style={CommonStyles.buttonText}>Primary Button</Text>
</TouchableOpacity>

<TouchableOpacity style={CommonStyles.buttonDisabled}>
  <Text style={CommonStyles.buttonText}>Disabled Button</Text>
</TouchableOpacity>

<TouchableOpacity style={CommonStyles.buttonSmall}>
  <Text style={CommonStyles.buttonTextSmall}>Small Button</Text>
</TouchableOpacity>
```

### Input Styles

Styles for text inputs:

```javascript
<View style={CommonStyles.input}>
  {/* Standard input field */}
</View>

<View style={[CommonStyles.input, CommonStyles.inputFocused]}>
  {/* Focused input field */}
</View>

<Text style={CommonStyles.inputLabel}>Label</Text>
```

### Typography Styles

Text styles for consistent typography:

```javascript
<Text style={CommonStyles.title}>Title</Text>
<Text style={CommonStyles.subtitle}>Subtitle</Text>
<Text style={CommonStyles.sectionTitle}>Section Title</Text>
<Text style={CommonStyles.bodyText}>Body Text</Text>
<Text style={CommonStyles.bodyTextSecondary}>Secondary Body Text</Text>
<Text style={CommonStyles.labelText}>Label</Text>
<Text style={CommonStyles.captionText}>Caption</Text>
```

### Bottom Sheet Styles

Styles for bottom sheets:

```javascript
<View style={CommonStyles.bottomSheet}>
  {/* Bottom sheet container */}
  <View style={CommonStyles.dragBarContainer}>
    <View style={CommonStyles.dragBar} />
  </View>
  {/* Content goes here */}
</View>
```

### Utility Styles

Various utility styles:

```javascript
<View style={CommonStyles.shadow}>
  {/* Element with shadow */}
</View>

<View style={CommonStyles.overlay}>
  {/* Full screen overlay */}
</View>

<View style={CommonStyles.separator} />
{/* Horizontal separator line */}

<Image style={CommonStyles.roundedImage} source={...} />
{/* Rounded image */}
```

### Spacing Utilities

Margin and padding utilities:

```javascript
// Margin bottom utilities
<View style={CommonStyles.mb4} />  // 4px margin bottom
<View style={CommonStyles.mb8} />  // 8px margin bottom
<View style={CommonStyles.mb16} /> // 16px margin bottom
<View style={CommonStyles.mb24} /> // 24px margin bottom
<View style={CommonStyles.mb32} /> // 32px margin bottom

// Margin right utilities
<View style={CommonStyles.mr4} />  // 4px margin right
<View style={CommonStyles.mr8} />  // 8px margin right
<View style={CommonStyles.mr16} /> // 16px margin right

// Margin top utilities
<View style={CommonStyles.mt4} />  // 4px margin top
<View style={CommonStyles.mt8} />  // 8px margin top
<View style={CommonStyles.mt16} /> // 16px margin top
<View style={CommonStyles.mt24} /> // 24px margin top

// Margin left utilities
<View style={CommonStyles.ml4} />  // 4px margin left
<View style={CommonStyles.ml8} />  // 8px margin left
<View style={CommonStyles.ml16} /> // 16px margin left

// Padding utilities
<View style={CommonStyles.p8} />   // 8px padding all sides
<View style={CommonStyles.p16} />  // 16px padding all sides
<View style={CommonStyles.ph16} /> // 16px padding horizontal
<View style={CommonStyles.pv16} /> // 16px padding vertical
```

## Helper Functions

### getElevation

Get a shadow style based on elevation level (1-5):

```javascript
<View style={getElevation(2)}>
  {/* Element with level 2 elevation */}
</View>
```

### getStatusColor

Get a color based on status:

```javascript
const errorColor = getStatusColor('error');
const warningColor = getStatusColor('warning');
const successColor = getStatusColor('success');
const infoColor = getStatusColor('info');
```

## Combining Styles

You can combine multiple styles using array notation:

```javascript
<View style={[CommonStyles.card, CommonStyles.mb16]}>
  {/* Card with margin bottom */}
</View>

<Text style={[CommonStyles.bodyText, { color: 'red' }]}>
  {/* Body text with custom color */}
</Text>
```

## Example Usage

Check out the `CommonStylesExample.tsx` component for a complete demonstration of all available styles.

## Best Practices

1. Always prefer CommonStyles over inline styles when possible
2. Use array notation to combine multiple styles
3. For custom styles that aren't in CommonStyles, create component-specific styles
4. Use CommonStyles as a foundation and extend with custom styles when needed 