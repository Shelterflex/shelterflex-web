import {
  Building2,
  FileText,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export type InspectionType = "new_listing" | "re_inspection";

export type JobStatus = "available" | "claimed" | "in_progress" | "completed";

export type PaymentStatus = "pending" | "paid";

export interface InspectorJob {
  id: string;
  propertyId: string;
  propertyTitle: string;
  address: string;
  inspectionType: InspectionType;
  offeredFee: number;
  deadline: string;
  status: JobStatus;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface InspectorEarning {
  id: string;
  jobId: string;
  propertyTitle: string;
  address: string;
  inspectionType: InspectionType;
  fee: number;
  status: PaymentStatus;
  completedAt: string;
  paidAt?: string;
}

export const inspectorJobs: InspectorJob[] = [
  {
    id: "job-1",
    propertyId: "prop-1",
    propertyTitle: "Luxury 3 Bedroom Apartment",
    address: "15 Adetokunbo Ademola Street, Victoria Island, Lagos",
    inspectionType: "new_listing",
    offeredFee: 5000,
    deadline: "2024-12-30",
    status: "available",
    createdAt: "2024-12-20",
  },
  {
    id: "job-2",
    propertyId: "prop-2",
    propertyTitle: "Modern 2 Bedroom Flat",
    address: "42 Admiralty Way, Lekki Phase 1, Lagos",
    inspectionType: "new_listing",
    offeredFee: 4500,
    deadline: "2024-12-28",
    status: "available",
    createdAt: "2024-12-19",
  },
  {
    id: "job-3",
    propertyId: "prop-3",
    propertyTitle: "Spacious 4 Bedroom Duplex",
    address: "8 Glover Road, Ikoyi, Lagos",
    inspectionType: "re_inspection",
    offeredFee: 6000,
    deadline: "2024-12-25",
    status: "claimed",
    claimedBy: "inspector-1",
    claimedAt: "2024-12-21",
    createdAt: "2024-12-18",
  },
  {
    id: "job-4",
    propertyId: "prop-4",
    propertyTitle: "Cozy Studio Apartment",
    address: "125 Herbert Macaulay Way, Yaba, Lagos",
    inspectionType: "new_listing",
    offeredFee: 3500,
    deadline: "2024-12-22",
    status: "in_progress",
    claimedBy: "inspector-1",
    claimedAt: "2024-12-18",
    createdAt: "2024-12-17",
  },
  {
    id: "job-5",
    propertyId: "prop-5",
    propertyTitle: "Executive Studio Apartment",
    address: "78 Obafemi Awolowo Road, Ikeja GRA, Lagos",
    inspectionType: "re_inspection",
    offeredFee: 5500,
    deadline: "2024-12-15",
    status: "completed",
    claimedBy: "inspector-1",
    claimedAt: "2024-12-10",
    completedAt: "2024-12-14",
    createdAt: "2024-12-09",
  },
];

export const inspectorEarnings: InspectorEarning[] = [
  {
    id: "earn-1",
    jobId: "job-5",
    propertyTitle: "Executive Studio Apartment",
    address: "78 Obafemi Awolowo Road, Ikeja GRA, Lagos",
    inspectionType: "re_inspection",
    fee: 5500,
    status: "paid",
    completedAt: "2024-12-14",
    paidAt: "2024-12-16",
  },
  {
    id: "earn-2",
    jobId: "job-prev-1",
    propertyTitle: "Modern 1 Bedroom Apartment",
    address: "22 Akin Adesola Street, Victoria Island, Lagos",
    inspectionType: "new_listing",
    fee: 4000,
    status: "paid",
    completedAt: "2024-12-01",
    paidAt: "2024-12-03",
  },
  {
    id: "earn-3",
    jobId: "job-prev-2",
    propertyTitle: "Penthouse Suite",
    address: "5 Bourdillon Road, Ikoyi, Lagos",
    inspectionType: "new_listing",
    fee: 7500,
    status: "pending",
    completedAt: "2024-12-18",
  },
];

export const inspectorStats = [
  {
    label: "Available Jobs",
    value: "2",
    icon: Building2,
    color: "bg-primary",
  },
  {
    label: "In Progress",
    value: "1",
    icon: FileText,
    color: "bg-secondary",
  },
  {
    label: "Completed This Month",
    value: "3",
    icon: CheckCircle,
    color: "bg-accent",
  },
  {
    label: "Total Earnings",
    value: "₦17,000",
    icon: DollarSign,
    color: "bg-primary",
  },
];

export const inspectionChecklistTemplate = [
  {
    id: "exterior",
    category: "Exterior",
    items: [
      { id: "ext-1", label: "Building exterior condition", required: true },
      { id: "ext-2", label: "Roof condition", required: true },
      { id: "ext-3", label: "Parking area", required: false },
      { id: "ext-4", label: "Security features (gates, fences)", required: true },
    ],
  },
  {
    id: "interior",
    category: "Interior",
    items: [
      { id: "int-1", label: "Living room condition", required: true },
      { id: "int-2", label: "Kitchen condition and appliances", required: true },
      { id: "int-3", label: "Bedroom condition", required: true },
      { id: "int-4", label: "Bathroom condition and fixtures", required: true },
      { id: "int-5", label: "Flooring condition", required: true },
      { id: "int-6", label: "Windows and doors", required: true },
      { id: "int-7", label: "Electrical outlets and switches", required: true },
      { id: "int-8", label: "Plumbing fixtures", required: true },
    ],
  },
  {
    id: "amenities",
    category: "Amenities",
    items: [
      { id: "amen-1", label: "Water supply and pressure", required: true },
      { id: "amen-2", label: "Electrical supply stability", required: true },
      { id: "amen-3", label: "Air conditioning (if applicable)", required: false },
      { id: "amen-4", label: "Security systems", required: false },
    ],
  },
  {
    id: "safety",
    category: "Safety & Compliance",
    items: [
      { id: "safe-1", label: "Fire safety equipment", required: true },
      { id: "safe-2", label: "Emergency exits", required: true },
      { id: "safe-3", label: "Ventilation", required: true },
      { id: "safe-4", label: "Pest control evidence", required: true },
    ],
  },
];
