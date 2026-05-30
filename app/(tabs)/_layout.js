import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useTheme } from '../../utils/theme';

const TabIcon = ({ emoji, focused, colors }) => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 30,
      borderRadius: 15,
      backgroundColor: focused ? colors.primaryLight : 'transparent',
    }}
  >
    <Text style={{ fontSize: 18 }}>{emoji}</Text>
  </View>
);

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'Inter-Bold', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: 'Medicines',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="💊" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health Log',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🩺" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} colors={colors} />,
        }}
      />
    </Tabs>
  );
}
