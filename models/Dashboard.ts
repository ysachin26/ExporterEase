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
  // New field to store text details for each registration step
  details?: {
    // Flexible object to store various text inputs for each step
    [key: string]: any // Allows for any key-value pair
  }
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
  details: { type: Schema.Types.Mixed }, // New: Flexible object for text details
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
    profileCompletion: {},
  },
  { timestamps: true },
)

DashboardSchema.pre("save", function (next) {
  if (this.isNew || (this.isModified("hasStartedRegistration") && this.hasStartedRegistration)) {
    if (!this.registrationSteps || (this.registrationSteps as any).length === 0 || this.isNew) {
      this.registrationSteps = [
        { id: 1, name: "Registration", status: "completed", icon: "UserPlus", documents: [], details: {} },
        { id: 2, name: "GST Registration", status: "pending", icon: "FileText", documents: [], details: {} },
        { id: 3, name: "IEC Code", status: "pending", icon: "Globe", documents: [], details: {} },
        { id: 4, name: "DSC Registration", status: "pending", icon: "Key", documents: [], details: {} },
        { id: 5, name: "ICEGATE Registration", status: "pending", icon: "Truck", documents: [], details: {} },
        { id: 6, name: "AD Code", status: "pending", icon: "Code", documents: [], details: {} },
      ] as any
    }
  }
  next()
})

// Instance Methods
DashboardSchema.methods.addNotification = function (title: string, message: string, type: string) {
  const newNotification = { title, message, type, read: false, createdAt: new Date() }
  this.notifications.push(newNotification)
  
  // Keep only the latest 50 notifications to prevent bloat
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(-50)
  }
  
  return this.notifications[this.notifications.length - 1]
}

DashboardSchema.methods.getUnreadNotificationsCount = function() {
  return this.notifications.filter((notif: any) => !notif.read).length
}

DashboardSchema.methods.markAllNotificationsAsRead = function() {
  this.notifications.forEach((notif: any) => {
    notif.read = true
  })
}

DashboardSchema.methods.calculateOverallProgress = function() {
  const completedSteps = this.registrationSteps.filter((step: any) => step.status === 'completed').length
  const totalSteps = this.registrationSteps.length
  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
}

DashboardSchema.methods.getNextPendingStep = function() {
  return this.registrationSteps.find((step: any) => step.status === 'pending')
}

DashboardSchema.methods.getStepById = function(stepId: number) {
  return this.registrationSteps.find((step: any) => step.id === stepId)
}

// Indexes for better performance
DashboardSchema.index({ userId: 1 }, { unique: true })
DashboardSchema.index({ hasStartedRegistration: 1 })
DashboardSchema.index({ 'registrationSteps.status': 1 })
DashboardSchema.index({ 'notifications.read': 1 })
DashboardSchema.index({ 'notifications.createdAt': -1 })
DashboardSchema.index({ createdAt: -1 })
DashboardSchema.index({ updatedAt: -1 })

// Compound indexes
DashboardSchema.index({ userId: 1, hasStartedRegistration: 1 })
DashboardSchema.index({ userId: 1, 'registrationSteps.status': 1 })

// Virtual for overall progress percentage
DashboardSchema.virtual('overallProgressPercentage').get(function() {
  return this.calculateOverallProgress()
})

// Virtual for completion status
DashboardSchema.virtual('isCompleted').get(function() {
  return this.registrationSteps.every((step: any) => step.status === 'completed')
})

const Dashboard = mongoose.models.Dashboard || mongoose.model<IDashboard>("Dashboard", DashboardSchema)

export default Dashboard
