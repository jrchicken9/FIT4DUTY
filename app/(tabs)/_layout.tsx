import { useState } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
            backgroundColor: Colors.primary,
            borderTopColor: Colors.policeRedBorder,
            borderTopWidth: 2,
            height: 55 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 4,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            ...shadows.medium,
          },
          headerStyle: {
            backgroundColor: Colors.primary,
            borderBottomColor: Colors.policeRedBorder,
            borderBottomWidth: 1,
            height: 100, // Standardized header height
            elevation: 0, // Remove Android elevation
            shadowOpacity: 0, // Remove iOS shadow
            shadowOffset: { width: 0, height: 0 }, // Remove shadow offset
          },
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
            fontSize: 11,
          },
          tabBarIconStyle: {
            marginTop: 1,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} size={20} />,
          }}
        />
        <Tabs.Screen
          name="application"
          options={{
            title: "Application",
            tabBarIcon: ({ focused }) => <TabIcon name="application" focused={focused} size={20} />,
          }}
        />
        <Tabs.Screen
          name="fitness"
          options={{
            title: "Fitness",
            tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} size={20} />,
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