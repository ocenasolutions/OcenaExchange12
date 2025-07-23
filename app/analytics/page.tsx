"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TradingChart } from "@/components/trading-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  DollarSign,
  Zap,
  Brain,
  Calculator,
  Globe,
  Flame,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MarketAnalytics {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  dominance: number
  volatility: number
  sentiment: "bullish" | "bearish" | "neutral"
  technicalRating: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell"
  supportLevel: number
  resistanceLevel: number
  rsi: number
  macd: number
  movingAverage: number
}

interface PortfolioAnalytics {
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
  bestPerformer: string
  worstPerformer: string
  diversificationScore: number
  riskScore: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  avgHoldTime: string
  totalTrades: number
}

interface MarketTrend {
  category: string
  trend: "up" | "down" | "sideways"
  strength: number
  timeframe: string
  description: string
}

const mockMarketAnalytics: MarketAnalytics[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    price: 43250.5,
    change24h: 2.45,
    volume24h: 2450000000,
    marketCap: 850000000000,
    dominance: 52.3,
    volatility: 3.2,
    sentiment: "bullish",
    technicalRating: "buy",
    supportLevel: 42000,
    resistanceLevel: 45000,
    rsi: 65.4,
    macd: 1250.5,
    movingAverage: 42800,
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum",
    price: 2680.25,
    change24h: -1.23,
    volume24h: 1850000000,
    marketCap: 320000000000,
    dominance: 18.7,
    volatility: 4.1,
    sentiment: "neutral",
    technicalRating: "neutral",
    supportLevel: 2600,
    resistanceLevel: 2750,
    rsi: 48.2,
    macd: -15.3,
    movingAverage: 2695,
  },
  {
    symbol: "ADAUSDT",
    name: "Cardano",
    price: 0.4567,
    change24h: 5.67,
    volume24h: 125000000,
    marketCap: 16000000000,
    dominance: 0.9,
    volatility: 6.8,
    sentiment: "bullish",
    technicalRating: "strong_buy",
    supportLevel: 0.42,
    resistanceLevel: 0.48,
    rsi: 72.1,
    macd: 0.0125,
    movingAverage: 0.445,
  },
]

const mockPortfolioAnalytics: PortfolioAnalytics = {
  totalValue: 25450.67,
  totalPnL: 3245.89,
  totalPnLPercentage: 14.6,
  bestPerformer: "ADAUSDT (+45.2%)",
  worstPerformer: "ETHUSDT (-8.3%)",
  diversificationScore: 7.8,
  riskScore: 6.2,
  sharpeRatio: 1.85,
  maxDrawdown: -12.5,
  winRate: 68.5,
  avgHoldTime: "4d 12h",
  totalTrades: 156,
}

