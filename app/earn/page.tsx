"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Coins, Award, AlertTriangle, Info, Rocket, PieChart, Lock, Calendar, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink } from "@/components/ui/icons" // Import ExternalLink component

interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  tvl: number
  minStake: number
  lockPeriod: number
  risk: "Low" | "Medium" | "High"
  description: string
  rewards: string[]
  isActive: boolean
  userStaked?: number
  userRewards?: number
}

interface LaunchpadProject {
  id: string
  name: string
  symbol: string
  description: string
  totalRaise: number
  currentRaise: number
  price: number
  startDate: string
  endDate: string
  status: "upcoming" | "active" | "ended"
  minInvestment: number
  maxInvestment: number
  participants: number
  image: string
  website: string
  whitepaper: string
  tokenomics: {
    totalSupply: number
    publicSale: number
    team: number
    marketing: number
    development: number
  }
  team: Array<{
    name: string
    role: string
    image: string
  }>
  roadmap: Array<{
    quarter: string
    milestones: string[]
  }>
}

interface YieldFarm {
  id: string
  name: string
  pair: string
  apy: number
  tvl: number
  rewards: string[]
  multiplier: number
  depositFee: number
  withdrawalFee: number
  harvestLockup: number
  isActive: boolean
  userLiquidity?: number
  userRewards?: number
  impermanentLoss?: number
}

const mockStakingPools: StakingPool[] = [
  {
    id: "1",
    name: "Bitcoin Staking",
    token: "BTC",
    apy: 8.5,
    tvl: 125000000,
    minStake: 0.01,
    lockPeriod: 30,
    risk: "Low",
    description: "Stake your Bitcoin and earn rewards with minimal risk. Perfect for long-term holders.",
    rewards: ["BTC", "Platform Tokens"],
    isActive: true,
    userStaked: 0.5,
    userRewards: 0.0234,
  },
  {
    id: "2",
    name: "Ethereum 2.0 Staking",
    token: "ETH",
    apy: 12.3,
    tvl: 89000000,
    minStake: 0.1,
    lockPeriod: 90,
    risk: "Medium",
    description: "Participate in Ethereum 2.0 staking and help secure the network while earning rewards.",
    rewards: ["ETH", "Staking Rewards"],
    isActive: true,
    userStaked: 2.5,
    userRewards: 0.156,
  },
  {
    id: "3",
    name: "DeFi Yield Pool",
    token: "DEFI",
    apy: 25.7,
    tvl: 45000000,
    minStake: 100,
    lockPeriod: 180,
    risk: "High",
    description: "High-yield DeFi staking pool with premium rewards for risk-tolerant investors.",
    rewards: ["DEFI", "Governance Tokens", "NFT Rewards"],
    isActive: true,
  },
]

