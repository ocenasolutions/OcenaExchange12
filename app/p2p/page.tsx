"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Clock, Star, Users, DollarSign, Send, Flag, Verified, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface P2POrder {
  id: string
  type: "buy" | "sell"
  trader: {
    name: string
    avatar: string
    rating: number
    completedTrades: number
    completionRate: number
    avgReleaseTime: number
    isVerified: boolean
    isOnline: boolean
    joinDate: string
  }
  crypto: string
  fiat: string
  amount: number
  price: number
  minLimit: number
  maxLimit: number
  paymentMethods: string[]
  terms: string
  createdAt: string
  isActive: boolean
}

interface Trade {
  id: string
  orderId: string
  buyer: string
  seller: string
  amount: number
  price: number
  status: "pending" | "paid" | "confirmed" | "completed" | "disputed" | "cancelled"
  paymentMethod: string
  createdAt: string
  messages: Array<{
    id: string
    sender: string
    message: string
    timestamp: string
    type: "text" | "image" | "system"
  }>
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  processingTime: string
  fees: string
  isPopular: boolean
}

const mockOrders: P2POrder[] = [
  {
    id: "1",
    type: "sell",
    trader: {
      name: "CryptoKing",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completedTrades: 1247,
      completionRate: 98.5,
      avgReleaseTime: 12,
      isVerified: true,
      isOnline: true,
      joinDate: "2022-03-15",
    },
    crypto: "BTC",
    fiat: "USD",
    amount: 2.5,
    price: 43250,
    minLimit: 1000,
    maxLimit: 50000,
    paymentMethods: ["PayPal", "Bank Transfer", "Wise"],
    terms: "Fast release within 15 minutes. Please follow payment instructions carefully.",
    createdAt: "2024-01-20T10:30:00Z",
    isActive: true,
  },
  {
    id: "2",
    type: "buy",
    trader: {
      name: "BitcoinBuyer",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      completedTrades: 892,
      completionRate: 96.8,
      avgReleaseTime: 18,
      isVerified: true,
      isOnline: false,
      joinDate: "2021-11-08",
    },
    crypto: "ETH",
    fiat: "EUR",
    amount: 10.0,
    price: 2680,
    minLimit: 500,
    maxLimit: 25000,
    paymentMethods: ["SEPA", "Revolut", "N26"],
    terms: "Looking for quick trades. Prefer experienced traders only.",
    createdAt: "2024-01-20T09:15:00Z",
    isActive: true,
  },
  {
    id: "3",
    type: "sell",
    trader: {
      name: "EthereumExpert",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      completedTrades: 2156,
      completionRate: 99.2,
      avgReleaseTime: 8,
      isVerified: true,
      isOnline: true,
      joinDate: "2020-07-22",
    },
    crypto: "USDT",
    fiat: "GBP",
    amount: 50000,
    price: 0.79,
    minLimit: 100,
    maxLimit: 10000,
    paymentMethods: ["Faster Payments", "Revolut", "Monzo"],
    terms: "Instant release for verified users. Please have payment ready.",
    createdAt: "2024-01-20T11:45:00Z",
    isActive: true,
  },
]

const mockTrades: Trade[] = [
  {
    id: "1",
    orderId: "1",
    buyer: "user123",
    seller: "CryptoKing",
    amount: 5000,
    price: 43250,
    status: "paid",
    paymentMethod: "PayPal",
    createdAt: "2024-01-20T14:30:00Z",
    messages: [
      {
        id: "1",
        sender: "system",
        message: "Trade started. Please make payment within 15 minutes.",
        timestamp: "2024-01-20T14:30:00Z",
        type: "system",
      },
      {
        id: "2",
        sender: "user123",
        message: "Payment sent via PayPal. Transaction ID: 1234567890",
        timestamp: "2024-01-20T14:35:00Z",
        type: "text",
      },
      {
        id: "3",
        sender: "CryptoKing",
        message: "Payment received. Releasing crypto now.",
        timestamp: "2024-01-20T14:37:00Z",
        type: "text",
      },
    ],
  },
]

const paymentMethods: PaymentMethod[] = [
  { id: "paypal", name: "PayPal", icon: "💳", processingTime: "Instant", fees: "Free", isPopular: true },
  { id: "bank", name: "Bank Transfer", icon: "🏦", processingTime: "1-3 days", fees: "Low", isPopular: true },
  { id: "wise", name: "Wise", icon: "💸", processingTime: "Minutes", fees: "Low", isPopular: true },
  { id: "revolut", name: "Revolut", icon: "📱", processingTime: "Instant", fees: "Free", isPopular: false },
  { id: "sepa", name: "SEPA", icon: "🇪🇺", processingTime: "Same day", fees: "Free", isPopular: false },
  { id: "zelle", name: "Zelle", icon: "⚡", processingTime: "Instant", fees: "Free", isPopular: false },
]

