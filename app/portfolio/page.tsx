"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  DollarSign,
  Target,
  Award,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Asset {
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
}

interface Transaction {
  id: string
  type: "buy" | "sell" | "deposit" | "withdrawal"
  asset: string
  amount: number
  price: number
  value: number
  timestamp: string
  status: "completed" | "pending" | "failed"
}

const mockAssets: Asset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.5,
    value: 59165,
    price: 118330,
    change24h: -0.92,
    allocation: 45.2,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 12.5,
    value: 33503.125,
    price: 2680.25,
    change24h: -2.2,
    allocation: 25.6,
  },
  {
    symbol: "BNB",
    name: "BNB",
    balance: 50,
    value: 15783.5,
    price: 315.67,
    change24h: 2.75,
    allocation: 12.1,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 22500,
    value: 22500,
    price: 1.0,
    change24h: 0.01,
    allocation: 17.1,
  },
]

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "buy",
    asset: "BTC",
    amount: 0.1,
    price: 118000,
    value: 11800,
    timestamp: "2024-01-20T10:30:00Z",
    status: "completed",
  },
  {
    id: "2",
    type: "sell",
    asset: "ETH",
    amount: 2,
    price: 2700,
    value: 5400,
    timestamp: "2024-01-20T09:15:00Z",
    status: "completed",
  },
  {
    id: "3",
    type: "deposit",
    asset: "USDT",
    amount: 10000,
    price: 1,
    value: 10000,
    timestamp: "2024-01-19T16:45:00Z",
    status: "completed",
  },
]

export default function PortfolioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)
  const [totalPnLPercent, setTotalPnLPercent] = useState(0)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Calculate totals
    const total = assets.reduce((sum, asset) => sum + asset.value, 0)
    setTotalValue(total)

    // Mock P&L calculation
    setTotalPnL(2456.78)
    setTotalPnLPercent(1.89)

    setTimeout(() => setLoading(false), 1000)
  }, [status, router, assets])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "sell":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case "deposit":
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case "withdrawal":
        return <Target className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-muted-foreground">Track your investments and performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">24h P&L</p>
                      <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                      </p>
                    </div>
                    {totalPnL >= 0 ? (
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    ) : (
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">24h Change</p>
                      <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {totalPnLPercent >= 0 ? "+" : ""}
                        {totalPnLPercent.toFixed(2)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Assets</p>
                      <p className="text-2xl font-bold">{assets.length}</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{asset.allocation.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">${asset.value.toLocaleString()}</div>
                      </div>
                      <div className="w-24">
                        <Progress value={asset.allocation} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Your Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Balance</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">24h Change</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.symbol} className="border-b hover:bg-muted/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {asset.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold">{asset.symbol}</div>
                                <div className="text-sm text-muted-foreground">{asset.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">{asset.balance.toLocaleString()}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono">${asset.price.toLocaleString()}</div>
                          </td>
                          <td className="py-4">
                            <div className={`font-mono ${asset.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {asset.change24h >= 0 ? "+" : ""}
                              {asset.change24h.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono font-semibold">${asset.value.toLocaleString()}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Progress value={asset.allocation} className="w-16 h-2" />
                              <span className="text-sm font-medium">{asset.allocation.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="font-semibold capitalize">
                            {transaction.type} {transaction.asset}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">
                          {transaction.amount} {transaction.asset}
                        </div>
                        <div className="text-sm text-muted-foreground">${transaction.value.toLocaleString()}</div>
                      </div>
                      <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Performance analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