const mockLaunchpadProjects: LaunchpadProject[] = [
  {
    id: "1",
    name: "MetaVerse Protocol",
    symbol: "MVP",
    description: "A revolutionary metaverse platform connecting virtual worlds with real-world assets.",
    totalRaise: 5000000,
    currentRaise: 3250000,
    price: 0.25,
    startDate: "2024-02-01",
    endDate: "2024-02-15",
    status: "active",
    minInvestment: 100,
    maxInvestment: 10000,
    participants: 1247,
    image: "/placeholder.svg?height=200&width=200",
    website: "https://metaverseprotocol.io",
    whitepaper: "https://metaverseprotocol.io/whitepaper.pdf",
    tokenomics: {
      totalSupply: 1000000000,
      publicSale: 20,
      team: 15,
      marketing: 10,
      development: 25,
    },
    team: [
      { name: "Alice Johnson", role: "CEO", image: "/placeholder.svg?height=100&width=100" },
      { name: "Bob Smith", role: "CTO", image: "/placeholder.svg?height=100&width=100" },
    ],
    roadmap: [
      { quarter: "Q1 2024", milestones: ["Platform Launch", "NFT Integration"] },
      { quarter: "Q2 2024", milestones: ["Mobile App", "Cross-chain Bridge"] },
    ],
  },
  {
    id: "2",
    name: "Green Energy Token",
    symbol: "GET",
    description: "Tokenizing renewable energy assets and creating a sustainable future.",
    totalRaise: 3000000,
    currentRaise: 750000,
    price: 0.15,
    startDate: "2024-02-20",
    endDate: "2024-03-05",
    status: "upcoming",
    minInvestment: 50,
    maxInvestment: 5000,
    participants: 0,
    image: "/placeholder.svg?height=200&width=200",
    website: "https://greenenergytoken.io",
    whitepaper: "https://greenenergytoken.io/whitepaper.pdf",
    tokenomics: {
      totalSupply: 500000000,
      publicSale: 25,
      team: 20,
      marketing: 15,
      development: 20,
    },
    team: [
      { name: "Carol Green", role: "Founder", image: "/placeholder.svg?height=100&width=100" },
      { name: "David Brown", role: "Lead Developer", image: "/placeholder.svg?height=100&width=100" },
    ],
    roadmap: [
      { quarter: "Q2 2024", milestones: ["Token Launch", "Partnership Announcements"] },
      { quarter: "Q3 2024", milestones: ["Energy Trading Platform", "Mobile Wallet"] },
    ],
  },
]

const mockYieldFarms: YieldFarm[] = [
  {
    id: "1",
    name: "BTC-ETH LP",
    pair: "BTC/ETH",
    apy: 45.2,
    tvl: 25000000,
    rewards: ["Platform Tokens", "Trading Fees"],
    multiplier: 2.5,
    depositFee: 0,
    withdrawalFee: 0.1,
    harvestLockup: 24,
    isActive: true,
    userLiquidity: 5000,
    userRewards: 125.5,
    impermanentLoss: -2.3,
  },
  {
    id: "2",
    name: "USDC-USDT LP",
    pair: "USDC/USDT",
    apy: 18.7,
    tvl: 45000000,
    rewards: ["Stablecoin Rewards"],
    multiplier: 1.0,
    depositFee: 0,
    withdrawalFee: 0,
    harvestLockup: 0,
    isActive: true,
    userLiquidity: 10000,
    userRewards: 89.25,
    impermanentLoss: 0,
  },
]

