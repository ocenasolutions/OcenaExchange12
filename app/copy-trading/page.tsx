"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Copy, TrendingUp, Award, Shield, BarChart3, UserPlus, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Trader {
  id: string
  name: string
  avatar: string
  verified: boolean
  totalReturn: number
  monthlyReturn: number
  winRate: number
  followers: number
  aum: number
  riskLevel: "low" | "medium" | "high"
  description: string
  isFollowing: boolean
}

const mockTraders: Trader[] = [
  {
    id: "1",
    name: "CryptoMaster",
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
    totalReturn: 245.6,
    monthlyReturn: 18.4,
    winRate: 78.5,
    followers: 15420,
    aum: 2450000,
    riskLevel: "medium",
    description: "Professional trader with 8+ years experience in crypto markets.",
    isFollowing: false,
  },
  {
    id: "2",
    name: "DeFiExpert",
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
    totalReturn: 189.3,
    monthlyReturn: 15.7,
    winRate: 72.1,
    followers: 8950,
    aum: 1250000,
    riskLevel: "high",
    description: "Specialized in DeFi protocols and yield farming strategies.",
    isFollowing: true,
  },
]

export default function CopyTradingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [traders, setTraders] = useState<Trader[]>(mockTraders)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    setTimeout(() => setLoading(false), 1000)
  }, [status, router])

  const handleFollowTrader = (traderId: string) => {
    setTraders((prev) =>
      prev.map((trader) => (trader.id === traderId ? { ...trader, isFollowing: !trader.isFollowing } : trader)),
    )

    const trader = traders.find((t) => t.id === traderId)
    toast({
      title: trader?.isFollowing ? "Unfollowed" : "Following",
      description: `You are now ${trader?.isFollowing ? "not following" : "following"} ${trader?.name}`,
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Copy Trading
          </h1>
          <p className="text-muted-foreground">Follow and copy successful traders automatically</p>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Copy Balance</p>
                      <p className="text-2xl font-bold">$12,450.00</p>
                    </div>
                    <Copy className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total P&L</p>
                      <p className="text-2xl font-bold text-green-600">+$2,456</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Following</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                    <UserPlus className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold">75.5%</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {traders.map((trader) => (
                <Card key={trader.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                          <AvatarFallback>{trader.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold">{trader.name}</h3>
                            {trader.verified && <Shield className="w-4 h-4 text-blue-600" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{trader.followers.toLocaleString()} followers</p>
                        </div>
                      </div>
                      <Button
                        variant={trader.isFollowing ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFollowTrader(trader.id)}
                      >
                        {trader.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{trader.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Return</p>
                        <p className="font-bold text-green-600">+{trader.totalReturn}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Return</p>
                        <p className="font-bold text-green-600">+{trader.monthlyReturn}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="font-bold">{trader.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AUM</p>
                        <p className="font-bold">${(trader.aum / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Risk:</span>
                        <span className={`font-semibold ${getRiskColor(trader.riskLevel)}`}>
                          {trader.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {traders
                .filter((trader) => trader.isFollowing)
                .map((trader) => (
                  <Card key={trader.id} className="bg-gradient-to-r from-blue-50/50 to-green-50/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                            <AvatarFallback>{trader.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold">{trader.name}</h3>
                            <p className="text-sm text-muted-foreground">Copy Amount: $5,000</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">COPYING</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Today's P&L</p>
                          <p className="font-bold text-green-600">+$125.50</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total P&L</p>
                          <p className="font-bold text-green-600">+$1,245.80</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-bold text-green-600">+24.9%</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          Adjust Amount
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          Stop Copying
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {traders.filter((trader) => trader.isFollowing).length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Traders Followed</h3>
                <p className="text-mute-foreground mb-4">Start following successful traders to copy their strategies</p>
                <Button>Discover Traders</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Copy Trading Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Portfolio analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
