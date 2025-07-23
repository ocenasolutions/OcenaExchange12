"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Grid3X3,
  List,
  Heart,
  Share2,
  ExternalLink,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Star,
  Palette,
  ImageIcon,
  Activity,
  DollarSign,
  ShoppingCart,
  Verified,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NFT {
  id: string
  name: string
  collection: string
  creator: string
  price: number
  currency: string
  image: string
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  attributes: Array<{ trait_type: string; value: string }>
  likes: number
  views: number
  isLiked: boolean
  lastSale?: number
  priceHistory: Array<{ price: number; date: string }>
  description: string
  tokenId: string
  blockchain: string
  royalty: number
  verified: boolean
}

interface Collection {
  id: string
  name: string
  description: string
  creator: string
  floorPrice: number
  volume24h: number
  items: number
  owners: number
  image: string
  banner: string
  verified: boolean
  royalty: number
  blockchain: string
}

const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Cosmic Warrior #1234",
    collection: "Cosmic Warriors",
    creator: "ArtistDAO",
    price: 2.5,
    currency: "ETH",
    image: "/placeholder.svg?height=300&width=300",
    rarity: "Legendary",
    attributes: [
      { trait_type: "Background", value: "Nebula" },
      { trait_type: "Armor", value: "Quantum" },
      { trait_type: "Weapon", value: "Plasma Sword" },
      { trait_type: "Eyes", value: "Laser" },
    ],
    likes: 234,
    views: 1567,
    isLiked: false,
    lastSale: 2.8,
    priceHistory: [
      { price: 1.5, date: "2024-01-15" },
      { price: 2.1, date: "2024-01-18" },
      { price: 2.8, date: "2024-01-20" },
    ],
    description: "A legendary cosmic warrior from the distant future, wielding quantum armor and plasma weapons.",
    tokenId: "1234",
    blockchain: "Ethereum",
    royalty: 5,
    verified: true,
  },
  {
    id: "2",
    name: "Digital Dragon #567",
    collection: "Mythical Beasts",
    creator: "DragonMaster",
    price: 1.8,
    currency: "ETH",
    image: "/placeholder.svg?height=300&width=300",
    rarity: "Epic",
    attributes: [
      { trait_type: "Element", value: "Fire" },
      { trait_type: "Wings", value: "Crystal" },
      { trait_type: "Breath", value: "Lightning" },
      { trait_type: "Scale Color", value: "Emerald" },
    ],
    likes: 189,
    views: 892,
    isLiked: true,
    lastSale: 1.6,
    priceHistory: [
      { price: 1.2, date: "2024-01-16" },
      { price: 1.6, date: "2024-01-19" },
    ],
    description: "A majestic digital dragon with crystal wings and lightning breath, guardian of the digital realm.",
    tokenId: "567",
    blockchain: "Ethereum",
    royalty: 7.5,
    verified: true,
  },
  {
    id: "3",
    name: "Cyber Punk #890",
    collection: "Future City",
    creator: "NeonArt",
    price: 0.75,
    currency: "ETH",
    image: "/placeholder.svg?height=300&width=300",
    rarity: "Rare",
    attributes: [
      { trait_type: "Hair", value: "Neon Blue" },
      { trait_type: "Jacket", value: "Leather" },
      { trait_type: "Glasses", value: "AR Visor" },
      { trait_type: "Background", value: "Neon City" },
    ],
    likes: 156,
    views: 743,
    isLiked: false,
    priceHistory: [
      { price: 0.5, date: "2024-01-17" },
      { price: 0.65, date: "2024-01-19" },
    ],
    description: "A cyberpunk character from the neon-lit streets of the future city.",
    tokenId: "890",
    blockchain: "Polygon",
    royalty: 2.5,
    verified: false,
  },
]

