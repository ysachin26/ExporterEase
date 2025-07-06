import { getDashboardData } from "@/app/actions"
import { FileText } from "lucide-react"
import Link from "next/link"
import DocumentCard from "./document-card"

export default async function Documents() {
  const data = await getDashboardData()
  const user = data.user
  
  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Documents</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Unable to load user data.</p>
        </div>
      </div>
    )
  }

  const documents = [
    {
      title: "GST Certificate",
      registrationNumber: user.gstNumber || "",
      certificateUrl: user.gstCertificate || "",
      status: "verified" as const,
      type: "gst" as const,
    },
    {
      title: "IEC Certificate", 
      registrationNumber: user.iecNumber || "",
      certificateUrl: user.iecCertificate || "",
      status: "verified" as const,
      type: "iec" as const,
    },
    {
      title: "DSC Certificate",
      registrationNumber: user.dscNumber || "",
      certificateUrl: user.dscCertificate || "",
      status: "verified" as const,
      type: "dsc" as const,
    },
    {
      title: "ICEGATE Certificate",
      registrationNumber: user.icegateNumber || "",
      certificateUrl: user.icegateCertificate || "",
      status: "verified" as const,
      type: "icegate" as const,
    },
    {
      title: "AD Code Certificate",
      registrationNumber: user.adcodeNumber || "",
      certificateUrl: user.adcodeCertificate || "",
      status: "verified" as const,
      type: "adcode" as const,
    },
  ]

  // Filter out documents that don't have either a certificate or registration number
  const availableDocuments = documents.filter(doc => 
    (doc.certificateUrl && doc.certificateUrl.trim() !== "") || 
    (doc.registrationNumber && doc.registrationNumber.trim() !== "")
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Documents</h1>
      
      {availableDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDocuments.map((doc, index) => (
            <DocumentCard
              key={index}
              title={doc.title}
              registrationNumber={doc.registrationNumber}
              certificateUrl={doc.certificateUrl}
              status={doc.status}
              type={doc.type}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
          <p className="text-gray-600 mb-4">
            You don't have any registration documents yet. Complete your registrations to see your certificates here.
          </p>
          <Link 
            href="/dashboard/registration" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Start Registration
          </Link>
        </div>
      )}
    </div>
  )
}
