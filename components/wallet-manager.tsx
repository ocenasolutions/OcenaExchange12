"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Upload, ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletManagerProps {
  userId: string
}

interface Wallet {
  address: string
  balance: number
  network: string
}

interface Transaction {
  txHash: string
  amount: number
  token: string
  network: string
  status: string
  timestamp: string
  type: "deposit" | "withdrawal"
}

export function WalletManager({ userId }: WalletManagerProps) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depositAddress, setDepositAddress] = useState("")
  const [withdrawalAddress, setWithdrawalAddress] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const networks = [
    { id: "ethereum", name: "Ethereum", symbol: "ETH", fee: 0.001 },
    { id: "bsc", name: "BSC", symbol: "BNB", fee: 0.0005 },
    { id: "polygon", name: "Polygon", symbol: "MATIC", fee: 0.0001 },
  ]

  const tokens = [
    { symbol: "ETH", name: "Ethereum", network: "ethereum" },
    { symbol: "BTC", name: "Bitcoin", network: "bitcoin" },
    { symbol: "USDT", name: "Tether", network: "ethereum" },
    { symbol: "USDC", name: "USD Coin", network: "ethereum" },
    { symbol: "BNB", name: "BNB", network: "bsc" },
  ]

  useEffect(() => {
    fetchWallets()
    fetchTransactions()
  }, [userId])

  const fetchWallets = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/wallets`)
      const data = await response.json()
      if (response.ok) {
        setWallets(data.wallets)
        if (data.wallets.length > 0) {
          setDepositAddress(data.wallets[0].address)
        }
      }
    } catch (error) {
      console.error("Error fetching wallets:", error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/wallet-transactions`)
      const data = await response.json()
      if (response.ok) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  const generateWallet = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/wallets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network: selectedNetwork }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Wallet Generated",
          description: `New ${selectedNetwork} wallet created successfully`,
        })
        fetchWallets()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate wallet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawalAddress || !withdrawalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress: withdrawalAddress,
          amount: Number.parseFloat(withdrawalAmount),
          token: selectedToken,
          network: selectedNetwork,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Withdrawal Initiated",
          description: "Your withdrawal has been submitted for processing",
        })
        setWithdrawalAddress("")
        setWithdrawalAmount("")
        fetchTransactions()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to initiate withdrawal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <Card key={wallet.address}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{wallet.network.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{wallet.balance.toFixed(4)} ETH</div>
                <div className="text-sm text-gray-500 break-all">{wallet.address}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => copyToClipboard(wallet.address)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Deposit Crypto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Network</Label>
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {networks.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name} ({network.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Token</Label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {depositAddress && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <QRCodeSVG value={depositAddress} size={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Address</Label>
                    <div className="flex space-x-2">
                      <Input value={depositAddress} readOnly />
                      <Button variant="outline" onClick={() => copyToClipboard(depositAddress)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Only send {selectedToken} to this address. Sending other tokens may result in permanent loss.
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={generateWallet} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Generate New Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Withdraw Crypto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Network</Label>
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {networks.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name} ({network.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Token</Label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Address</Label>
                <Input
                  placeholder="Enter destination address"
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  step="any"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Network fee: {networks.find((n) => n.id === selectedNetwork)?.fee || 0} {selectedToken}
                </p>
              </div>

              <Button onClick={handleWithdraw} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Withdraw
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.txHash} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type === "deposit" ? <Download className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} {tx.token}
                        </div>
                        <div className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {tx.type === "deposit" ? "+" : "-"}
                        {tx.amount} {tx.token}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