const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Cosmic Warriors",
    description: "A collection of 10,000 unique cosmic warriors from the distant future.",
    creator: "ArtistDAO",
    floorPrice: 1.2,
    volume24h: 45.6,
    items: 10000,
    owners: 3456,
    image: "/placeholder.svg?height=100&width=100",
    banner: "/placeholder.svg?height=200&width=800",
    verified: true,
    royalty: 5,
    blockchain: "Ethereum",
  },
  {
    id: "2",
    name: "Mythical Beasts",
    description: "Legendary creatures from ancient mythology brought to the digital world.",
    creator: "DragonMaster",
    floorPrice: 0.8,
    volume24h: 23.4,
    items: 5000,
    owners: 1876,
    image: "/placeholder.svg?height=100&width=100",
    banner: "/placeholder.svg?height=200&width=800",
    verified: true,
    royalty: 7.5,
    blockchain: "Ethereum",
  },
]

export default function NFTPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [nfts, setNfts] = useState<NFT[]>(mockNFTs)
  const [collections, setCollections] = useState<Collection[]>(mockCollections)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [showNFTDialog, setShowNFTDialog] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("price-low")
  const [filterRarity, setFilterRarity] = useState("all")
  const [filterCollection, setFilterCollection] = useState("all")
  const [activeTab, setActiveTab] = useState("nfts")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access the NFT marketplace.",
        variant: "destructive",
      })
      return
    }
  }, [status, router, toast])

  const filteredNFTs = nfts
    .filter((nft) => {
      const matchesSearch =
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRarity = filterRarity === "all" || nft.rarity === filterRarity
      const matchesCollection = filterCollection === "all" || nft.collection === filterCollection
      return matchesSearch && matchesRarity && matchesCollection
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "likes":
          return b.likes - a.likes
        case "recent":
          return (
            new Date(b.priceHistory[b.priceHistory.length - 1]?.date || "").getTime() -
            new Date(a.priceHistory[a.priceHistory.length - 1]?.date || "").getTime()
          )
        default:
          return 0
      }
    })

  const handleLike = (nftId: string) => {
    setNfts((prev) =>
      prev.map((nft) =>
        nft.id === nftId ? { ...nft, isLiked: !nft.isLiked, likes: nft.isLiked ? nft.likes - 1 : nft.likes + 1 } : nft,
      ),
    )
  }

  const handlePurchase = async () => {
    if (!selectedNFT) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${selectedNFT.name} for ${selectedNFT.price} ${selectedNFT.currency}`,
      })

      setShowPurchaseDialog(false)
      setShowNFTDialog(false)
      setSelectedNFT(null)
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800"
      case "Rare":
        return "bg-blue-100 text-blue-800"
      case "Epic":
        return "bg-purple-100 text-purple-800"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Discover, collect, and trade unique digital assets
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold">1,234 ETH</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Floor Price</p>
                  <p className="text-2xl font-bold">0.5 ETH</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">5,678</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
                <Palette className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="nfts" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCollection} onValueChange={setFilterCollection}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.name}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="recent">Recently Listed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* NFT Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredNFTs.map((nft) => (
                <Card
                  key={nft.id}
                  className={`group cursor-pointer transition-all hover:shadow-lg ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                  onClick={() => {
                    setSelectedNFT(nft)
                    setShowNFTDialog(true)
                  }}
                >
                  <div className={viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square"}>
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{nft.collection}</p>
                        <Badge className={`text-xs ${getRarityColor(nft.rarity)}`}>{nft.rarity}</Badge>
                      </div>
                      {nft.verified && <Verified className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold">
                          {nft.price} {nft.currency}
                        </p>
                        {nft.lastSale && (
                          <p className="text-sm text-muted-foreground">
                            Last: {nft.lastSale} {nft.currency}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(nft.id)
                          }}
                          className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${nft.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                          <span>{nft.likes}</span>
                        </button>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{nft.views}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedNFT(nft)
                          setShowPurchaseDialog(true)
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400">
                    <img
                      src={collection.banner || "/placeholder.svg"}
                      alt={`${collection.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={collection.image || "/placeholder.svg"}
                        alt={collection.name}
                        className="w-16 h-16 rounded-full border-4 border-white -mt-8"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold">{collection.name}</h3>
                          {collection.verified && <Verified className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">by {collection.creator}</p>
                        <p className="text-sm">{collection.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Floor Price</p>
                        <p className="text-lg font-bold">{collection.floorPrice} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="text-lg font-bold">{collection.volume24h} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="text-lg font-bold">{collection.items.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Owners</p>
                        <p className="text-lg font-bold">{collection.owners.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Royalty: {collection.royalty}%</span>
                        <span>•</span>
                        <span>{collection.blockchain}</span>
                      </div>
                      <Button variant="outline">View Collection</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "sale",
                      nft: "Cosmic Warrior #1234",
                      price: "2.5 ETH",
                      user: "0x1234...5678",
                      time: "2 minutes ago",
                    },
                    {
                      type: "listing",
                      nft: "Digital Dragon #567",
                      price: "1.8 ETH",
                      user: "0x9876...5432",
                      time: "5 minutes ago",
                    },
                    {
                      type: "offer",
                      nft: "Cyber Punk #890",
                      price: "0.7 ETH",
                      user: "0x5555...1111",
                      time: "10 minutes ago",
                    },
                    {
                      type: "transfer",
                      nft: "Space Cat #456",
                      price: "-",
                      user: "0x2222...9999",
                      time: "15 minutes ago",
                    },
                    {
                      type: "mint",
                      nft: "Future Bot #123",
                      price: "0.1 ETH",
                      user: "0x7777...3333",
                      time: "20 minutes ago",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === "sale"
                              ? "bg-green-100 text-green-600"
                              : activity.type === "listing"
                                ? "bg-blue-100 text-blue-600"
                                : activity.type === "offer"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : activity.type === "transfer"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {activity.type === "sale" && <DollarSign className="w-5 h-5" />}
                          {activity.type === "listing" && <ImageIcon className="w-5 h-5" />}
                          {activity.type === "offer" && <Star className="w-5 h-5" />}
                          {activity.type === "transfer" && <ExternalLink className="w-5 h-5" />}
                          {activity.type === "mint" && <Zap className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{activity.nft}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.type === "sale" && "Sold for"}
                            {activity.type === "listing" && "Listed for"}
                            {activity.type === "offer" && "Offer made for"}
                            {activity.type === "transfer" && "Transferred by"}
                            {activity.type === "mint" && "Minted for"}
                            {activity.price !== "-" && ` ${activity.price}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* NFT Details Dialog */}
        <Dialog open={showNFTDialog} onOpenChange={setShowNFTDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedNFT && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedNFT.image || "/placeholder.svg"}
                    alt={selectedNFT.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold">{selectedNFT.name}</h2>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{selectedNFT.collection}</p>
                    <p className="text-sm">{selectedNFT.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Current Price</h3>
                      <p className="text-3xl font-bold">
                        {selectedNFT.price} {selectedNFT.currency}
                      </p>
                      {selectedNFT.lastSale && (
                        <p className="text-sm text-muted-foreground">
                          Last sale: {selectedNFT.lastSale} {selectedNFT.currency}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Attributes</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.attributes.map((attr, index) => (
                          <div key={index} className="p-3 border rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                            <p className="font-semibold">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Token ID:</span>
                          <span>{selectedNFT.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blockchain:</span>
                          <span>{selectedNFT.blockchain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Creator Royalty:</span>
                          <span>{selectedNFT.royalty}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rarity:</span>
                          <Badge className={getRarityColor(selectedNFT.rarity)}>{selectedNFT.rarity}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1" onClick={() => setShowPurchaseDialog(true)}>
                        Buy Now
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Make Offer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                You are about to purchase this NFT. Please review the details below.
              </DialogDescription>
            </DialogHeader>
            {selectedNFT && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={selectedNFT.image || "/placeholder.svg"}
                    alt={selectedNFT.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedNFT.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedNFT.collection}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">
                      {selectedNFT.price} {selectedNFT.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creator Royalty ({selectedNFT.royalty}%):</span>
                    <span>
                      {((selectedNFT.price * selectedNFT.royalty) / 100).toFixed(4)} {selectedNFT.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (2.5%):</span>
                    <span>
                      {(selectedNFT.price * 0.025).toFixed(4)} {selectedNFT.currency}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">
                      {(selectedNFT.price * (1 + selectedNFT.royalty / 100 + 0.025)).toFixed(4)} {selectedNFT.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={loading}>
                {loading ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
