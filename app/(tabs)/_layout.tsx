import { useState } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import { typography, spacing, shadows } from "@/constants/designSystem";
import Logo from "@/components/Logo";
import TabIcon from "@/components/TabIcons";

export default function TabLayout() {
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.white,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopColor: Colors.policeRedBorder,
            borderTopWidth: 2,
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            paddingHorizontal: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            ...shadows.medium,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#1E40AF', '#3B82F6']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          ),
          headerStyle: {
            backgroundColor: 'transparent',
            borderBottomColor: Colors.policeRedBorder,
            borderBottomWidth: 1,
            height: 100, // Standardized header height
            elevation: 0, // Remove Android elevation
            shadowOpacity: 0, // Remove iOS shadow
            shadowOffset: { width: 0, height: 0 }, // Remove shadow offset
          },
          headerBackground: () => (
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: Colors.white,
          headerTitleStyle: {
            ...typography.headingMedium,
            fontWeight: "800",
            textAlign: 'center',
          },
          headerTitle: () => (
            <Logo size="small" variant="light" showText={true} />
          ),
          headerRight: () => (
            <View style={{ marginRight: spacing.md }}>
              <NotificationBell
                onPress={() => setNotificationPanelVisible(true)}
                size={24}
                showBadge={true}
              />
            </View>
          ),
          tabBarLabelStyle: {
            ...typography.labelSmall,
            fontWeight: "600",
            marginTop: 1,
            color: Colors.white + 'CC',
            fontSize: 10,
            maxWidth: 60,
          },
          tabBarIconStyle: {
            marginTop: 1,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} size={20} />,
            href: "/dashboard",
          }}
        />
        <Tabs.Screen
          name="application"
          options={{
            title: "Application",
            tabBarIcon: ({ focused }) => <TabIcon name="application" focused={focused} size={20} />,
            href: "/application",
          }}
        />
        <Tabs.Screen
          name="fitness"
          options={{
            title: "Fitness",
            tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} size={20} />,
            href: "/fitness",
          }}
        />
        {/* Temporarily hidden Community tab
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ focused }) => <TabIcon name="community" focused={focused} size={20} />,
          }}
        />
        */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} size={20} />,
            href: "/profile",
          }}
        />
      </Tabs>

      {/* Global Notification Panel */}
      <NotificationPanel
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
      />
    </>
  );
}