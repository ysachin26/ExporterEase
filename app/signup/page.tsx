"use client"

import { useActionState, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { signup, generateOtp } from "@/app/actions"

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, null)
const router = useRouter()
  const [businessType, setBusinessType] = useState<"Proprietorship" | "Partnership" | "LLP" | "PVT LTD" | "Other">(
    "Proprietorship",
  )
  const [mobileNo, setMobileNo] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpMessage, setOtpMessage] = useState("")

  const handleGenerateOtp = async () => {
    if (!mobileNo) {
      setOtpMessage("Please enter your mobile number first.")
      return
    }
    const result = await generateOtp(mobileNo)
    setOtpMessage(result.message)
    if (result.success) {
      setOtpSent(true)
    }
  }

useEffect(() => {
    if (state?.success) {
      router.push("/login")
    }
  }, [state, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-lg shadow-lg animate-fadeInUp">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-emerald-700">Business Registration</CardTitle>
          <CardDescription className="text-gray-600">
            Create your GoFarmlyConnect account to streamline your agricultural business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-gray-700">
                Full Name
              </Label>
              <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="mobileNo" className="text-gray-700">
                Mobile No.
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="mobileNo"
                  name="mobileNo"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  required
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleGenerateOtp}
                  disabled={otpSent}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {otpSent ? "OTP Sent!" : "Generate OTP"}
                </Button>
              </div>
              {otpMessage && <p className="text-sm text-gray-500 mt-1">{otpMessage}</p>}
            </div>
            {otpSent && (
              <div>
                <Label htmlFor="otp" className="text-gray-700">
                  Verify OTP
                </Label>
                <Input id="otp" name="otp" type="text" placeholder="Enter 6-digit OTP" required className="mt-1" />
              </div>
            )}
            <div>
              <Label htmlFor="businessType" className="text-gray-700">
                Business Type
              </Label>
              <Select
                onValueChange={(value: typeof businessType) => setBusinessType(value)}
                defaultValue={businessType}
                name="businessType"
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="LLP">LLP</SelectItem>
                  <SelectItem value="PVT LTD">PVT LTD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {businessType === "Other" && (
              <div>
                <Label htmlFor="otherBusinessType" className="text-gray-700">
                  Specify Other Business Type
                </Label>
                <Input
                  id="otherBusinessType"
                  name="otherBusinessType"
                  type="text"
                  placeholder="e.g., Co-operative Society"
                  required
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="businessName" className="text-gray-700">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="GoFarmly Innovations"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Create Password
              </Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-lg font-semibold"
            >
              Sign Up
            </Button>
            {state?.message && (
              <p className={`text-center text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
                {state.message}
              </p>
            )}
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