const mockMarketTrends: MarketTrend[] = [
  {
    category: "DeFi",
    trend: "up",
    strength: 85,
    timeframe: "7d",
    description: "Strong bullish momentum in DeFi tokens with increased TVL",
  },
  {
    category: "Layer 1",
    trend: "up",
    strength: 72,
    timeframe: "30d",
    description: "Layer 1 blockchains showing consistent growth",
  },
  {
    category: "Meme Coins",
    trend: "down",
    strength: 45,
    timeframe: "24h",
    description: "Meme coin sector experiencing correction",
  },
  {
    category: "NFTs",
    trend: "sideways",
    strength: 55,
    timeframe: "14d",
    description: "NFT market consolidating after recent volatility",
  },
]

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedAsset, setSelectedAsset] = useState<MarketAnalytics>(mockMarketAnalytics[0])
  const [timeframe, setTimeframe] = useState("24h")
  const [activeTab, setActiveTab] = useState("market")
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access analytics.",
        variant: "destructive",
      })
      return
    }
    generateChartData()
  }, [status, router, toast, selectedAsset])

  const generateChartData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData = []
      let currentPrice = selectedAsset.price
      const now = Math.floor(Date.now() / 1000)

      for (let i = 100; i >= 0; i--) {
        const time = now - i * 3600
        const volatility = currentPrice * 0.02
        const change = (Math.random() - 0.5) * volatility

        const open = currentPrice
        const close = open + change
        const high = Math.max(open, close) + Math.random() * volatility * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * 0.5
        const volume = Math.random() * 1000000 + 500000

        mockData.push({ time, open, high, low, close, volume })
        currentPrice = close
      }

      setChartData(mockData)
    } catch (error) {
      console.error("Error generating chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600 bg-green-100"
      case "bearish":
        return "text-red-600 bg-red-100"
      default:
        return "text-yellow-600 bg-yellow-100"
    }
  }

  const getTechnicalRatingColor = (rating: string) => {
    switch (rating) {
      case "strong_buy":
        return "text-green-700 bg-green-100"
      case "buy":
        return "text-green-600 bg-green-50"
      case "neutral":
        return "text-gray-600 bg-gray-100"
      case "sell":
        return "text-red-600 bg-red-50"
      case "strong_sell":
        return "text-red-700 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-4 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Comprehensive market analysis and portfolio insights powered by AI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            {/* Market Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Market Cap</p>
                      <p className="text-2xl font-bold">$1.85T</p>
                      <p className="text-xs text-blue-600">+2.4% today</p>
                    </div>
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-2xl font-bold">$89.2B</p>
                      <p className="text-xs text-green-600">+12.8%</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">BTC Dominance</p>
                      <p className="text-2xl font-bold">52.3%</p>
                      <p className="text-xs text-purple-600">-0.8%</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Fear & Greed</p>
                      <p className="text-2xl font-bold">72</p>
                      <p className="text-xs text-orange-600">Greed</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Analysis Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Market Analysis - {selectedAsset.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedAsset.symbol}
                          onValueChange={(value) => {
                            const asset = mockMarketAnalytics.find((a) => a.symbol === value)
                            if (asset) setSelectedAsset(asset)
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockMarketAnalytics.map((asset) => (
                              <SelectItem key={asset.symbol} value={asset.symbol}>
                                {asset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1h</SelectItem>
                            <SelectItem value="4h">4h</SelectItem>
                            <SelectItem value="24h">24h</SelectItem>
                            <SelectItem value="7d">7d</SelectItem>
                            <SelectItem value="30d">30d</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TradingChart
                      symbol={selectedAsset.symbol}
                      data={chartData}
                      height={400}
                      showVolume={true}
                      showIndicators={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Market Insights */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Market Sentiment</span>
                        <Badge className={getSentimentColor(selectedAsset.sentiment)}>
                          {selectedAsset.sentiment.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Technical Rating</span>
                        <Badge className={getTechnicalRatingColor(selectedAsset.technicalRating)}>
                          {selectedAsset.technicalRating.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Volatility</span>
                        <span className="font-semibold">{selectedAsset.volatility}%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Support Level</span>
                        <span className="font-semibold text-green-600">
                          ${selectedAsset.supportLevel.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Resistance Level</span>
                        <span className="font-semibold text-red-600">
                          ${selectedAsset.resistanceLevel.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RSI (14)</span>
                        <span
                          className={`font-semibold ${
                            selectedAsset.rsi > 70
                              ? "text-red-600"
                              : selectedAsset.rsi < 30
                                ? "text-green-600"
                                : "text-gray-600"
                          }`}
                        >
                          {selectedAsset.rsi.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">MACD</span>
                        <span className={`font-semibold ${selectedAsset.macd > 0 ? "text-green-600" : "text-red-600"}`}>
                          {selectedAsset.macd.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Market Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockMarketTrends.map((trend, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{trend.category}</span>
                            <div className="flex items-center gap-2">
                              {trend.trend === "up" ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : trend.trend === "down" ? (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              ) : (
                                <Activity className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-sm font-semibold">{trend.strength}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{trend.description}</p>
                          <div className="mt-2">
                            <Progress value={trend.strength} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">${mockPortfolioAnalytics.totalValue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{mockPortfolioAnalytics.totalPnLPercentage}%</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total P&L</p>
                      <p className="text-2xl font-bold text-green-600">
                        +${mockPortfolioAnalytics.totalPnL.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600">Unrealized</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold">{mockPortfolioAnalytics.winRate}%</p>
                      <p className="text-xs text-purple-600">{mockPortfolioAnalytics.totalTrades} trades</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-2xl font-bold">{mockPortfolioAnalytics.sharpeRatio}</p>
                      <p className="text-xs text-orange-600">Excellent</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Portfolio Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Best Performer</span>
                      <span className="font-semibold text-green-600">{mockPortfolioAnalytics.bestPerformer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Worst Performer</span>
                      <span className="font-semibold text-red-600">{mockPortfolioAnalytics.worstPerformer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diversification Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockPortfolioAnalytics.diversificationScore * 10} className="w-20 h-2" />
                        <span className="font-semibold">{mockPortfolioAnalytics.diversificationScore}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockPortfolioAnalytics.riskScore * 10} className="w-20 h-2" />
                        <span className="font-semibold">{mockPortfolioAnalytics.riskScore}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Drawdown</span>
                      <span className="font-semibold text-red-600">{mockPortfolioAnalytics.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Hold Time</span>
                      <span className="font-semibold">{mockPortfolioAnalytics.avgHoldTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• High Sharpe ratio indicates good risk-adjusted returns</li>
                        <li>• Strong diversification across multiple assets</li>
                        <li>• Consistent positive performance trend</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Consider reducing exposure to high-volatility assets</li>
                        <li>• Implement stop-loss strategies for risk management</li>
                        <li>• Rebalance portfolio quarterly</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Technical Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TradingChart
                    symbol={selectedAsset.symbol}
                    data={chartData}
                    height={300}
                    showVolume={true}
                    showIndicators={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Signal Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMarketAnalytics.map((asset, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{asset.name}</span>
                          <Badge className={getTechnicalRatingColor(asset.technicalRating)}>
                            {asset.technicalRating.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">RSI</p>
                            <p className="font-semibold">{asset.rsi.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">MACD</p>
                            <p className="font-semibold">{asset.macd.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">MA</p>
                            <p className="font-semibold">${asset.movingAverage.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-600/10 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Market Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/50 rounded-lg border">
                      <h4 className="font-semibold mb-2">Bitcoin (BTC) - Next 24h</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Predicted Direction</span>
                        <Badge className="bg-green-100 text-green-700">Bullish</Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Confidence</span>
                        <span className="font-semibold">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Target Range</span>
                        <span className="font-semibold">$43,800 - $44,500</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/50 rounded-lg border">
                      <h4 className="font-semibold mb-2">Ethereum (ETH) - Next 24h</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Predicted Direction</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Neutral</Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Confidence</span>
                        <span className="font-semibold">65%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Target Range</span>
                        <span className="font-semibold">$2,650 - $2,720</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-green-600/10 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    AI Trading Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800">BUY Signal</span>
                      </div>
                      <p className="text-sm text-green-700 mb-2">ADAUSDT - Strong bullish momentum detected</p>
                      <div className="text-xs text-green-600">Entry: $0.456 | Target: $0.485 | Stop: $0.440</div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">HOLD Signal</span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-2">BTCUSDT - Consolidation phase, wait for breakout</p>
                      <div className="text-xs text-yellow-600">Monitor: $43,000 support | Resistance: $45,000</div>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800">CAUTION Signal</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2">High volatility expected in next 4 hours</p>
                      <div className="text-xs text-red-600">Reduce position sizes | Tighten stop losses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
