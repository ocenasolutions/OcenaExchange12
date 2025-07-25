"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, TrendingUp, BarChart3, RotateCcw, Volume2, Plus, Minus, ZoomIn, ZoomOut } from "lucide-react"

interface TradingViewChartProps {
  symbol?: string
  height?: number
  showVolume?: boolean
  showIndicators?: boolean
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Indicator {
  id: string
  name: string
  type: string
  enabled: boolean
  parameters: { [key: string]: any }
  data?: number[] | number[][]
}

export function TradingChart({
  symbol = "BTCUSDT",
  height = 500,
  showVolume = true,
  showIndicators = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<CandleData[]>([])
  const [currentInterval, setCurrentInterval] = useState("15m")
  const [chartType, setChartType] = useState("candlestick")
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouseX, setLastMouseX] = useState(0)

  // Available indicators
  const availableIndicators = [
    {
      id: "rsi",
      name: "RSI",
      type: "oscillator",
      parameters: { length: 14, upper: 70, lower: 30 },
      description: "Relative Strength Index (14)",
    },
    {
      id: "macd",
      name: "MACD",
      type: "oscillator",
      parameters: { fastLength: 12, slowLength: 26, signalLength: 9 },
      description: "Moving Average Convergence Divergence",
    },
    {
      id: "bb",
      name: "Bollinger Bands",
      type: "overlay",
      parameters: { length: 20, mult: 2.0 },
      description: "Bollinger Bands (20, 2.0)",
    },
    {
      id: "stoch",
      name: "Stochastic",
      type: "oscillator",
      parameters: { kLength: 14, dLength: 3, smooth: 3 },
      description: "Stochastic Oscillator (%K=14, %D=3)",
    },
    {
      id: "williams",
      name: "Williams %R",
      type: "oscillator",
      parameters: { length: 14 },
      description: "Williams Percent Range (14)",
    },
    {
      id: "ema",
      name: "EMA",
      type: "overlay",
      parameters: { length: 21 },
      description: "Exponential Moving Average (21)",
    },
    {
      id: "sma",
      name: "SMA",
      type: "overlay",
      parameters: { length: 50 },
      description: "Simple Moving Average (50)",
    },
  ]

  // Fetch initial data and setup WebSocket
  useEffect(() => {
    fetchInitialData()
    const cleanup = setupWebSocket()
    return cleanup
  }, [symbol, currentInterval])

  const fetchInitialData = async () => {
    try {
      setLoading(true)

      // Fetch ticker data
      const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      if (!tickerResponse.ok) throw new Error("Failed to fetch ticker")
      const ticker = await tickerResponse.json()

      setCurrentPrice(Number.parseFloat(ticker.lastPrice))
      setPriceChange(Number.parseFloat(ticker.priceChangePercent))
      setVolume24h(Number.parseFloat(ticker.volume))

      // Fetch candlestick data
      const klineResponse = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${currentInterval}&limit=200`,
      )
      if (!klineResponse.ok) throw new Error("Failed to fetch klines")
      const klines = await klineResponse.json()

      const candleData: CandleData[] = klines.map((kline: any[]) => ({
        time: kline[0],
        open: Number.parseFloat(kline[1]),
        high: Number.parseFloat(kline[2]),
        low: Number.parseFloat(kline[3]),
        close: Number.parseFloat(kline[4]),
        volume: Number.parseFloat(kline[5]),
      }))

      setData(candleData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      // Generate mock data as fallback
      generateMockData()
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const mockData: CandleData[] = []
    let price = 50000
    const now = Date.now()

    for (let i = 0; i < 200; i++) {
      const change = (Math.random() - 0.5) * 1000
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * 500
      const low = Math.min(open, close) - Math.random() * 500
      const volume = Math.random() * 1000000 + 500000

      mockData.push({
        time: now - (200 - i) * 60000,
        open,
        high,
        low,
        close,
        volume,
      })

      price = close
    }

    setData(mockData)
    setCurrentPrice(price)
    setPriceChange((Math.random() - 0.5) * 10)
    setVolume24h(50000000)
  }

  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${currentInterval}`)

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const kline = data.k

        const newCandle: CandleData = {
          time: kline.t,
          open: Number.parseFloat(kline.o),
          high: Number.parseFloat(kline.h),
          low: Number.parseFloat(kline.l),
          close: Number.parseFloat(kline.c),
          volume: Number.parseFloat(kline.v),
        }

        setData((prevData) => {
          const newData = [...prevData]
          const lastCandle = newData[newData.length - 1]

          if (lastCandle && lastCandle.time === newCandle.time) {
            newData[newData.length - 1] = newCandle
          } else {
            newData.push(newCandle)
            if (newData.length > 200) {
              newData.shift()
            }
          }

          return newData
        })

        setCurrentPrice(Number.parseFloat(kline.c))
      }

      ws.onerror = () => {
        console.log("WebSocket error, using mock data updates")
        // Fallback to mock updates
        const interval = setInterval(() => {
          setCurrentPrice((prev) => prev + (Math.random() - 0.5) * 100)
        }, 2000)
        return () => clearInterval(interval)
      }

      return () => ws.close()
    } catch (error) {
      console.error("WebSocket setup failed:", error)
      return () => {}
    }
  }

  // Technical indicator calculations
  const calculateSMA = (data: number[], period: number): number[] => {
    const sma = []
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    return sma
  }

  const calculateEMA = (data: number[], period: number): number[] => {
    const ema = []
    const multiplier = 2 / (period + 1)
    ema[0] = data[0]

    for (let i = 1; i < data.length; i++) {
      ema[i] = data[i] * multiplier + ema[i - 1] * (1 - multiplier)
    }
    return ema
  }

  const calculateRSI = (data: number[], period: number): number[] => {
    const rsi = []
    const gains = []
    const losses = []

    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      const rs = avgGain / (avgLoss || 0.001)
      rsi.push(100 - 100 / (1 + rs))
    }

    return rsi
  }

  const calculateBollingerBands = (data: number[], period: number, multiplier: number) => {
    const sma = calculateSMA(data, period)
    const bands = { upper: [], middle: [], lower: [] }

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const mean = sma[i - period + 1]
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
      const stdDev = Math.sqrt(variance)

      bands.middle.push(mean)
      bands.upper.push(mean + stdDev * multiplier)
      bands.lower.push(mean - stdDev * multiplier)
    }

    return bands
  }

  const calculateStochastic = (highs: number[], lows: number[], closes: number[], kPeriod: number, dPeriod: number) => {
    const k = []

    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1))
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1))
      const kValue = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100
      k.push(isNaN(kValue) ? 50 : kValue)
    }

    return k
  }

  const calculateWilliamsR = (highs: number[], lows: number[], closes: number[], period: number): number[] => {
    const williamsR = []

    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1))
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1))
      const wr = ((highestHigh - closes[i]) / (highestHigh - lowestLow)) * -100
      williamsR.push(isNaN(wr) ? -50 : wr)
    }

    return williamsR
  }

  // Canvas drawing function
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    // Calculate dimensions
    const padding = { top: 20, right: 80, bottom: 60, left: 80 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Calculate price range
    const prices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceBuffer = priceRange * 0.1

    // Calculate candle width and visible range
    const candleWidth = Math.max(2, (chartWidth / data.length) * zoom)
    const visibleCandles = Math.floor(chartWidth / candleWidth)
    const startIndex = Math.max(0, Math.floor(-panX / candleWidth))
    const endIndex = Math.min(data.length, startIndex + visibleCandles + 1)

    // Draw grid
    ctx.strokeStyle = "#2a2e39"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const y = padding.top + (i * chartHeight) / 10
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = "#888888"
    ctx.font = "12px Arial"
    ctx.textAlign = "right"
    for (let i = 0; i <= 10; i++) {
      const price = maxPrice + priceBuffer - (i * (priceRange + 2 * priceBuffer)) / 10
      const y = padding.top + (i * chartHeight) / 10
      ctx.fillText(price.toFixed(2), padding.left - 10, y + 4)
    }

    // Draw time labels
    ctx.textAlign = "center"
    const timeStep = Math.max(1, Math.floor((endIndex - startIndex) / 5))
    for (let i = startIndex; i < endIndex; i += timeStep) {
      if (data[i]) {
        const x = padding.left + panX + i * candleWidth + candleWidth / 2
        const time = new Date(data[i].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        ctx.fillText(time, x, height - 10)
      }
    }

    // Draw candlesticks or line
    for (let i = startIndex; i < endIndex; i++) {
      const candle = data[i]
      if (!candle) continue

      const x = padding.left + panX + i * candleWidth
      const openY =
        padding.top + ((maxPrice + priceBuffer - candle.open) / (priceRange + 2 * priceBuffer)) * chartHeight
      const closeY =
        padding.top + ((maxPrice + priceBuffer - candle.close) / (priceRange + 2 * priceBuffer)) * chartHeight
      const highY =
        padding.top + ((maxPrice + priceBuffer - candle.high) / (priceRange + 2 * priceBuffer)) * chartHeight
      const lowY = padding.top + ((maxPrice + priceBuffer - candle.low) / (priceRange + 2 * priceBuffer)) * chartHeight

      const isGreen = candle.close > candle.open
      const color = isGreen ? "#00ff88" : "#ff4444"

      if (chartType === "candlestick") {
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 1

        // High-low line
        ctx.beginPath()
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()

        // Body
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)

        if (bodyHeight < 1) {
          // Doji - draw line
          ctx.beginPath()
          ctx.moveTo(x + 1, bodyY)
          ctx.lineTo(x + candleWidth - 1, bodyY)
          ctx.stroke()
        } else {
          // Regular candle
          if (isGreen) {
            ctx.fillRect(x + 1, bodyY, candleWidth - 2, bodyHeight)
          } else {
            ctx.strokeRect(x + 1, bodyY, candleWidth - 2, bodyHeight)
          }
        }
      } else if (chartType === "line") {
        if (i > startIndex && data[i - 1]) {
          const prevCandle = data[i - 1]
          const prevX = padding.left + panX + (i - 1) * candleWidth + candleWidth / 2
          const prevY =
            padding.top + ((maxPrice + priceBuffer - prevCandle.close) / (priceRange + 2 * priceBuffer)) * chartHeight

          ctx.strokeStyle = "#00aaff"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x + candleWidth / 2, closeY)
          ctx.stroke()
        }
      }
    }

    // Draw overlay indicators
    activeIndicators.forEach((indicator) => {
      if (indicator.type === "overlay" && indicator.data) {
        if (indicator.id.includes("bb") && Array.isArray(indicator.data[0])) {
          // Bollinger Bands
          const [upper, middle, lower] = indicator.data as number[][]

          const drawBand = (values: number[], color: string, lineWidth = 1) => {
            if (values.length === 0) return
            ctx.strokeStyle = color
            ctx.lineWidth = lineWidth
            ctx.beginPath()

            for (let i = 0; i < values.length; i++) {
              const dataIndex = data.length - values.length + i
              if (dataIndex >= startIndex && dataIndex < endIndex) {
                const x = padding.left + panX + dataIndex * candleWidth + candleWidth / 2
                const y =
                  padding.top + ((maxPrice + priceBuffer - values[i]) / (priceRange + 2 * priceBuffer)) * chartHeight
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
            }
            ctx.stroke()
          }

          drawBand(upper, "#ff9800")
          drawBand(middle, "#2196f3", 2)
          drawBand(lower, "#ff9800")
        } else {
          // Single line indicators (EMA, SMA)
          const values = indicator.data as number[]
          if (values.length === 0) return

          ctx.strokeStyle = indicator.id.includes("ema") ? "#e91e63" : "#ffc107"
          ctx.lineWidth = 2
          ctx.beginPath()

          for (let i = 0; i < values.length; i++) {
            const dataIndex = data.length - values.length + i
            if (dataIndex >= startIndex && dataIndex < endIndex) {
              const x = padding.left + panX + dataIndex * candleWidth + candleWidth / 2
              const y =
                padding.top + ((maxPrice + priceBuffer - values[i]) / (priceRange + 2 * priceBuffer)) * chartHeight
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        }
      }
    })

    // Draw volume if enabled
    if (showVolume) {
      const volumeHeight = 80
      const volumeY = height - padding.bottom - volumeHeight
      const maxVolume = Math.max(...data.slice(startIndex, endIndex).map((d) => d.volume))

      for (let i = startIndex; i < endIndex; i++) {
        const candle = data[i]
        if (!candle) continue

        const x = padding.left + panX + i * candleWidth
        const volHeight = (candle.volume / maxVolume) * volumeHeight
        const isGreen = candle.close > candle.open

        ctx.fillStyle = isGreen ? "#00ff8844" : "#ff444444"
        ctx.fillRect(x + 1, volumeY + volumeHeight - volHeight, candleWidth - 2, volHeight)
      }

      // Volume label
      ctx.fillStyle = "#888888"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText("Volume", padding.left, volumeY - 5)
    }

    // Draw oscillator indicators at bottom
    const oscillatorIndicators = activeIndicators.filter((ind) => ind.type === "oscillator")
    if (oscillatorIndicators.length > 0) {
      const oscillatorHeight = 100
      const oscillatorY = height - padding.bottom - (showVolume ? 180 : 100)

      oscillatorIndicators.forEach((indicator, index) => {
        const yOffset = oscillatorY + index * oscillatorHeight

        // Background
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(padding.left, yOffset, chartWidth, oscillatorHeight)

        // Grid
        ctx.strokeStyle = "#2a2e39"
        ctx.lineWidth = 0.5
        for (let i = 0; i <= 4; i++) {
          const y = yOffset + (i * oscillatorHeight) / 4
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(padding.left + chartWidth, y)
          ctx.stroke()
        }

        if (indicator.data && (indicator.data as number[]).length > 0) {
          const values = indicator.data as number[]
          let minVal = Math.min(...values)
          let maxVal = Math.max(...values)

          // Adjust range for specific indicators
          if (indicator.id.includes("rsi")) {
            minVal = 0
            maxVal = 100
            // Draw RSI levels
            ctx.strokeStyle = "#666666"
            ctx.setLineDash([2, 2])
            const oversoldY = yOffset + oscillatorHeight - (30 / 100) * oscillatorHeight
            const overboughtY = yOffset + oscillatorHeight - (70 / 100) * oscillatorHeight
            ctx.beginPath()
            ctx.moveTo(padding.left, oversoldY)
            ctx.lineTo(padding.left + chartWidth, oversoldY)
            ctx.moveTo(padding.left, overboughtY)
            ctx.lineTo(padding.left + chartWidth, overboughtY)
            ctx.stroke()
            ctx.setLineDash([])
          } else if (indicator.id.includes("stoch")) {
            minVal = 0
            maxVal = 100
          } else if (indicator.id.includes("williams")) {
            minVal = -100
            maxVal = 0
          }

          const range = maxVal - minVal || 1

          // Draw indicator line
          const colors = {
            rsi: "#ff5722",
            stoch: "#2196f3",
            williams: "#9c27b0",
            macd: "#00aaff",
          }

          const colorKey = Object.keys(colors).find((key) => indicator.id.includes(key)) as keyof typeof colors
          ctx.strokeStyle = colors[colorKey] || "#00aaff"
          ctx.lineWidth = 2
          ctx.beginPath()

          for (let i = 0; i < values.length; i++) {
            const dataIndex = data.length - values.length + i
            if (dataIndex >= startIndex && dataIndex < endIndex) {
              const x = padding.left + panX + dataIndex * candleWidth + candleWidth / 2
              const y = yOffset + oscillatorHeight - ((values[i] - minVal) / range) * oscillatorHeight
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
          }
          ctx.stroke()

          // Draw indicator labels
          ctx.fillStyle = "#888888"
          ctx.font = "10px Arial"
          ctx.textAlign = "left"
          ctx.fillText(indicator.name, padding.left + 5, yOffset + 15)
          ctx.fillText(maxVal.toFixed(0), padding.left + 5, yOffset + 25)
          ctx.fillText(minVal.toFixed(0), padding.left + 5, yOffset + oscillatorHeight - 5)
        }
      })
    }

    // Draw crosshair
    if (mousePos.x > 0 && mousePos.y > 0) {
      ctx.strokeStyle = "#758696"
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(mousePos.x, padding.top)
      ctx.lineTo(mousePos.x, height - padding.bottom)
      ctx.stroke()

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(padding.left, mousePos.y)
      ctx.lineTo(padding.left + chartWidth, mousePos.y)
      ctx.stroke()

      ctx.setLineDash([])
    }
  }, [data, chartType, zoom, panX, activeIndicators, showVolume, mousePos])

  // Update indicators when data changes
  useEffect(() => {
    if (data.length === 0) return

    const closes = data.map((d) => d.close)
    const highs = data.map((d) => d.high)
    const lows = data.map((d) => d.low)

    setActiveIndicators((prev) =>
      prev.map((indicator) => {
        let calculatedData: any = null

        try {
          switch (true) {
            case indicator.id.includes("rsi"):
              calculatedData = calculateRSI(closes, indicator.parameters.length)
              break
            case indicator.id.includes("sma"):
              calculatedData = calculateSMA(closes, indicator.parameters.length)
              break
            case indicator.id.includes("ema"):
              calculatedData = calculateEMA(closes, indicator.parameters.length)
              break
            case indicator.id.includes("bb"):
              const bb = calculateBollingerBands(closes, indicator.parameters.length, indicator.parameters.mult)
              calculatedData = [bb.upper, bb.middle, bb.lower]
              break
            case indicator.id.includes("stoch"):
              calculatedData = calculateStochastic(
                highs,
                lows,
                closes,
                indicator.parameters.kLength,
                indicator.parameters.dLength,
              )
              break
            case indicator.id.includes("williams"):
              calculatedData = calculateWilliamsR(highs, lows, closes, indicator.parameters.length)
              break
          }
        } catch (error) {
          console.error(`Error calculating ${indicator.name}:`, error)
        }

        return { ...indicator, data: calculatedData }
      }),
    )
  }, [data])

  // Redraw chart when dependencies change
  useEffect(() => {
    const timer = setTimeout(drawChart, 10)
    return () => clearTimeout(timer)
  }, [drawChart])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(drawChart, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [drawChart])

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePos({ x, y })

    if (isDragging) {
      const deltaX = x - lastMouseX
      setPanX((prev) => prev + deltaX)
      setLastMouseX(x)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setLastMouseX(e.clientX - canvasRef.current!.getBoundingClientRect().left)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * zoomFactor)))
  }

  const addIndicator = (indicatorId: string) => {
    const indicator = availableIndicators.find((ind) => ind.id === indicatorId)
    if (!indicator) return

    const newIndicator: Indicator = {
      id: `${indicator.id}_${Date.now()}`,
      name: indicator.name,
      type: indicator.type,
      enabled: true,
      parameters: indicator.parameters,
    }

    setActiveIndicators((prev) => [...prev, newIndicator])
  }

  const removeIndicator = (indicatorId: string) => {
    setActiveIndicators((prev) => prev.filter((ind) => ind.id !== indicatorId))
  }

  const handleIntervalChange = (interval: string) => {
    setCurrentInterval(interval)
  }

  const handleChartTypeChange = (type: string) => {
    setChartType(type)
  }

  const zoomIn = () => setZoom((prev) => Math.min(5, prev * 1.2))
  const zoomOut = () => setZoom((prev) => Math.max(0.1, prev / 1.2))
  const resetView = () => {
    setZoom(1)
    setPanX(0)
  }

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "3m", label: "3m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "30m", label: "30m" },
    { value: "1h", label: "1h" },
    { value: "2h", label: "2h" },
    { value: "4h", label: "4h" },
    { value: "6h", label: "6h" },
    { value: "8h", label: "8h" },
    { value: "12h", label: "12h" },
    { value: "1d", label: "1D" },
    { value: "3d", label: "3D" },
    { value: "1w", label: "1W" },
    { value: "1M", label: "1M" },
  ]

  const chartTypes = [
    { value: "candlestick", label: "Candlesticks", icon: <BarChart3 className="w-4 h-4" /> },
    { value: "line", label: "Line", icon: <TrendingUp className="w-4 h-4" /> },
  ]

  if (loading) {
    return (
      <Card className="w-full h-full bg-gray-900 border-gray-700">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-white text-sm">Loading Chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full bg-gray-900 border-gray-700">
      <CardHeader className="pb-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {symbol}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                ${currentPrice.toFixed(2)}
              </Badge>
              <Badge
                variant="outline"
                className={`${priceChange >= 0 ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}`}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Vol: {(volume24h / 1000000).toFixed(1)}M
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Indicators Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  Indicators ({activeIndicators.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Technical Indicators</h4>

                  {/* Active Indicators */}
                  {activeIndicators.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-300">Active Indicators</h5>
                      {activeIndicators.map((indicator) => (
                        <div key={indicator.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <span className="text-sm text-white">{indicator.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIndicator(indicator.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Available Indicators */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-300">Available Indicators</h5>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {availableIndicators.map((indicator) => (
                        <Button
                          key={indicator.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => addIndicator(indicator.id)}
                          className="justify-start text-left h-auto p-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <div>
                            <div className="font-medium">{indicator.name}</div>
                            <div className="text-xs text-gray-400">{indicator.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" onClick={zoomOut} className="text-gray-400 hover:text-white">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomIn} className="text-gray-400 hover:text-white">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView} className="text-gray-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            {/* Timeframe Selection */}
            <div className="flex items-center space-x-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={currentInterval === tf.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleIntervalChange(tf.value)}
                  className={`h-7 px-2 text-xs ${
                    currentInterval === tf.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chart Type Selection */}
            <Tabs value={chartType} onValueChange={handleChartTypeChange}>
              <TabsList className="bg-gray-800 border-gray-700">
                {chartTypes.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {type.icon}
                    <span className="ml-1 text-xs">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Volume Toggle */}
            <Button variant={showVolume ? "default" : "ghost"} size="sm" className="text-gray-400 hover:text-white">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 bg-black relative">
        <div ref={containerRef} className="w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ height: `${height}px` }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default TradingChart
