"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, TrendingUp, Calculator, Activity, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OptionContract {
  symbol: string
  type: "call" | "put"
  strike: number
  expiry: string
  premium: number
  impliedVol: number
  delta: number
  gamma: number
  theta: number
  vega: number
  volume: number
  openInterest: number
}

interface OptionPosition {
  id: string
  contractId: string
  symbol: string
  type: "call" | "put"
  strike: number
  expiry: string
  quantity: number
  entryPremium: number
  currentPremium: number
  pnl: number
  pnlPercentage: number
  delta: number
  theta: number
  daysToExpiry: number
  breakeven: number
  maxProfit: number
  maxLoss: number
  timestamp: string
  isOpen: boolean
}

interface OptionStrategy {
  name: string
  description: string
  riskLevel: "low" | "medium" | "high"
  maxProfit: string
  maxLoss: string
  breakeven: string
  marketOutlook: string
  complexity: number
  legs: Array<{
    action: "buy" | "sell"
    type: "call" | "put"
    strike: number
    quantity: number
  }>
}

const mockOptions: OptionContract[] = [
  {
    symbol: "BTC-44000-C-240201",
    type: "call",
    strike: 44000,
    expiry: "2024-02-01",
    premium: 1250.5,
    impliedVol: 65.2,
    delta: 0.45,
    gamma: 0.00012,
    theta: -15.2,
    vega: 8.5,
    volume: 89,
    openInterest: 1250,
  },
  {
    symbol: "BTC-42000-P-240201",
    type: "put",
    strike: 42000,
    expiry: "2024-02-01",
    premium: 850.25,
    impliedVol: 58.1,
    delta: -0.35,
    gamma: 0.00015,
    theta: -12.8,
    vega: 7.2,
    volume: 156,
    openInterest: 890,
  },
]

const mockOptionStrategies: OptionStrategy[] = [
  {
    name: "Long Call",
    description: "Buy a call option to profit from upward price movement",
    riskLevel: "medium",
    maxProfit: "Unlimited",
    maxLoss: "Premium paid",
    breakeven: "Strike + Premium",
    marketOutlook: "Bullish",
    complexity: 1,
    legs: [{ action: "buy", type: "call", strike: 44000, quantity: 1 }],
  },
  {
    name: "Covered Call",
    description: "Hold underlying asset and sell call option for income",
    riskLevel: "low",
    maxProfit: "Strike - Entry + Premium",
    maxLoss: "Entry - Premium",
    breakeven: "Entry - Premium",
    marketOutlook: "Neutral to Slightly Bullish",
    complexity: 2,
    legs: [
      { action: "buy", type: "call", strike: 0, quantity: 100 }, // Represents underlying
      { action: "sell", type: "call", strike: 44000, quantity: 1 },
    ],
  },
  {
    name: "Iron Condor",
    description: "Profit from low volatility by selling both call and put spreads",
    riskLevel: "medium",
    maxProfit: "Net Premium Received",
    maxLoss: "Strike Width - Net Premium",
    breakeven: "Two breakeven points",
    marketOutlook: "Neutral (Low Volatility)",
    complexity: 4,
    legs: [
      { action: "sell", type: "put", strike: 41000, quantity: 1 },
      { action: "buy", type: "put", strike: 40000, quantity: 1 },
      { action: "sell", type: "call", strike: 45000, quantity: 1 },
      { action: "buy", type: "call", strike: 46000, quantity: 1 },
    ],
  },
]

