import { Server } from "socket.io"
import WebSocket from "ws"

class WebSocketService {
  private static instance: WebSocketService
  private io: Server | null = null
  private binanceWs: WebSocket | null = null
  private subscribers: Map<string, Set<string>> = new Map()

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("subscribe", (symbols: string[]) => {
        symbols.forEach((symbol) => {
          if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, new Set())
          }
          this.subscribers.get(symbol)!.add(socket.id)
        })
        this.updateBinanceSubscription()
      })

      socket.on("unsubscribe", (symbols: string[]) => {
        symbols.forEach((symbol) => {
          if (this.subscribers.has(symbol)) {
            this.subscribers.get(symbol)!.delete(socket.id)
            if (this.subscribers.get(symbol)!.size === 0) {
              this.subscribers.delete(symbol)
            }
          }
        })
        this.updateBinanceSubscription()
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
        this.subscribers.forEach((sockets) => {
          sockets.delete(socket.id)
        })
      })
    })

    this.connectToBinance()
  }

  private connectToBinance() {
    if (this.binanceWs) {
      this.binanceWs.close()
    }

    this.binanceWs = new WebSocket("wss://stream.binance.com:9443/ws")

    this.binanceWs.on("open", () => {
      console.log("Connected to Binance WebSocket")
    })

    this.binanceWs.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "").toUpperCase()
          const subscribers = this.subscribers.get(symbol)
          if (subscribers && subscribers.size > 0) {
            this.io?.emit("price_update", {
              symbol,
              price: Number.parseFloat(message.data.c),
              change: Number.parseFloat(message.data.P),
              volume: Number.parseFloat(message.data.v),
            })
          }
        }
      } catch (error) {
        console.error("Error parsing Binance message:", error)
      }
    })

    this.binanceWs.on("error", (error) => {
      console.error("Binance WebSocket error:", error)
    })

    this.binanceWs.on("close", () => {
      console.log("Binance WebSocket closed, reconnecting...")
      setTimeout(() => this.connectToBinance(), 5000)
    })
  }

  private updateBinanceSubscription() {
    if (!this.binanceWs || this.binanceWs.readyState !== WebSocket.OPEN) {
      return
    }

    const symbols = Array.from(this.subscribers.keys())
    if (symbols.length === 0) {
      return
    }

    const streams = symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`)
    const subscribeMessage = {
      method: "SUBSCRIBE",
      params: streams,
      id: Date.now(),
    }

    this.binanceWs.send(JSON.stringify(subscribeMessage))
  }

  emitOrderUpdate(userId: string, order: any) {
    this.io?.to(userId).emit("order_update", order)
  }

  emitBalanceUpdate(userId: string, balance: any) {
    this.io?.to(userId).emit("balance_update", balance)
  }
}

export default WebSocketService
