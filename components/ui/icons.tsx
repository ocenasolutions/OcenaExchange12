import * as React from "react"
import {
  LucideExternalLink,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  DollarSign,
  Target,
  Shield,
  Zap,
  Award,
  Users,
  Clock,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  color?: string
  strokeWidth?: number
}

// External link icon
export const ExternalLink = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <LucideExternalLink ref={ref} size={size} color={color} strokeWidth={strokeWidth} {...props} />
  ),
)
ExternalLink.displayName = "ExternalLink"

// Export other commonly used icons
export {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  DollarSign,
  Target,
  Shield,
  Zap,
  Award,
  Users,
  Clock,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
}
