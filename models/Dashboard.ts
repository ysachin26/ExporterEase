import mongoose, { Schema, type Document, type Types } from "mongoose"

interface IDocument {
  name: string
  uploadedAt?: Date
  status: "pending" | "uploaded" | "verified" | "rejected"
  url?: string // Added for Cloudinary URL
}

interface IRegistrationStep {
  id: number
  name: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  icon: string
  completedAt?: Date
  documents: IDocument[]
}

interface INotification {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
}

export interface IDashboard extends Document {
  userId: Types.ObjectId
  hasStartedRegistration: boolean
  registrationSteps: Types.DocumentArray<IRegistrationStep>
  notifications: Types.DocumentArray<INotification>
  overallProgress: number
  profileCompletion: {
    completionPercentage: number
  }
  // Methods
  calculateOverallProgress(): void
  addNotification(title: string, message: string, type: string): INotification
}

const DocumentSchema: Schema = new Schema({
  name: { type: String, required: true },
  uploadedAt: { type: Date },
  status: { type: String, enum: ["pending", "uploaded", "verified", "rejected"], default: "pending" },
  url: { type: String }, // Added for Cloudinary URL
})

const RegistrationStepSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ["pending", "in-progress", "completed", "rejected"], default: "pending" },
  icon: { type: String, required: true },
  completedAt: { type: Date },
  documents: [DocumentSchema],
})

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const DashboardSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hasStartedRegistration: { type: Boolean, default: false },
    registrationSteps: [RegistrationStepSchema],
    notifications: [NotificationSchema],
    overallProgress: { type: Number, default: 0 },
    profileCompletion: {
      completionPercentage: { type: Number, default: 0 }, // Only store percentage here
    },
  },
  { timestamps: true },
)
  
// Methods for Dashboard Schema
DashboardSchema.methods.calculateOverallProgress = function () {
  const completedSteps = this.registrationSteps.filter((step: any) => step.status === "completed").length
  this.overallProgress =
    this.registrationSteps.length > 0 ? Math.round((completedSteps / this.registrationSteps.length) * 100) : 0
}

DashboardSchema.methods.addNotification = function (title: string, message: string, type: string) {
  const newNotification = { title, message, type, read: false, createdAt: new Date() }
  this.notifications.push(newNotification)
  // Return the added notification subdocument
  return this.notifications[this.notifications.length - 1]
}

const Dashboard = mongoose.models.Dashboard || mongoose.model<IDashboard>("Dashboard", DashboardSchema)

export default Dashboard
