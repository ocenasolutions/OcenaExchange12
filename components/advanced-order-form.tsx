"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { DollarSign } from "lucide-react"

interface AdvancedOrderFormProps {
  symbol: string
  currentPrice: number
  balance: number
  onSubmitOrder: (order: any) => void
  loading?: boolean
}

export function AdvancedOrderForm({ symbol, currentPrice, balance, onSubmitOrder, loading }: AdvancedOrderFormProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop" | "stop_limit" | "oco">("market")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [timeInForce, setTimeInForce] = useState<"GTC" | "IOC" | "FOK">("GTC")
  const [postOnly, setPostOnly] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [percentageSlider, setPercentageSlider] = useState([0])

  const handlePercentageChange = (value: number[]) => {
    setPercentageSlider(value)
    const percentage = value[0]
    if (side === "buy") {
      const maxQuantity = balance / currentPrice
      setQuantity(((maxQuantity * percentage) / 100).toFixed(6))
    } else {
      const maxQuantity = balance // Assuming balance is the token balance for selling
      setQuantity(((maxQuantity * percentage) / 100).toFixed(6))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const order = {
      symbol,
      side,
      type: orderType,
      quantity: Number.parseFloat(quantity),
      price: price ? Number.parseFloat(price) : undefined,
      stopPrice: stopPrice ? Number.parseFloat(stopPrice) : undefined,
      timeInForce,
      postOnly,
      reduceOnly,
    }
    onSubmitOrder(order)
  }

  const calculateTotal = () => {
    const qty = Number.parseFloat(quantity) || 0
    const orderPrice = price ? Number.parseFloat(price) : currentPrice
    return qty * orderPrice
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Advanced Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-green-600">
                Buy {symbol}
              </TabsTrigger>
              <TabsTrigger value="sell" className="text-red-600">
                Sell {symbol}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                    <SelectItem value="oco">OCO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(orderType === "limit" || orderType === "stop_limit") && (
                <div className="space-y-2">
                  <Label>Price (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="any"
                  />
                </div>
              )}

              {(orderType === "stop" || orderType === "stop_limit") && (
                <div className="space-y-2">
                  <Label>Stop Price (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    step="any"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantity ({symbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="any"
                />
              </div>

              <div className="space-y-2">
                <Label>Percentage: {percentageSlider[0]}%</Label>
                <Slider
                  value={percentageSlider}
                  onValueChange={handlePercentageChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time in Force</Label>
                <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTC">GTC (Good Till Cancelled)</SelectItem>
                    <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
                    <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="post-only" checked={postOnly} onCheckedChange={setPostOnly} />
                <Label htmlFor="post-only">Post Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="reduce-only" checked={reduceOnly} onCheckedChange={setReduceOnly} />
                <Label htmlFor="reduce-only">Reduce Only</Label>
              </div>

              <div className="space-y-2">
                <Label>Total (USDT)</Label>
                <Input type="number" placeholder="0.00" value={calculateTotal().toFixed(2)} readOnly />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || !quantity}>
                {loading ? "Placing Order..." : `Buy ${symbol}`}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              {/* Similar structure for sell orders */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                    <SelectItem value="oco">OCO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(orderType === "limit" || orderType === "stop_limit") && (
                <div className="space-y-2">
                  <Label>Price (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="any"
                  />
                </div>
              )}

              {(orderType === "stop" || orderType === "stop_limit") && (
                <div className="space-y-2">
                  <Label>Stop Price (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    step="any"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantity ({symbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="any"
                />
              </div>

              <div className="space-y-2">
                <Label>Percentage: {percentageSlider[0]}%</Label>
                <Slider
                  value={percentageSlider}
                  onValueChange={handlePercentageChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time in Force</Label>
                <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTC">GTC (Good Till Cancelled)</SelectItem>
                    <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
                    <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="post-only" checked={postOnly} onCheckedChange={setPostOnly} />
                <Label htmlFor="post-only">Post Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="reduce-only" checked={reduceOnly} onCheckedChange={setReduceOnly} />
                <Label htmlFor="reduce-only">Reduce Only</Label>
              </div>

              <div className="space-y-2">
                <Label>Total (USDT)</Label>
                <Input type="number" placeholder="0.00" value={calculateTotal().toFixed(2)} readOnly />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading || !quantity}>
                {loading ? "Placing Order..." : `Sell ${symbol}`}
              </Button>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  )
}
