import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { MainTabParamList } from './types';
import { useTheme } from '@/theme/ThemeContext';
import { HomeDashboardScreen } from '@/screens/home/HomeDashboardScreen';
import { AlertFeedScreen } from '@/screens/alerts/AlertFeedScreen';
import { TrendsOverviewScreen } from '@/screens/trends/TrendsOverviewScreen';
import { ProfileHomeScreen } from '@/screens/profile/ProfileHomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy placeholder — the SOS tab intercepts press and pushes the root-stack
// SOS flow instead of rendering this screen (see tabPress listener below).
const SOSPlaceholder: React.FC = () => <View style={{ flex: 1 }} />;

const ICONS: Record<keyof MainTabParamList, string> = {
  HomeTab: 'home',
  AlertsTab: 'notifications',
  SOSTab: 'alert-circle',
  TrendsTab: 'trending-up',
  ProfileTab: 'person',
};

export const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={
              route.name === 'SOSTab'
                ? 'alert-circle'
                : (focused ? ICONS[route.name as keyof MainTabParamList] : `${ICONS[route.name as keyof MainTabParamList]}-outline`) as string
            }
            size={route.name === 'SOSTab' ? size + 6 : size}
            color={route.name === 'SOSTab' ? colors.danger : color}
          />
        ),
        tabBarLabel:
          route.name === 'HomeTab'
            ? 'Home'
            : route.name === 'AlertsTab'
            ? 'Alerts'
            : route.name === 'SOSTab'
            ? 'SOS'
            : route.name === 'TrendsTab'
            ? 'Trends'
            : 'Profile',
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeDashboardScreen} />
      <Tab.Screen name="AlertsTab" component={AlertFeedScreen} />
      <Tab.Screen
        name="SOSTab"
        component={SOSPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('SOSConfirmation');
          },
        })}
      />
      <Tab.Screen name="TrendsTab" component={TrendsOverviewScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileHomeScreen} />
    </Tab.Navigator>
  );
};