export default function P2PPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<P2POrder[]>(mockOrders)
  const [trades, setTrades] = useState<Trade[]>(mockTrades)
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCrypto, setFilterCrypto] = useState("all")
  const [filterPayment, setFilterPayment] = useState("all")
  const [sortBy, setSortBy] = useState("price")
  const [activeTab, setActiveTab] = useState("orders")
  const [tradeAmount, setTradeAmount] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Create Order Form State
  const [orderType, setOrderType] = useState<"buy" | "sell">("sell")
  const [orderCrypto, setOrderCrypto] = useState("BTC")
  const [orderFiat, setOrderFiat] = useState("USD")
  const [orderAmount, setOrderAmount] = useState("")
  const [orderPrice, setOrderPrice] = useState("")
  const [orderMinLimit, setOrderMinLimit] = useState("")
  const [orderMaxLimit, setOrderMaxLimit] = useState("")
  const [orderPaymentMethods, setOrderPaymentMethods] = useState<string[]>([])
  const [orderTerms, setOrderTerms] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access P2P trading.",
        variant: "destructive",
      })
      return
    }
  }, [status, router, toast])

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.crypto.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || order.type === filterType
      const matchesCrypto = filterCrypto === "all" || order.crypto === filterCrypto
      const matchesPayment = filterPayment === "all" || order.paymentMethods.includes(filterPayment)
      return matchesSearch && matchesType && matchesCrypto && matchesPayment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "amount":
          return b.amount - a.amount
        case "rating":
          return b.trader.rating - a.trader.rating
        case "trades":
          return b.trader.completedTrades - a.trader.completedTrades
        default:
          return 0
      }
    })

  const handleStartTrade = async () => {
    if (!selectedOrder || !tradeAmount) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newTrade: Trade = {
        id: Date.now().toString(),
        orderId: selectedOrder.id,
        buyer: selectedOrder.type === "sell" ? "user123" : selectedOrder.trader.name,
        seller: selectedOrder.type === "sell" ? selectedOrder.trader.name : "user123",
        amount: Number.parseFloat(tradeAmount),
        price: selectedOrder.price,
        status: "pending",
        paymentMethod: selectedOrder.paymentMethods[0],
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: "1",
            sender: "system",
            message: `Trade started for ${tradeAmount} ${selectedOrder.fiat}. Please make payment within 15 minutes.`,
            timestamp: new Date().toISOString(),
            type: "system",
          },
        ],
      }

      setTrades((prev) => [newTrade, ...prev])

      toast({
        title: "Trade Started!",
        description: `Trade initiated for ${tradeAmount} ${selectedOrder.fiat}`,
      })

      setShowOrderDialog(false)
      setTradeAmount("")
      setSelectedOrder(null)
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "There was an error starting the trade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!orderAmount || !orderPrice || !orderMinLimit || !orderMaxLimit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newOrder: P2POrder = {
        id: Date.now().toString(),
        type: orderType,
        trader: {
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40",
          rating: 4.5,
          completedTrades: 0,
          completionRate: 0,
          avgReleaseTime: 0,
          isVerified: false,
          isOnline: true,
          joinDate: new Date().toISOString(),
        },
        crypto: orderCrypto,
        fiat: orderFiat,
        amount: Number.parseFloat(orderAmount),
        price: Number.parseFloat(orderPrice),
        minLimit: Number.parseFloat(orderMinLimit),
        maxLimit: Number.parseFloat(orderMaxLimit),
        paymentMethods: orderPaymentMethods,
        terms: orderTerms,
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      setOrders((prev) => [newOrder, ...prev])

      toast({
        title: "Order Created!",
        description: `Your ${orderType} order for ${orderAmount} ${orderCrypto} has been created.`,
      })

      setShowCreateOrderDialog(false)
      // Reset form
      setOrderAmount("")
      setOrderPrice("")
      setOrderMinLimit("")
      setOrderMaxLimit("")
      setOrderPaymentMethods([])
      setOrderTerms("")
    } catch (error) {
      toast({
        title: "Order Creation Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTrade) return

    const message = {
      id: Date.now().toString(),
      sender: "user123",
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    }

    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === selectedTrade.id ? { ...trade, messages: [...trade.messages, message] } : trade,
      ),
    )

    setNewMessage("")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            P2P Trading
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Trade directly with other users using your preferred payment methods
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-blue-600">+12% today</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">$2.4M</p>
                  <p className="text-xs text-green-600">+8.5%</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online Traders</p>
                  <p className="text-2xl font-bold">3,456</p>
                  <p className="text-xs text-purple-600">Active now</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Release Time</p>
                  <p className="text-2xl font-bold">12 min</p>
                  <p className="text-xs text-orange-600">Fast trades</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="trades">My Trades</TabsTrigger>
              <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowCreateOrderDialog(true)}>Create Order</Button>
          </div>

          <TabsContent value="orders" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search traders or crypto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCrypto} onValueChange={setFilterCrypto}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crypto</SelectItem>
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                    <SelectItem value="ETH">Ethereum</SelectItem>
                    <SelectItem value="USDT">Tether</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPayment} onValueChange={setFilterPayment}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Wise">Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="trades">Completed Trades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(order)
                    setShowOrderDialog(true)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={order.trader.avatar || "/placeholder.svg"} alt={order.trader.name} />
                            <AvatarFallback>{order.trader.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {order.trader.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{order.trader.name}</h3>
                            {order.trader.isVerified && <Verified className="w-4 h-4 text-blue-600" />}
                            <Badge variant={order.type === "buy" ? "default" : "destructive"} className="text-xs">
                              {order.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{order.trader.rating}</span>
                            </div>
                            <span>{order.trader.completedTrades} trades</span>
                            <span>{order.trader.completionRate}% completion</span>
                            <span>~{order.trader.avgReleaseTime}min release</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-lg font-bold">
                            {order.amount} {order.crypto}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-lg font-bold">
                            {order.price.toLocaleString()} {order.fiat}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Limits</p>
                          <p className="text-sm font-semibold">
                            {order.minLimit.toLocaleString()} - {order.maxLimit.toLocaleString()} {order.fiat}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground mb-1">Payment Methods</p>
                          <div className="flex flex-wrap gap-1">
                            {order.paymentMethods.slice(0, 2).map((method, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {method}
                              </Badge>
                            ))}
                            {order.paymentMethods.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{order.paymentMethods.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <div className="space-y-4">
              {trades.map((trade) => (
                <Card
                  key={trade.id}
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedTrade(trade)
                    setShowTradeDialog(true)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-green-500 flex items-center justify-center text-white font-bold">
                          {trade.id}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Trade #{trade.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {trade.buyer} ↔ {trade.seller}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-lg font-bold">${trade.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-lg font-bold">${trade.price.toLocaleString()}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Payment</p>
                          <p className="text-sm font-semibold">{trade.paymentMethod}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge
                            variant={
                              trade.status === "completed"
                                ? "default"
                                : trade.status === "disputed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="text-xs">{new Date(trade.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{method.name}</h3>
                          {method.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Time:</span>
                        <span className="font-semibold">{method.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fees:</span>
                        <span className="font-semibold">{method.fees}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4 bg-transparent">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-2xl">
            {selectedOrder && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={selectedOrder.trader.avatar || "/placeholder.svg"}
                        alt={selectedOrder.trader.name}
                      />
                      <AvatarFallback>{selectedOrder.trader.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl flex items-center space-x-2">
                        <span>{selectedOrder.trader.name}</span>
                        {selectedOrder.trader.isVerified && <Verified className="w-5 h-5 text-blue-600" />}
                      </DialogTitle>
                      <DialogDescription className="text-lg">
                        {selectedOrder.type === "sell" ? "Selling" : "Buying"} {selectedOrder.crypto}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          {selectedOrder.amount} {selectedOrder.crypto}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-semibold">
                          {selectedOrder.price.toLocaleString()} {selectedOrder.fiat}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Limit:</span>
                        <span className="font-semibold">
                          {selectedOrder.minLimit.toLocaleString()} {selectedOrder.fiat}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Limit:</span>
                        <span className="font-semibold">
                          {selectedOrder.maxLimit.toLocaleString()} {selectedOrder.fiat}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trader Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{selectedOrder.trader.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Trades:</span>
                        <span className="font-semibold">{selectedOrder.trader.completedTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-semibold">{selectedOrder.trader.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Release Time:</span>
                        <span className="font-semibold">{selectedOrder.trader.avgReleaseTime} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.paymentMethods.map((method, index) => (
                      <Badge key={index} variant="outline">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">{selectedOrder.terms}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trade-amount">
                      Amount to {selectedOrder.type === "sell" ? "Buy" : "Sell"} ({selectedOrder.fiat})
                    </Label>
                    <Input
                      id="trade-amount"
                      type="number"
                      placeholder={`Min: ${selectedOrder.minLimit}, Max: ${selectedOrder.maxLimit}`}
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                    {tradeAmount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        You will {selectedOrder.type === "sell" ? "receive" : "pay"}:{" "}
                        {(Number.parseFloat(tradeAmount) / selectedOrder.price).toFixed(6)} {selectedOrder.crypto}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartTrade}
                    disabled={
                      loading ||
                      !tradeAmount ||
                      Number.parseFloat(tradeAmount) < selectedOrder.minLimit ||
                      Number.parseFloat(tradeAmount) > selectedOrder.maxLimit
                    }
                  >
                    {loading ? "Starting Trade..." : `Start Trade`}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Trade Chat Dialog */}
        <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            {selectedTrade && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Trade #{selectedTrade.id}</DialogTitle>
                  <DialogDescription>
                    {selectedTrade.buyer} ↔ {selectedTrade.seller} • ${selectedTrade.amount.toLocaleString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
                  <div className="lg:col-span-2 flex flex-col">
                    <div className="flex-1 border rounded-lg p-4 overflow-y-auto space-y-4 bg-muted/20">
                      {selectedTrade.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "user123"
                              ? "justify-end"
                              : message.sender === "system"
                                ? "justify-center"
                                : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === "user123"
                                ? "bg-blue-600 text-white"
                                : message.sender === "system"
                                  ? "bg-yellow-100 text-yellow-800 text-sm"
                                  : "bg-white border"
                            }`}
                          >
                            {message.sender !== "system" && <p className="text-xs opacity-70 mb-1">{message.sender}</p>}
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Trade Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge
                            variant={
                              selectedTrade.status === "completed"
                                ? "default"
                                : selectedTrade.status === "disputed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {selectedTrade.status.charAt(0).toUpperCase() + selectedTrade.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-semibold">${selectedTrade.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment:</span>
                          <span className="font-semibold">{selectedTrade.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="text-sm">{new Date(selectedTrade.createdAt).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      {selectedTrade.status === "pending" && <Button className="w-full">Mark as Paid</Button>}
                      {selectedTrade.status === "paid" && <Button className="w-full">Release Crypto</Button>}
                      <Button variant="outline" className="w-full bg-transparent">
                        <Flag className="w-4 h-4 mr-2" />
                        Report Issue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Order Dialog */}
        <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create P2P Order</DialogTitle>
              <DialogDescription>Create a new buy or sell order for peer-to-peer trading</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={(value: "buy" | "sell") => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cryptocurrency</Label>
                  <Select value={orderCrypto} onValueChange={setOrderCrypto}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order-amount">Amount ({orderCrypto})</Label>
                  <Input
                    id="order-amount"
                    type="number"
                    placeholder="0.00"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="order-price">
                    Price per {orderCrypto} ({orderFiat})
                  </Label>
                  <Input
                    id="order-price"
                    type="number"
                    placeholder="0.00"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order-min">Min Limit ({orderFiat})</Label>
                  <Input
                    id="order-min"
                    type="number"
                    placeholder="0.00"
                    value={orderMinLimit}
                    onChange={(e) => setOrderMinLimit(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="order-max">Max Limit ({orderFiat})</Label>
                  <Input
                    id="order-max"
                    type="number"
                    placeholder="0.00"
                    value={orderMaxLimit}
                    onChange={(e) => setOrderMaxLimit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Payment Methods</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderPaymentMethods.includes(method.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOrderPaymentMethods((prev) => [...prev, method.name])
                          } else {
                            setOrderPaymentMethods((prev) => prev.filter((m) => m !== method.name))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{method.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="order-terms">Terms & Conditions</Label>
                <Textarea
                  id="order-terms"
                  placeholder="Enter your trading terms and conditions..."
                  value={orderTerms}
                  onChange={(e) => setOrderTerms(e.target.value)}
                  rows={3}
                />
              </div>

              {orderAmount && orderPrice && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-semibold">
                        {(Number.parseFloat(orderAmount) * Number.parseFloat(orderPrice)).toLocaleString()} {orderFiat}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Type:</span>
                      <span className="font-semibold capitalize">
                        {orderType} {orderCrypto}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} disabled={loading}>
                {loading ? "Creating Order..." : "Create Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
