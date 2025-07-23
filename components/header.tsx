"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { siteConfig } from "@/config/site"
import {
  Settings,
  LogOut,
  Wallet,
  BarChart3,
  TrendingUp,
  Coins,
  Users,
  Zap,
  Target,
  Brain,
  Copy,
  Activity,
  PieChart,
  Flame,
  Globe,
  Sparkles,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Overview and portfolio summary",
  },
  {
    name: "Markets",
    href: "/markets",
    icon: TrendingUp,
    description: "Live market data and prices",
  },
  {
    name: "Trade",
    href: "/trade",
    icon: Activity,
    description: "Spot trading interface",
  },
  {
    name: "Futures",
    href: "/futures",
    icon: Flame,
    description: "Leverage trading up to 125x",
    badge: "New",
  },
  {
    name: "Options",
    href: "/options",
    icon: Target,
    description: "Options trading with Greeks",
    badge: "Pro",
  },
  {
    name: "Copy Trading",
    href: "/copy-trading",
    icon: Copy,
    description: "Follow successful traders",
    badge: "Popular",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Brain,
    description: "Advanced market analysis",
    badge: "AI",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
    description: "Track your investments",
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
    description: "Manage your funds",
  },
  {
    name: "P2P",
    href: "/p2p",
    icon: Users,
    description: "Peer-to-peer trading",
  },
  {
    name: "NFT",
    href: "/nft",
    icon: Sparkles,
    description: "NFT marketplace",
  },
  {
    name: "Earn",
    href: "/earn",
    icon: Coins,
    description: "Staking and yield farming",
  },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "New":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Pro":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "Popular":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "AI":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3">
                  Trade
                  <Activity className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="font-semibold">Trading</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid gap-1">
                  <DropdownMenuItem asChild>
                    <Link href="/trade" className="flex items-center space-x-3 p-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Spot Trading</div>
                        <div className="text-xs text-muted-foreground">Buy and sell cryptocurrencies</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/futures" className="flex items-center space-x-3 p-3">
                      <Flame className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          Futures Trading
                          <Badge className="bg-orange-100 text-orange-800 text-xs">New</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Leverage up to 125x</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/options" className="flex items-center space-x-3 p-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          Options Trading
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Pro</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Advanced derivatives</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/copy-trading" className="flex items-center space-x-3 p-3">
                      <Copy className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          Copy Trading
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Popular</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Follow expert traders</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3">
                  Markets
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="font-semibold">Markets & Analysis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid gap-1">
                  <DropdownMenuItem asChild>
                    <Link href="/markets" className="flex items-center space-x-3 p-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Markets</div>
                        <div className="text-xs text-muted-foreground">Live prices and market data</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics" className="flex items-center space-x-3 p-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          Analytics
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">AI</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">AI-powered market insights</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3">
                  More
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="font-semibold">More Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid gap-1">
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio" className="flex items-center space-x-3 p-3">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Portfolio</div>
                        <div className="text-xs text-muted-foreground">Track your investments</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center space-x-3 p-3">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Wallet</div>
                        <div className="text-xs text-muted-foreground">Manage your funds</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/earn" className="flex items-center space-x-3 p-3">
                      <Coins className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <div className="font-medium">Earn</div>
                        <div className="text-xs text-muted-foreground">Staking and yield farming</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/p2p" className="flex items-center space-x-3 p-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium">P2P Trading</div>
                        <div className="text-xs text-muted-foreground">Peer-to-peer marketplace</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/nft" className="flex items-center space-x-3 p-3">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                      <div className="flex-1">
                        <div className="font-medium">NFT Marketplace</div>
                        <div className="text-xs text-muted-foreground">Buy, sell, and create NFTs</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search could go here */}</div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio" className="flex items-center">
                      <PieChart className="mr-2 h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
