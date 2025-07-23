"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, Minus, Move, TrendingUp } from "lucide-react"

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface DrawingLine {
  id: string
  type: "line" | "horizontal" | "vertical"
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
}

type ChartType = "candlestick" | "line" | "bar"
type Tool = "pan" | "line" | "horizontal" | "vertical"

export function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<CandleData[]>([])
  const [chartType, setChartType] = useState<ChartType>("candlestick")
  const [currentTool, setCurrentTool] = useState<Tool>("pan")
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [drawings, setDrawings] = useState<DrawingLine[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState<DrawingLine | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)

  // Generate initial mock data
  useEffect(() => {
    const generateData = () => {
      const basePrice = 50000
      const dataPoints: CandleData[] = []
      let currentPrice = basePrice

      for (let i = 0; i < 100; i++) {
        const time = Date.now() - (100 - i) * 60000
        const change = (Math.random() - 0.5) * 1000
        currentPrice += change

        const open = currentPrice
        const close = currentPrice + (Math.random() - 0.5) * 500
        const high = Math.max(open, close) + Math.random() * 200
        const low = Math.min(open, close) - Math.random() * 200
        const volume = Math.random() * 1000000

        dataPoints.push({ time, open, high, low, close, volume })
        currentPrice = close
      }

      return dataPoints
    }

    const initialData = generateData()
    setData(initialData)
    setCurrentPrice(initialData[initialData.length - 1].close)
  }, [])

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastCandle = prevData[prevData.length - 1]
        const change = (Math.random() - 0.5) * 100
        const newPrice = lastCandle.close + change

        setCurrentPrice(newPrice)
        setPriceChange(change)

        const newCandle: CandleData = {
          time: Date.now(),
          open: lastCandle.close,
          close: newPrice,
          high: Math.max(lastCandle.close, newPrice) + Math.random() * 50,
          low: Math.min(lastCandle.close, newPrice) - Math.random() * 50,
          volume: Math.random() * 1000000,
        }

        return [...prevData.slice(1), newCandle]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Drawing functions
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(zoom, zoom)

    // Calculate price range
    const prices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Chart dimensions
    const chartWidth = width - 100
    const chartHeight = height - 100
    const candleWidth = chartWidth / data.length

    // Draw grid
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const y = 50 + (i * chartHeight) / 10
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(50 + chartWidth, y)
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = "#888"
    ctx.font = "12px Arial"
    for (let i = 0; i <= 10; i++) {
      const price = maxPrice - (i * priceRange) / 10
      const y = 50 + (i * chartHeight) / 10
      ctx.fillText(price.toFixed(0), 10, y + 4)
    }

    // Draw chart based on type
    data.forEach((candle, index) => {
      const x = 50 + index * candleWidth
      const openY = 50 + ((maxPrice - candle.open) / priceRange) * chartHeight
      const closeY = 50 + ((maxPrice - candle.close) / priceRange) * chartHeight
      const highY = 50 + ((maxPrice - candle.high) / priceRange) * chartHeight
      const lowY = 50 + ((maxPrice - candle.low) / priceRange) * chartHeight

      if (chartType === "candlestick") {
        // Draw candlestick
        const isGreen = candle.close > candle.open
        ctx.strokeStyle = isGreen ? "#00ff88" : "#ff4444"
        ctx.fillStyle = isGreen ? "#00ff88" : "#ff4444"

        // High-low line
        ctx.beginPath()
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()

        // Body
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)
        ctx.fillRect(x + candleWidth * 0.2, bodyY, candleWidth * 0.6, bodyHeight)
      } else if (chartType === "line") {
        // Draw line chart
        ctx.strokeStyle = "#00aaff"
        ctx.lineWidth = 2
        if (index > 0) {
          const prevCandle = data[index - 1]
          const prevX = 50 + (index - 1) * candleWidth
          const prevY = 50 + ((maxPrice - prevCandle.close) / priceRange) * chartHeight

          ctx.beginPath()
          ctx.moveTo(prevX + candleWidth / 2, prevY)
          ctx.lineTo(x + candleWidth / 2, closeY)
          ctx.stroke()
        }
      } else if (chartType === "bar") {
        // Draw bar chart
        const isGreen = candle.close > candle.open
        ctx.fillStyle = isGreen ? "#00ff88" : "#ff4444"
        const barHeight = Math.abs(closeY - openY)
        const barY = Math.min(openY, closeY)
        ctx.fillRect(x + candleWidth * 0.1, barY, candleWidth * 0.8, barHeight)
      }
    })

    // Draw drawings
    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(drawing.startX, drawing.startY)
      ctx.lineTo(drawing.endX, drawing.endY)
      ctx.stroke()
    })

    // Draw current drawing
    if (currentDrawing) {
      ctx.strokeStyle = currentDrawing.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(currentDrawing.startX, currentDrawing.startY)
      ctx.lineTo(currentDrawing.endX, currentDrawing.endY)
      ctx.stroke()
    }

    ctx.restore()
  }, [data, chartType, zoom, panX, panY, drawings, currentDrawing])

  // Redraw chart when dependencies change
  useEffect(() => {
    drawChart()
  }, [drawChart])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentTool === "pan") {
      setIsPanning(true)
      setLastMousePos({ x, y })
    } else {
      setIsDrawing(true)
      const newDrawing: DrawingLine = {
        id: Date.now().toString(),
        type: currentTool,
        startX: x - panX,
        startY: y - panY,
        endX: x - panX,
        endY: y - panY,
        color: "#ffaa00",
      }
      setCurrentDrawing(newDrawing)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isPanning) {
      const deltaX = x - lastMousePos.x
      const deltaY = y - lastMousePos.y
      setPanX((prev) => prev + deltaX)
      setPanY((prev) => prev + deltaY)
      setLastMousePos({ x, y })
    } else if (isDrawing && currentDrawing) {
      setCurrentDrawing((prev) =>
        prev
          ? {
              ...prev,
              endX: currentTool === "horizontal" ? prev.endX : x - panX,
              endY: currentTool === "vertical" ? prev.endY : y - panY,
            }
          : null,
      )
    }
  }

  const handleMouseUp = () => {
    if (isDrawing && currentDrawing) {
      setDrawings((prev) => [...prev, currentDrawing])
      setCurrentDrawing(null)
    }
    setIsDrawing(false)
    setIsPanning(false)
  }

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * zoomFactor)))
  }

  const zoomIn = () => setZoom((prev) => Math.min(5, prev * 1.2))
  const zoomOut = () => setZoom((prev) => Math.max(0.1, prev / 1.2))
  const resetView = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const clearDrawings = () => {
    setDrawings([])
    setCurrentDrawing(null)
  }

  return (
    <Card className="w-full h-full bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            Trading Chart
            <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
              ${currentPrice.toFixed(2)}
            </Badge>
            <Badge
              variant="outline"
              className={`ml-2 ${priceChange >= 0 ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === "candlestick" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("candlestick")}
            >
              Candlestick
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
              Bar
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <Button
              variant={currentTool === "pan" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("pan")}
            >
              <Move className="w-4 h-4 mr-1" />
              Pan
            </Button>
            <Button
              variant={currentTool === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("line")}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Line
            </Button>
            <Button
              variant={currentTool === "horizontal" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("horizontal")}
            >
              <Minus className="w-4 h-4 mr-1" />
              H-Line
            </Button>
            <Button
              variant={currentTool === "vertical" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("vertical")}
            >
              <Minus className="w-4 h-4 mr-1 rotate-90" />
              V-Line
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="px-2">
              {Math.round(zoom * 100)}%
            </Badge>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearDrawings}>
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-[500px] cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
      </CardContent>
    </Card>
  )
}

export default TradingChart