export default function EarnPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(mockStakingPools)
  const [launchpadProjects, setLaunchpadProjects] = useState<LaunchpadProject[]>(mockLaunchpadProjects)
  const [yieldFarms, setYieldFarms] = useState<YieldFarm[]>(mockYieldFarms)
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null)
  const [selectedProject, setSelectedProject] = useState<LaunchpadProject | null>(null)
  const [selectedFarm, setSelectedFarm] = useState<YieldFarm | null>(null)
  const [showStakeDialog, setShowStakeDialog] = useState(false)
  const [showInvestDialog, setShowInvestDialog] = useState(false)
  const [showFarmDialog, setShowFarmDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("")
  const [investAmount, setInvestAmount] = useState("")
  const [farmAmount, setFarmAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("staking")

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access earning opportunities.",
        variant: "destructive",
      })
      return
    }
  }, [status, router, toast])

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Staking Successful!",
        description: `Successfully staked ${stakeAmount} ${selectedPool.token}`,
      })

      setShowStakeDialog(false)
      setStakeAmount("")
      setSelectedPool(null)
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "There was an error processing your stake. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInvest = async () => {
    if (!selectedProject || !investAmount) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Investment Successful!",
        description: `Successfully invested $${investAmount} in ${selectedProject.name}`,
      })

      setShowInvestDialog(false)
      setInvestAmount("")
      setSelectedProject(null)
    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "There was an error processing your investment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ended":
        return "bg-gray-100 text-gray-800"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Earn Crypto
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Maximize your crypto earnings through staking, yield farming, and launchpad investments
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staked</p>
                  <p className="text-2xl font-bold">$12,450</p>
                  <p className="text-xs text-green-600">+8.5% APY</p>
                </div>
                <Coins className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <p className="text-2xl font-bold">$234.56</p>
                  <p className="text-xs text-blue-600">Ready to claim</p>
                </div>
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LP Tokens</p>
                  <p className="text-2xl font-bold">$15,000</p>
                  <p className="text-xs text-purple-600">45.2% APY</p>
                </div>
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Launchpad Invested</p>
                  <p className="text-2xl font-bold">$5,000</p>
                  <p className="text-xs text-orange-600">3 projects</p>
                </div>
                <Rocket className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
            <TabsTrigger value="farming">Yield Farming</TabsTrigger>
          </TabsList>

          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {stakingPools.map((pool) => (
                <Card key={pool.id} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {pool.token}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pool.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{pool.token} Staking</p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(pool.risk)}>{pool.risk} Risk</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">APY</p>
                        <p className="text-2xl font-bold text-green-600">{pool.apy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TVL</p>
                        <p className="text-lg font-semibold">${(pool.tvl / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Min Stake</p>
                        <p className="text-sm font-semibold">
                          {pool.minStake} {pool.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lock Period</p>
                        <p className="text-sm font-semibold">{pool.lockPeriod} days</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Rewards</p>
                      <div className="flex flex-wrap gap-1">
                        {pool.rewards.map((reward, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reward}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{pool.description}</p>

                    {pool.userStaked && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Your Stake</span>
                          <span className="font-semibold">
                            {pool.userStaked} {pool.token}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pending Rewards</span>
                          <span className="font-semibold text-green-600">
                            {pool.userRewards} {pool.token}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedPool(pool)
                          setShowStakeDialog(true)
                        }}
                      >
                        {pool.userStaked ? "Add Stake" : "Start Staking"}
                      </Button>
                      {pool.userStaked && <Button variant="outline">Claim Rewards</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="launchpad" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {launchpadProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.symbol}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{((project.currentRaise / project.totalRaise) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(project.currentRaise / project.totalRaise) * 100} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${project.currentRaise.toLocaleString()} raised</span>
                        <span>${project.totalRaise.toLocaleString()} goal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Token Price</p>
                        <p className="text-lg font-bold">${project.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Participants</p>
                        <p className="text-lg font-bold">{project.participants.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Min Investment</p>
                        <p className="text-sm font-semibold">${project.minInvestment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max Investment</p>
                        <p className="text-sm font-semibold">${project.maxInvestment.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        disabled={project.status !== "active"}
                        onClick={() => {
                          setSelectedProject(project)
                          setShowInvestDialog(true)
                        }}
                      >
                        {project.status === "active"
                          ? "Invest Now"
                          : project.status === "upcoming"
                            ? "Coming Soon"
                            : "Ended"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowProjectDialog(true)
                        }}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="farming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {yieldFarms.map((farm) => (
                <Card key={farm.id} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {farm.pair.split("/")[0]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{farm.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{farm.pair} Liquidity Pool</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{farm.multiplier}x</Badge>
                        {farm.isActive && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">APY</p>
                        <p className="text-2xl font-bold text-green-600">{farm.apy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TVL</p>
                        <p className="text-lg font-semibold">${(farm.tvl / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deposit Fee</p>
                        <p className="text-sm font-semibold">{farm.depositFee}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Withdrawal Fee</p>
                        <p className="text-sm font-semibold">{farm.withdrawalFee}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Rewards</p>
                      <div className="flex flex-wrap gap-1">
                        {farm.rewards.map((reward, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reward}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {farm.harvestLockup > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>Harvest lockup: {farm.harvestLockup}h</span>
                      </div>
                    )}

                    {farm.userLiquidity && (
                      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Your Liquidity</span>
                          <span className="font-semibold">${farm.userLiquidity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pending Rewards</span>
                          <span className="font-semibold text-green-600">${farm.userRewards?.toFixed(2)}</span>
                        </div>
                        {farm.impermanentLoss !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Impermanent Loss</span>
                            <span
                              className={`font-semibold ${farm.impermanentLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {farm.impermanentLoss >= 0 ? "+" : ""}
                              {farm.impermanentLoss}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedFarm(farm)
                          setShowFarmDialog(true)
                        }}
                      >
                        {farm.userLiquidity ? "Add Liquidity" : "Start Farming"}
                      </Button>
                      {farm.userLiquidity && <Button variant="outline">Harvest</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Staking Dialog */}
        <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stake {selectedPool?.token}</DialogTitle>
              <DialogDescription>
                Stake your {selectedPool?.token} tokens to earn rewards. Minimum stake: {selectedPool?.minStake}{" "}
                {selectedPool?.token}
              </DialogDescription>
            </DialogHeader>
            {selectedPool && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">APY</p>
                      <p className="font-semibold text-green-600">{selectedPool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lock Period</p>
                      <p className="font-semibold">{selectedPool.lockPeriod} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <Badge className={getRiskColor(selectedPool.risk)}>{selectedPool.risk}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Stake</p>
                      <p className="font-semibold">
                        {selectedPool.minStake} {selectedPool.token}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder={`Min: ${selectedPool.minStake} ${selectedPool.token}`}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: 10.5 {selectedPool.token}</span>
                    <button onClick={() => setStakeAmount("10.5")} className="text-blue-600 hover:underline">
                      Max
                    </button>
                  </div>
                </div>

                {stakeAmount && Number.parseFloat(stakeAmount) >= selectedPool.minStake && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Annual Rewards:</span>
                      <span className="font-semibold text-green-600">
                        {((Number.parseFloat(stakeAmount) * selectedPool.apy) / 100).toFixed(4)} {selectedPool.token}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Your tokens will be locked for {selectedPool.lockPeriod} days</li>
                        <li>• Early withdrawal may result in penalties</li>
                        <li>• Rewards are distributed automatically</li>
                        <li>• APY may vary based on market conditions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStakeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStake}
                disabled={
                  loading || !stakeAmount || (selectedPool && Number.parseFloat(stakeAmount) < selectedPool.minStake)
                }
              >
                {loading ? "Staking..." : "Confirm Stake"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Investment Dialog */}
        <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invest in {selectedProject?.name}</DialogTitle>
              <DialogDescription>
                Participate in the {selectedProject?.name} token sale. Min: ${selectedProject?.minInvestment} | Max: $
                {selectedProject?.maxInvestment?.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Token Price</p>
                      <p className="font-semibold">${selectedProject.price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-semibold">
                        {((selectedProject.currentRaise / selectedProject.totalRaise) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participants</p>
                      <p className="font-semibold">{selectedProject.participants.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Left</p>
                      <p className="font-semibold">5 days</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invest-amount">Investment Amount (USD)</Label>
                  <Input
                    id="invest-amount"
                    type="number"
                    placeholder={`Min: $${selectedProject.minInvestment}`}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: $25,000</span>
                    <button
                      onClick={() => setInvestAmount(selectedProject.maxInvestment.toString())}
                      className="text-blue-600 hover:underline"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {investAmount && Number.parseFloat(investAmount) >= selectedProject.minInvestment && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>You will receive:</span>
                      <span className="font-semibold">
                        {(Number.parseFloat(investAmount) / selectedProject.price).toLocaleString()}{" "}
                        {selectedProject.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Token allocation:</span>
                      <span className="font-semibold">
                        {((Number.parseFloat(investAmount) / selectedProject.totalRaise) * 100).toFixed(4)}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Investment Terms</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Tokens will be distributed after the sale ends</li>
                        <li>• Vesting schedule may apply</li>
                        <li>• No refunds after investment confirmation</li>
                        <li>• KYC verification may be required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvestDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvest}
                disabled={
                  loading ||
                  !investAmount ||
                  (selectedProject && Number.parseFloat(investAmount) < selectedProject.minInvestment)
                }
              >
                {loading ? "Processing..." : "Confirm Investment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Details Dialog */}
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProject && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedProject.image || "/placeholder.svg"}
                      alt={selectedProject.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                      <DialogDescription className="text-lg">
                        {selectedProject.symbol} • {selectedProject.description}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Sale Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Token Price:</span>
                              <span className="font-semibold">${selectedProject.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Raise:</span>
                              <span className="font-semibold">${selectedProject.totalRaise.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Raise:</span>
                              <span className="font-semibold">${selectedProject.currentRaise.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Participants:</span>
                              <span className="font-semibold">{selectedProject.participants.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Investment Limits</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Minimum:</span>
                              <span className="font-semibold">${selectedProject.minInvestment}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Maximum:</span>
                              <span className="font-semibold">${selectedProject.maxInvestment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Start Date:</span>
                              <span className="font-semibold">
                                {new Date(selectedProject.startDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>End Date:</span>
                              <span className="font-semibold">
                                {new Date(selectedProject.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex space-x-4">
                      <Button variant="outline" asChild>
                        <a href={selectedProject.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Website
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={selectedProject.whitepaper} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Whitepaper
                        </a>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tokenomics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Token Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Supply</p>
                              <p className="text-2xl font-bold">
                                {selectedProject.tokenomics.totalSupply.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Token Symbol</p>
                              <p className="text-2xl font-bold">{selectedProject.symbol}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(selectedProject.tokenomics)
                              .filter(([key]) => key !== "totalSupply")
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${value}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-semibold">{value}%</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.team.map((member, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={member.image || "/placeholder.svg"}
                                alt={member.name}
                                className="w-16 h-16 rounded-full"
                              />
                              <div>
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="roadmap" className="space-y-4">
                    <div className="space-y-6">
                      {selectedProject.roadmap.map((phase, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5" />
                              <span>{phase.quarter}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {phase.milestones.map((milestone, milestoneIndex) => (
                                <li key={milestoneIndex} className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>{milestone}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Yield Farm Dialog */}
        <Dialog open={showFarmDialog} onOpenChange={setShowFarmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Liquidity to {selectedFarm?.name}</DialogTitle>
              <DialogDescription>Provide liquidity to earn trading fees and farming rewards</DialogDescription>
            </DialogHeader>
            {selectedFarm && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">APY</p>
                      <p className="font-semibold text-green-600">{selectedFarm.apy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Multiplier</p>
                      <p className="font-semibold">{selectedFarm.multiplier}x</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deposit Fee</p>
                      <p className="font-semibold">{selectedFarm.depositFee}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Withdrawal Fee</p>
                      <p className="font-semibold">{selectedFarm.withdrawalFee}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farm-amount">Liquidity Amount (USD)</Label>
                  <Input
                    id="farm-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={farmAmount}
                    onChange={(e) => setFarmAmount(e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: $50,000</span>
                    <button onClick={() => setFarmAmount("50000")} className="text-blue-600 hover:underline">
                      Max
                    </button>
                  </div>
                </div>

                {farmAmount && Number.parseFloat(farmAmount) > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Estimated Annual Rewards:</span>
                      <span className="font-semibold text-green-600">
                        ${((Number.parseFloat(farmAmount) * selectedFarm.apy) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily Rewards:</span>
                      <span className="font-semibold">
                        ${((Number.parseFloat(farmAmount) * selectedFarm.apy) / 100 / 365).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Impermanent Loss Risk</h4>
                      <p className="text-sm text-yellow-700">
                        Providing liquidity may result in impermanent loss if token prices diverge significantly.
                        Consider this risk before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFarmDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Liquidity Added!",
                    description: `Successfully added $${farmAmount} to ${selectedFarm?.name}`,
                  })
                  setShowFarmDialog(false)
                  setFarmAmount("")
                }}
                disabled={!farmAmount || Number.parseFloat(farmAmount) <= 0}
              >
                Add Liquidity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