const mockOptionPositions: OptionPosition[] = [
  {
    id: "1",
    contractId: "1",
    symbol: "BTC-44000-C-240201",
    type: "call",
    strike: 44000,
    expiry: "2024-02-01",
    quantity: 2,
    entryPremium: 1200,
    currentPremium: 1250.5,
    pnl: 101,
    pnlPercentage: 4.2,
    delta: 0.45,
    theta: -15.2,
    daysToExpiry: 12,
    breakeven: 45200,
    maxProfit: Number.POSITIVE_INFINITY,
    maxLoss: 2400,
    timestamp: "2024-01-20T10:30:00Z",
    isOpen: true,
  },
  {
    id: "2",
    contractId: "2",
    symbol: "BTC-42000-P-240201",
    type: "put",
    strike: 42000,
    expiry: "2024-02-01",
    quantity: 1,
    entryPremium: 900,
    currentPremium: 850.25,
    pnl: -49.75,
    pnlPercentage: -5.5,
    delta: -0.35,
    theta: -12.8,
    daysToExpiry: 12,
    breakeven: 41100,
    maxProfit: 41100,
    maxLoss: 900,
    timestamp: "2024-01-20T14:15:00Z",
    isOpen: true,
  },
]

export default function OptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [options, setOptions] = useState<OptionContract[]>(mockOptions)
  const [positions, setPositions] = useState<OptionPosition[]>(mockOptionPositions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    setTimeout(() => setLoading(false), 1000)
  }, [status, router])

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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Options Trading
          </h1>
          <p className="text-muted-foreground">Advanced options trading with real-time Greeks</p>
        </div>

        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Options Balance</p>
                      <p className="text-2xl font-bold">$15,450.00</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio Delta</p>
                      <p className="text-2xl font-bold text-green-600">+0.15</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Theta Decay</p>
                      <p className="text-2xl font-bold text-red-600">-$28.00</p>
                    </div>
                    <Activity className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Positions</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Options Chain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Options Chain - BTC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Symbol</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Strike</th>
                        <th className="pb-3 font-medium">Premium</th>
                        <th className="pb-3 font-medium">IV</th>
                        <th className="pb-3 font-medium">Delta</th>
                        <th className="pb-3 font-medium">Theta</th>
                        <th className="pb-3 font-medium">Volume</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.map((option) => (
                        <tr key={option.symbol} className="border-b hover:bg-muted/50">
                          <td className="py-4">
                            <div className="font-mono text-sm">{option.symbol}</div>
                          </td>
                          <td className="py-4">
                            <Badge variant={option.type === "call" ? "default" : "destructive"}>
                              {option.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">${option.strike.toLocaleString()}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">${option.premium.toFixed(2)}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">{option.impliedVol.toFixed(1)}%</div>
                          </td>
                          <td className="py-4">
                            <div className={`font-mono ${option.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {option.delta.toFixed(3)}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono text-red-600">{option.theta.toFixed(2)}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">{option.volume}</div>
                          </td>
                          <td className="py-4">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4" />
                    <p>No open positions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="p-4 border rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                          <div className="flex items-center space-x-4">
                            <Badge variant={position.type === "call" ? "default" : "destructive"} className="text-xs">
                              {position.type.toUpperCase()}
                            </Badge>
                            <div>
                              <h3 className="font-bold">{position.symbol}</h3>
                              <p className="text-sm text-muted-foreground">
                                {position.quantity} contracts @ ${position.entryPremium}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div
                              className={`text-lg font-bold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                            </div>
                            <div
                              className={`text-sm ${position.pnlPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {position.pnlPercentage >= 0 ? "+" : ""}
                              {position.pnlPercentage.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Strike</p>
                            <p className="font-semibold">${position.strike.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expiry</p>
                            <p className="font-semibold">{position.daysToExpiry}d</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Delta</p>
                            <p className="font-semibold">{position.delta.toFixed(3)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Theta</p>
                            <p className="font-semibold text-red-600">{position.theta.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Close Position
                          </Button>
                          <Button variant="outline" size="sm">
                            Roll Option
                          </Button>
                          <Button variant="outline" size="sm">
                            Hedge
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockOptionStrategies.map((strategy, index) => (
                <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge
                        variant={
                          strategy.riskLevel === "low"
                            ? "default"
                            : strategy.riskLevel === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {strategy.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Profit:</span>
                        <span className="font-semibold text-green-600">{strategy.maxProfit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Loss:</span>
                        <span className="font-semibold text-red-600">{strategy.maxLoss}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Outlook:</span>
                        <span className="font-semibold">{strategy.marketOutlook}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complexity:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < strategy.complexity ? "bg-blue-600" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
