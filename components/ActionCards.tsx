import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Dumbbell, FileText, Users, Play } from "lucide-react-native";
import Colors from "@/constants/colors";
import { router } from "expo-router";

type ActionCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  backgroundColor: string;
  imageUrl?: string;
  onPress: () => void;
};

const ActionCards = () => {
  const actions: ActionCard[] = [
    {
      id: "fitness",
      title: "Start Training",
      subtitle: "PREP test workouts",
      icon: <Dumbbell size={24} color={Colors.white} />,
      backgroundColor: Colors.primary,
      imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=200",
      onPress: () => router.push("/fitness"),
    },
    {
      id: "application",
      title: "Application Guide",
      subtitle: "Step-by-step process",
      icon: <FileText size={24} color={Colors.white} />,
      backgroundColor: Colors.secondary,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      onPress: () => router.push("/application"),
    },
    {
      id: "community",
      title: "Join Community",
      subtitle: "Connect with others",
      icon: <Users size={24} color={Colors.white} />,
      backgroundColor: Colors.accent,
      imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=200",
      onPress: () => router.push("/community"),
    },
    {
      id: "videos",
      title: "Watch Videos",
      subtitle: "Training tutorials",
      icon: <Play size={24} color={Colors.white} />,
      backgroundColor: Colors.success,
      imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=200",
      onPress: () => router.push("/video/prep-overview"),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.card, { backgroundColor: action.backgroundColor }]}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            {action.imageUrl && (
              <Image
                source={{ uri: action.imageUrl }}
                style={styles.backgroundImage}
              />
            )}
            <View style={styles.overlay} />
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                {action.icon}
              </View>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 1,
  },
  iconContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    padding: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 16,
  },
});

export default ActionCards;