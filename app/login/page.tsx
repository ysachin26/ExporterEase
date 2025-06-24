"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { login } from "@/app/actions"

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null)
  const router = useRouter()

  // Handle successful login redirect
  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect)
    }
  }, [state, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fadeInUp">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-emerald-700">Login to GoFarmlyConnect</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your business account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="mobileNo" className="text-gray-700">
                Mobile No.
              </Label>
              <Input
                id="mobileNo"
                name="mobileNo"
                type="tel"
                placeholder="e.g., 9876543210"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="mt-1" />
            </div>
            <div className="text-right">
              <Link href="#" className="text-sm text-emerald-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-lg font-semibold"
            >
              Login
            </Button>
            {state?.message && (
              <p className={`text-center text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
                {state.message}
              </p>
            )}
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-emerald-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
