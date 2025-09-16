import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import GalaxyScreen from '../screens/GalaxyScreen';
import CharacterScreen from '../screens/CharacterScreen';
import ShipScreen from '../screens/ShipScreen';
import JournalScreen from '../screens/JournalScreen';
import MissionsScreen from '../screens/MissionsScreen';
import MoreScreen from '../screens/MoreScreen';
import DiceRollerScreen from '../screens/DiceRollerScreen';
import { 
  SectorDetailScreen, 
  MissionDetailScreen 
} from '../screens/PlaceholderScreens';

import { TabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Galaxy':
              iconName = focused ? 'planet' : 'planet-outline';
              break;
            case 'Missions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Journal':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Character':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Ship':
              iconName = focused ? 'rocket' : 'rocket-outline';
              break;
            case 'More':
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Galaxy" component={GalaxyScreen} />
      <Tab.Screen name="Missions" component={MissionsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Character" component={CharacterScreen} />
      <Tab.Screen name="Ship" component={ShipScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DiceRoller" 
          component={DiceRollerScreen}
          options={{ 
            presentation: 'modal',
            title: 'Dice Roller'
          }}
        />
        <Stack.Screen 
          name="SectorDetail" 
          component={SectorDetailScreen}
          options={{ title: 'Sector Details' }}
        />
        <Stack.Screen 
          name="MissionDetail" 
          component={MissionDetailScreen}
          options={{ title: 'Mission Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}