"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Phone, Mail, FileText, HelpCircle, Check } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Contact form schema
const contactFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  attachments: z.any().optional(),
})

// FAQ data
const faqData = [
  {
    question: "What is GoFarmlyConnect?",
    answer:
      "GoFarmlyConnect is a comprehensive platform designed to streamline the exporter registration process in India. Our platform automates document verification, form filling, and application tracking to help businesses become export-ready quickly and efficiently.",
  },
  {
    question: "How do I get started with GoFarmlyConnect?",
    answer:
      "Getting started is easy! Simply register for an account, complete your profile information, upload the required documents, and begin the registration process. Our platform will guide you through each step of the process.",
  },
  {
    question: "What documents do I need to upload?",
    answer:
      "The documents required typically include your PAN card, Aadhaar card, business registration certificate, bank account details, and address proof. Additional documents may be required depending on your specific business type and the registrations you're applying for.",
  },
  {
    question: "How long does the registration process take?",
    answer:
      "The timeline varies depending on the type of registration and government processing times. GST registration typically takes 3-7 business days, while IEC registration can take 10-15 business days. Premium users enjoy expedited processing times.",
  },
  {
    question: "What is the difference between Standard and Premium accounts?",
    answer:
      "Standard accounts provide access to all basic features including document upload, form filling, and application tracking. Premium accounts offer additional benefits such as priority processing, dedicated support, and expedited verification services for a fee of ₹999.",
  },
  {
    question: "How secure is my data on GoFarmlyConnect?",
    answer:
      "We take data security very seriously. All documents and personal information are encrypted and securely stored. We comply with all data protection regulations and never share your information with unauthorized third parties.",
  },
  {
    question: "Can I track the status of my applications?",
    answer:
      "Yes, you can track the real-time status of all your applications through the Progress Tracker section. You'll also receive notifications via email and SMS (if enabled) about any status changes or required actions.",
  },
  {
    question: "What if my application is rejected?",
    answer:
      "If your application is rejected, we'll notify you immediately with the reason for rejection. Our platform will guide you on how to address the issues, make necessary corrections, and resubmit your application.",
  },
]

export default function Support() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("faq")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contact form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: "",
      category: "",
      message: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      })

      form.reset()
      setIsSuccess(true)
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">Get assistance with your export registration process</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact Us
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* FAQs Section */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about GoFarmlyConnect</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-600">{"Didn't find what you're looking for?"}</p>
              <Button variant="outline" className="text-primary" onClick={() => setActiveTab("contact")}>
                Contact Support
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contact Us Section */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {isSuccess ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">Support Request Received</h2>
                      <p className="text-gray-600 mb-4">
                        Thank you for contacting us. Our support team will get back to you within 24 hours.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSuccess(false)
                          form.reset()
                        }}
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief description of your issue" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="account">Account Issues</SelectItem>
                                  <SelectItem value="documents">Document Uploads</SelectItem>
                                  <SelectItem value="gst">GST Registration</SelectItem>
                                  <SelectItem value="iec">IEC Registration</SelectItem>
                                  <SelectItem value="icegate">ICEGATE Registration</SelectItem>
                                  <SelectItem value="adcode">AD Code</SelectItem>
                                  <SelectItem value="dsc">DSC Registration</SelectItem>
                                  <SelectItem value="payments">Payments</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please describe your issue in detail"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="attachments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attachments (Optional)</FormLabel>
                              <FormControl>
                                <Input type="file" className="cursor-pointer" />
                              </FormControl>
                              <FormDescription>
                                Upload screenshots or relevant documents (.png, .jpg, .pdf)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Support Request"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Alternative ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-gray-600">support@gofarmlyconnect.com</p>
                      <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-gray-600">+91 98765 43210</p>
                      <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-medium mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span>10:00 AM - 2:00 PM</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span>Closed</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Resources Section */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  User Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Comprehensive guide to using the GoFarmlyConnect platform</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Document Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Complete list of documents required for different registrations</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  GST Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Step-by-step guide to GST registration for exporters</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  IEC Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Detailed instructions for Import Export Code registration</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  ICEGATE Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Complete guide to ICEGATE registration and usage</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  AD Code Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Tutorial on Authorized Dealer Code registration process</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  DSC Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Digital Signature Certificate registration and usage guide</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download PDF
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Collection of video guides for using GoFarmlyConnect</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Videos
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
