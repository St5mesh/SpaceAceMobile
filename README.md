# SpaceAce Mobile

A comprehensive companion app for **Space Aces: Voyages in Infinite Space** tabletop RPG, built with React Native and Expo.

## Features

### 🎲 Complete Game Management
- **Character Management** - Create and manage your Space Ace with stats, inventory, and progression tracking
- **Ship Management** - Design your ship with health tracking, damage/repair system, and modules
- **Mission Tracking** - Objective-based missions with progress tracking and rewards
- **Dice Rolling** - Advanced D20/D6 roller with advantage/disadvantage modes and haptic feedback
- **Session Management** - Track your gameplay sessions with automatic logging
- **Galaxy Exploration** - Hex-based sector system with discovery and travel mechanics

### 📊 Smart Automation
- **Automatic Logging** - All rolls, travel, damage, and mission progress automatically logged
- **Session Journaling** - Comprehensive timeline of your adventures with filtering
- **State Persistence** - All data saved locally, no internet required
- **Real-time Updates** - Character stats, ship health, and mission progress update instantly

### 🎨 Polished Experience
- **Intuitive Navigation** - Bottom tab navigation with modal screens
- **Responsive Design** - Works great on phones and tablets
- **Haptic Feedback** - Vibration feedback for rolls and confirmations
- **Theme Support** - Light, dark, and auto themes
- **Accessibility** - Large touch targets and screen reader support

## Technical Stack

- **React Native** with Expo for cross-platform mobile development
- **TypeScript** for type safety and better developer experience
- **Redux Toolkit** for state management with automatic persistence
- **React Navigation** for navigation and deep linking
- **Expo Haptics** for tactile feedback
- **Ionicons** for consistent iconography

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd SpaceAceMobile

# Install dependencies
npm install

# Start the development server
npm run web      # For web development
npm run android  # For Android (requires Android Studio)
npm run ios      # For iOS (requires Xcode on macOS)
```

### Building for Production

```bash
# Build for web
npx expo export --platform web

# Build for mobile (requires Expo Application Services)
npx expo build:android
npx expo build:ios
```

## Usage Guide

### Getting Started
1. **Create Character** - Start by creating your Space Ace character with species, career, and initial stats
2. **Design Ship** - Build your ship with purpose, personality, and specifications
3. **Start Session** - Begin tracking your gameplay session
4. **Explore Galaxy** - Use the hex map to explore sectors and travel between them
5. **Track Missions** - Create missions with objectives and track your progress
6. **Roll Dice** - Use the advanced dice roller for all your game mechanics
7. **Review Journal** - Check your session log to see your adventure timeline

### Key Screens

#### Home Dashboard
- Quick overview of character/ship status
- Current session information
- Quick access to dice roller and logging
- Navigation to all main features

#### Character Screen
- Full character creation and editing
- Stats management (Fame, Sway, Heat)
- Inventory tracking with items and quantities
- Real-time stat adjustments with +/- buttons

#### Ship Screen
- Ship creation and customization
- Visual health bars for shields and hull
- Damage and repair tracking with confirmation dialogs
- Modules and quirks management

#### Dice Roller
- Large, easy-to-tap D20 and D6 buttons
- Normal, advantage, and disadvantage roll modes
- Modifier system for situational bonuses/penalties
- Roll history with timestamps
- Automatic session logging option

#### Galaxy Map
- Simple hex grid visualization
- Sector discovery system
- One-tap hypersurf travel
- Automatic travel logging
- Sector details with encounter/mission links

#### Mission Tracker
- Kanban-style organization (Not Started, In Progress, Complete)
- Objective checklists with tap-to-toggle
- Reward tracking with Fame/Sway bonuses
- Mission creation with multiple objectives

#### Journal
- Timeline view of all session activities
- Filtering by type (rolls, travel, missions, etc.)
- Quick note adding
- Rich context for automatic entries

#### Settings & More
- Theme selection and preferences
- Haptic feedback and auto-logging toggles
- Campaign statistics
- Data export and reset options

## Data Management

### Local Storage
All data is stored locally on your device using Redux Persist. No internet connection required for any functionality.

### Export/Import
- Export campaign data as JSON for backup or sharing
- Manual import from JSON files
- Reset functionality to start fresh

### Data Structure
The app manages several core entities:
- **Character** - Player character with stats and inventory
- **Ship** - Vessel with health, modules, and personality
- **Sectors** - Galaxy locations with hex coordinates
- **Missions** - Objective-based tasks with rewards
- **Sessions** - Gameplay periods with automatic logging
- **Rolls** - Dice roll history with context
- **Log Entries** - Timeline of all game events

## Offline-First Design

SpaceAce Mobile is designed to work completely offline:
- No network permissions required
- All features work without internet
- Data persisted locally across app restarts
- Export functionality uses device sharing capabilities

## Contributing

This is a community project for Space Aces enthusiasts. Contributions welcome!

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes with TypeScript
4. Test on both web and mobile platforms
5. Submit a pull request

### Code Style
- TypeScript for all new code
- Redux Toolkit for state management
- React Navigation for routing
- Expo conventions for mobile features
- ESLint and Prettier for code formatting

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Space Aces: Voyages in Infinite Space** RPG creators
- React Native and Expo communities
- All contributors and testers

---

Built with ❤️ for Space Aces players everywhere!