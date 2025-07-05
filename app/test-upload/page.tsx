"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestUploadPage() {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "❌ File Size Too Large",
        description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
      })
      // Clear the input
      event.target.value = ""
      return
    }

    setSelectedFile(file)
    toast({
      title: "✅ File Selected Successfully",
      description: `File "${file.name}" (${(file.size / 1024).toFixed(2)}KB) is ready for upload.`,
    })
  }

  const testNotifications = () => {
    // Test different notification types
    toast({
      title: "ℹ️ Info Notification",
      description: "This is an informational message.",
    })

    setTimeout(() => {
      toast({
        variant: "destructive",
        title: "⚠️ Error Notification", 
        description: "This is an error message with destructive variant.",
      })
    }, 1000)

    setTimeout(() => {
      toast({
        title: "🎉 Success Notification",
        description: "This is a success message.",
      })
    }, 2000)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Test Page</CardTitle>
          <CardDescription>
            Test the file size limit notification system. Try uploading files larger than 1MB to see the error notification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Test */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-file">Select a file (1MB limit)</Label>
              <Input
                id="test-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <p className="text-sm text-gray-500">
                Try uploading a file larger than 1MB to test the notification
              </p>
            </div>

            {selectedFile && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Selected File:</h4>
                <ul className="text-sm text-green-800">
                  <li><strong>Name:</strong> {selectedFile.name}</li>
                  <li><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</li>
                  <li><strong>Type:</strong> {selectedFile.type}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Notification Test Buttons */}
          <div className="space-y-4">
            <h3 className="font-medium">Test Different Notifications:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testNotifications} variant="outline">
                Test All Notification Types
              </Button>
              
              <Button 
                onClick={() => toast({
                  variant: "destructive",
                  title: "❌ File Size Error",
                  description: "File size is 2.5MB. Please upload a file smaller than 1MB.",
                })}
                variant="destructive"
              >
                Test File Size Error
              </Button>

              <Button 
                onClick={() => toast({
                  title: "✅ Upload Success",
                  description: "File uploaded successfully!",
                })}
              >
                Test Success Message
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How to Test:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Select a file larger than 1MB using the file input above</li>
              <li>You should see a red error notification in the bottom-left corner</li>
              <li>Try selecting a file smaller than 1MB to see success behavior</li>
              <li>Use the test buttons to see different notification styles</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
