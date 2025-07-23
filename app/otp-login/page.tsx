"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function OTPLoginPage() {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  // Redirect if already authenticated
  if (status === "authenticated") {
    router.push("/dashboard")
    return null
  }

  const requestCode = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Check your inbox for the code." })
      setStep("code")
    } catch {
      toast({ title: "Unable to send code", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast({ title: "Logged in!" })
      router.push("/dashboard")
    } catch (err: any) {
      toast({ title: err.message || "Invalid code", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center mb-4">
              <span className="text-black font-bold text-lg">O</span>
            </div>
            <CardTitle className="text-2xl">OTP Login</CardTitle>
            <CardDescription>
              {step === "code"
                ? "Enter the verification code sent to your email"
                : "Enter your email to receive a verification code"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "email" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={loading || !email}
                  onClick={requestCode}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>

                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={loading || code.length !== 6}
                  onClick={verifyCode}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-yellow-600 p-0 h-auto"
                    onClick={() => setStep("email")}
                    disabled={loading}
                  >
                    Change email or resend code
                  </Button>
                </div>
              </>
            )}

            <div className="text-center text-sm pt-4">
              <div className="mb-2">
                <Link href="/login" className="text-yellow-600 hover:underline">
                  Back to password login
                </Link>
              </div>
              <div>
                Don't have an account?{" "}
                <Link href="/register" className="text-yellow-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
