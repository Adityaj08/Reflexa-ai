import React from "react";
import { Tabs } from "expo-router";
import { Book, BarChart2, User } from "lucide-react-native";
import { useTheme } from "@/store/ThemeContext";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from 'expo-blur';

function TabBarIcon({ Icon, color }: { Icon: any; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Icon size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { theme, themeType } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeType === 'dark' || themeType === 'default' ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: themeType === 'dark' || themeType === 'default' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        tabBarBackground: () => (
          <BlurView
            tint={themeType === 'dark' || themeType === 'default' ? 'dark' : 'light'}
            intensity={100}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 30,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 32,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarItemStyle: {
          height: 70,
          paddingVertical: 10,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 32,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Journal",
          tabBarIcon: ({ color }) => (
            <TabBarIcon Icon={Book} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <TabBarIcon Icon={BarChart2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabBarIcon Icon={User} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flex: 1,
  },
});