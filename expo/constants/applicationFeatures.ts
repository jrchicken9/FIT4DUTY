import { 
  Shield, 
  FileText, 
  BookOpen, 
  MapPin, 
  Target, 
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Award,
  BarChart3,
  TrendingUp,
  User
} from 'lucide-react-native';

export type AppFeature = {
  id: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  icon: any;
  color: string;
  route: string;
  badges?: string[];
};

export const applicationFeatures: AppFeature[] = [
  {
    id: "mandatory-requirements",
    title: "Mandatory Requirements",
    subtitle: "Essential qualifications and documents",
    highlight: "First Step",
    icon: Shield,
    color: "#3B82F6", // Blue
    route: "/application/prerequisites",
    badges: ["Required"]
  },
  {
    id: "profile-builder",
    title: "Profile Builder",
    subtitle: "Build your professional profile",
    highlight: "Personal Brand",
    icon: User,
    color: "#10B981", // Green
    route: "/application/pre-application-prep",
    badges: ["Important"]
  },
  {
    id: "prep-pin-test",
    title: "PREP/PIN Test",
    subtitle: "Prepare and track your fitness testing",
    highlight: "Fitness",
    icon: Target,
    color: "#EF4444", // Red
    route: "/pin-test",
    badges: ["Training"]
  },
  {
    id: "interviewing-basics",
    title: "Interview Basics",
    subtitle: "LFI and panel interview foundations",
    highlight: "Communication",
    icon: Users,
    color: "#06B6D4", // Cyan
    route: "/application/lfi-interview",
    badges: ["Practice"]
  },
  {
    id: "testing-hub",
    title: "Testing Hub (OACP + More)",
    subtitle: "Practice tests and study tools",
    highlight: "Test Prep",
    icon: BookOpen,
    color: "#F59E0B", // Amber
    route: "/practice-tests",
    badges: ["Practice"]
  },
  {
    id: "analytics",
    title: "Application Insights",
    subtitle: "Monitor your journey progress",
    highlight: "Insights",
    icon: BarChart3,
    color: "#84CC16", // Lime
    route: "/application/analytics",
    badges: ["Tracking"]
  }
];

// Feature flags
export const ENABLE_OACP_FITNESS_LOGS = true;

export default applicationFeatures;
