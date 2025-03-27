# Exacq Mobile App

A React Native mobile application for the Exacq system, built using a comprehensive design system.

## Design System

This application uses a structured design system to maintain consistency across the UI:

### Colors

The color system is organized in multiple layers:

1. **Primitive Colors** - Raw color values straight from Figma
2. **Semantic Colors** - Contextual meaning (e.g., BLUE.LIGHT, GRAY.DARK)
3. **UI Colors** - Usage-specific tokens (e.g., BACKGROUND.PAGE, TEXT.PRIMARY)
4. **Figma Token Names** - Direct mapping to Figma variables

Available palettes:
- Primary Blue
- Neutrals/Grayscale
- Teal (Secondary)
- Gold (Premium)
- Status Colors (Success, Warning, Error, Info)

### Typography

The typography system provides consistent text styling:

1. **Font Properties** - Font families, weights, sizes, line heights, etc.
2. **Typography Tokens** - Pre-defined text styles for different contexts
3. **UI Typography** - Component-specific typography mappings
4. **Figma Token Names** - Direct mapping to Figma text styles

Categories include:
- Headings (H1, H2, H3)
- Body Text (Large, Medium, Small)
- Labels (Large, Medium, Small)
- Buttons (Large, Medium, Small)
- Special (Title, Subtitle, Card Title, etc.)

### Radius

The radius system ensures consistent corner rounding:

1. **Primitive Radius** - Raw pixel values (8px, 12px, 16px, 400px)
2. **Semantic Radius** - Size-based naming (XS, S, M, CIRCLE, PILL)
3. **UI Radius** - Component-specific radius mappings
4. **Figma Token Names** - Direct mapping to Figma radius tokens

## Components

The app includes several components that use the design system:

- **Card** - Container for content with consistent styling
- **TopBar** - App header with title
- **BottomNavigation** - Tab navigation at the bottom of the screen
- **HomeScreen** - Main screen of the application

## Usage

To use the design system in your components:

```typescript
import { 
  UI_COLORS, 
  UI_TYPOGRAPHY, 
  UI_RADIUS,
  applyTypography 
} from '../design-system';

// In your StyleSheet:
const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderRadius: UI_RADIUS.CARD,
  },
  text: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.PRIMARY
    })
  }
});
```

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the Metro bundler
4. Use `npm run android` or `npm run ios` to run on a device or emulator 