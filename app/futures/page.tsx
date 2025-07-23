"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Target, BarChart3, Activity, Flame, ArrowUp, ArrowDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface FuturesContract {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent: number
  volume24h: number
  openInterest: number
  fundingRate: number
  nextFunding: string
  maxLeverage: number
  tickSize?: number
  contractSize?: number
  settlementDate?: string
  isActive?: boolean
}

interface FuturesPosition {
  id: string
  symbol: string
  side: "long" | "short"
  size: number
  entryPrice: number
  markPrice: number
  liquidationPrice: number
  margin: number
  leverage: number
  pnl: number
  pnlPercentage: number
  roe: number
  fundingFee: number
  timestamp: string
  isOpen: boolean
}

interface FuturesOrder {
  id: string
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop" | "take_profit"
  size: number
  price?: number
  stopPrice?: number
  leverage: number
  status: "pending" | "filled" | "cancelled"
  timestamp: string
}

const mockContracts: FuturesContract[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    price: 118330.0,
    change24h: -1094.29,
    changePercent: -0.92,
    volume24h: 154958406,
    openInterest: 10587673707.76,
    fundingRate: 0.01,
    nextFunding: "00:36:42",
    maxLeverage: 125,
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum",
    price: 2680.25,
    change24h: -60.15,
    changePercent: -2.2,
    volume24h: 89456123,
    openInterest: 2456789012.34,
    fundingRate: -0.005,
    nextFunding: "00:36:42",
    maxLeverage: 100,
  },
  {
    symbol: "BNBUSDT",
    name: "BNB",
    price: 315.67,
    change24h: 8.45,
    changePercent: 2.75,
    volume24h: 45678901,
    openInterest: 987654321.12,
    fundingRate: 0.0025,
    nextFunding: "00:36:42",
    maxLeverage: 75,
  },
]

const mockFuturesPositions: FuturesPosition[] = [
  {
    id: "1",
    symbol: "BTCUSDT",
    side: "long",
    size: 0.5,
    entryPrice: 42800,
    markPrice: 43250.5,
    liquidationPrice: 38520,
    margin: 1000,
    leverage: 20,
    pnl: 225.25,
    pnlPercentage: 22.5,
    roe: 450,
    fundingFee: -2.15,
    timestamp: "2024-01-20T10:30:00Z",
    isOpen: true,
  },
  {
    id: "2",
    symbol: "ETHUSDT",
    side: "short",
    size: 2,
    entryPrice: 2720,
    markPrice: 2680.25,
    liquidationPrice: 2856,
    margin: 500,
    leverage: 10,
    pnl: 79.5,
    pnlPercentage: 15.9,
    roe: 159,
    fundingFee: 1.25,
    timestamp: "2024-01-20T14:15:00Z",
    isOpen: true,
  },
]

export default function FuturesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [contracts, setContracts] = useState<FuturesContract[]>(mockContracts)
  const [positions, setPositions] = useState<FuturesPosition[]>(mockFuturesPositions)
  const [orders, setOrders] = useState<FuturesOrder[]>([])
  const [selectedContract, setSelectedContract] = useState<FuturesContract>(mockContracts[0])
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("limit")
  const [orderSize, setOrderSize] = useState("")
  const [orderPrice, setOrderPrice] = useState("")
  const [leverage, setLeverage] = useState([10])
  const [margin, setMargin] = useState("")
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<FuturesPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trading")
  const [chartData, setChartData] = useState<any[]>([])
  const [isolatedMargin, setIsolatedMargin] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [postOnly, setPostOnly] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access futures trading.",
        variant: "destructive",
      })
      return
    }

    // Simulate loading
    setTimeout(() => setLoading(false), 1000)

    // Update prices periodically
    const interval = setInterval(() => {
      setContracts((prev) =>
        prev.map((contract) => ({
          ...contract,
          price: contract.price + (Math.random() - 0.5) * contract.price * 0.001,
          change24h: contract.change24h + (Math.random() - 0.5) * 10,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [status, router, toast])

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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Futures Trading
          </h1>
          <p className="text-muted-foreground">Trade cryptocurrency futures with up to 125x leverage</p>
        </div>

        <Tabs defaultValue="usd-m" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usd-m" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              USD-M Futures
            </TabsTrigger>
            <TabsTrigger value="coin-m">COIN-M Futures</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="usd-m" className="space-y-6">
            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Futures Balance</p>
                      <p className="text-2xl font-bold">$25,450.67</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unrealized P&L</p>
                      <p className="text-2xl font-bold text-green-600">+$304.75</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Margin Used</p>
                      <p className="text-2xl font-bold">$1,500</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Positions</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Futures Contracts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Perpetual Futures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Symbol</th>
                        <th className="pb-3 font-medium">Last Price</th>
                        <th className="pb-3 font-medium">24h Change</th>
                        <th className="pb-3 font-medium">24h Volume</th>
                        <th className="pb-3 font-medium">Open Interest</th>
                        <th className="pb-3 font-medium">Funding Rate</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.symbol} className="border-b hover:bg-muted/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                                {contract.name.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold">{contract.symbol}</div>
                                <div className="text-xs text-muted-foreground">{contract.name} Perpetual</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono font-semibold">
                              $
                              {contract.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </td>
                          <td className="py-4">
                            <div
                              className={`flex items-center space-x-1 ${contract.change24h >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {contract.change24h >= 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                              <span className="font-mono">
                                {contract.change24h >= 0 ? "+" : ""}
                                {contract.change24h.toFixed(2)}
                              </span>
                              <span className="font-mono">
                                ({contract.changePercent >= 0 ? "+" : ""}
                                {contract.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">${(contract.volume24h / 1000000).toFixed(1)}M</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">${(contract.openInterest / 1000000000).toFixed(2)}B</div>
                          </td>
                          <td className="py-4">
                            <div
                              className={`font-mono ${contract.fundingRate >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {(contract.fundingRate * 100).toFixed(4)}%
                            </div>
                            <div className="text-xs text-muted-foreground">in {contract.nextFunding}</div>
                          </td>
                          <td className="py-4">
                            <Link href={`/trade/${contract.symbol.toLowerCase()}`}>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                Trade
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
