import {
  Building2,
  CheckCircle,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

export const landlordMyProperties = [
  {
    id: 1,
    title: "Luxury 3 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: 3500000,
    beds: 3,
    baths: 2,
    sqm: 150,
    status: "active",
    views: 234,
    inquiries: 12,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Modern 2 Bedroom Flat",
    location: "Lekki Phase 1, Lagos",
    price: 2200000,
    beds: 2,
    baths: 2,
    sqm: 95,
    status: "active",
    views: 156,
    inquiries: 8,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Spacious 4 Bedroom Duplex",
    location: "Ikoyi, Lagos",
    price: 5500000,
    beds: 4,
    baths: 3,
    sqm: 220,
    status: "pending",
    views: 0,
    inquiries: 0,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export const landlordDashboardStats = [
  {
    label: "Total Properties",
    value: "3",
    icon: Building2,
    color: "bg-primary",
  },
  {
    label: "Active Listings",
    value: "2",
    icon: CheckCircle,
    color: "bg-secondary",
  },
  { label: "Total Views", value: "390", icon: Eye, color: "bg-accent" },
  {
    label: "Monthly Revenue",
    value: "5.7M",
    icon: DollarSign,
    color: "bg-primary",
  },
]

export const landlordMyAgents = [
  {
    id: 1,
    name: "Adebayo Johnson",
    avatar: "AJ",
    rating: 4.8,
    reviews: 127,
    properties: 2,
    propertyNames: ["Luxury 3 Bedroom Apartment", "Modern 2 Bedroom Flat"],
    totalInquiries: 20,
    responseTime: "1 hour",
    verified: true,
    joinedDate: "Jan 2024",
  },
  {
    id: 2,
    name: "Chioma Okafor",
    avatar: "CO",
    rating: 4.6,
    reviews: 89,
    properties: 1,
    propertyNames: ["Cozy Studio in Yaba"],
    totalInquiries: 8,
    responseTime: "2 hours",
    verified: true,
    joinedDate: "Mar 2024",
  },
  {
    id: 3,
    name: "Funke Adeyemi",
    avatar: "FA",
    rating: 4.5,
    reviews: 45,
    properties: 1,
    propertyNames: ["Executive Studio Apartment"],
    totalInquiries: 3,
    responseTime: "3 hours",
    verified: true,
    joinedDate: "Jun 2024",
  },
]

export const landlordAgentsStats = [
  { label: "Total Agents", value: "3", icon: Users },
  { label: "Avg. Rating", value: "4.6", icon: Star },
  { label: "Total Inquiries Handled", value: "31", icon: MessageSquare },
  { label: "Avg. Response Time", value: "2 hrs", icon: TrendingUp },
]

export const landlordProperties = [
  {
    id: 1,
    title: "Luxury 3 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: 3500000,
    beds: 3,
    baths: 2,
    sqm: 150,
    status: "active",
    tenant: { name: "Ngozi Adekunle", avatar: "NA" },
    views: 234,
    inquiries: 12,
    verificationStatus: "VERIFIED",
    photos: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=601",
    ],
  },
  {
    id: 2,
    title: "Modern 2 Bedroom Flat",
    location: "Lekki Phase 1, Lagos",
    price: 2200000,
    beds: 2,
    baths: 2,
    sqm: 95,
    status: "active",
    tenant: { name: "Chidinma Okoro", avatar: "CO" },
    views: 156,
    inquiries: 8,
    verificationStatus: "VERIFIED",
    photos: ["/placeholder.svg?height=400&width=600"],
  },
  {
    id: 3,
    title: "Spacious 4 Bedroom Duplex",
    location: "Ikoyi, Lagos",
    price: 5500000,
    beds: 4,
    baths: 3,
    sqm: 220,
    status: "pending",
    tenant: null,
    views: 0,
    inquiries: 0,
    verificationStatus: "PENDING",
    photos: ["/placeholder.svg?height=400&width=600"],
  },
  {
    id: 4,
    title: "Executive Studio Apartment",
    location: "Ikeja GRA, Lagos",
    price: 1500000,
    beds: 1,
    baths: 1,
    sqm: 55,
    status: "inactive",
    tenant: { name: "Yusuf Hassan", avatar: "YH" },
    views: 89,
    inquiries: 3,
    verificationStatus: "REJECTED",
    photos: ["/placeholder.svg?height=400&width=600"],
  },
]

export const landlordTenants = [
  {
    id: 1,
    name: "Ngozi Adekunle",
    property: "Luxury 3 Bedroom Apartment, Victoria Island",
    leaseStart: "Jan 1, 2025",
    leaseEnd: "Dec 31, 2025",
    monthlyPayment: 215000,
    totalPaid: 1290000,
    status: "active",
    verified: true,
  },
  {
    id: 2,
    name: "Chidinma Okoro",
    property: "Modern 2 Bedroom Flat, Lekki Phase 1",
    leaseStart: "Feb 15, 2025",
    leaseEnd: "Feb 14, 2026",
    monthlyPayment: 165000,
    totalPaid: 330000,
    status: "active",
    verified: true,
  },
  {
    id: 3,
    name: "Yusuf Hassan",
    property: "Executive Studio Apartment, Ikeja GRA",
    leaseStart: "Mar 1, 2025",
    leaseEnd: "Feb 28, 2026",
    monthlyPayment: 95000,
    totalPaid: 95000,
    status: "active",
    verified: true,
  },
]

export const landlordPaymentHistory = [
  {
    date: "Dec 2024",
    amount: "₦5,700,000",
    status: "Received",
  },
  {
    date: "Nov 2024",
    amount: "₦5,700,000",
    status: "Received",
  },
  {
    date: "Oct 2024",
    amount: "₦3,500,000",
    status: "Received",
  },
]

export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  applicationDate: string
  status: "pending" | "approved" | "rejected"
  employmentStatus: string
  incomeBand: string
  ratingCardScore: number
  ratingCardLink: string
  documents: {
    id: string
    name: string
    type: string
    status: "verified" | "pending" | "rejected"
    url: string
  }[]
  incomeVerificationStatus: "verified" | "pending" | "rejected"
  propertyId: number
}

export const propertyApplications: Record<number, Applicant[]> = {
  1: [
    {
      id: "app-1",
      name: "Ngozi Adekunle",
      email: "ngozi.adekunle@email.com",
      phone: "+234 801 234 5678",
      applicationDate: "2024-12-15",
      status: "pending",
      employmentStatus: "Employed",
      incomeBand: "₦500k - ₦750k",
      ratingCardScore: 85,
      ratingCardLink: "/rating-cards/tenant-123",
      documents: [
        {
          id: "doc-1",
          name: "Employment Letter",
          type: "PDF",
          status: "verified",
          url: "/documents/emp-letter.pdf",
        },
        {
          id: "doc-2",
          name: "Bank Statement (6 months)",
          type: "PDF",
          status: "verified",
          url: "/documents/bank-statement.pdf",
        },
        {
          id: "doc-3",
          name: "ID Card",
          type: "PDF",
          status: "verified",
          url: "/documents/id-card.pdf",
        },
      ],
      incomeVerificationStatus: "verified",
      propertyId: 1,
    },
    {
      id: "app-2",
      name: "Chidinma Okoro",
      email: "chidinma.okoro@email.com",
      phone: "+234 802 345 6789",
      applicationDate: "2024-12-18",
      status: "pending",
      employmentStatus: "Self-employed",
      incomeBand: "₦750k - ₦1M",
      ratingCardScore: 92,
      ratingCardLink: "/rating-cards/tenant-456",
      documents: [
        {
          id: "doc-4",
          name: "Business Registration",
          type: "PDF",
          status: "verified",
          url: "/documents/business-reg.pdf",
        },
        {
          id: "doc-5",
          name: "Bank Statement (6 months)",
          type: "PDF",
          status: "pending",
          url: "/documents/bank-statement-2.pdf",
        },
        {
          id: "doc-6",
          name: "ID Card",
          type: "PDF",
          status: "verified",
          url: "/documents/id-card-2.pdf",
        },
      ],
      incomeVerificationStatus: "pending",
      propertyId: 1,
    },
  ],
  2: [
    {
      id: "app-3",
      name: "Yusuf Hassan",
      email: "yusuf.hassan@email.com",
      phone: "+234 803 456 7890",
      applicationDate: "2024-12-10",
      status: "approved",
      employmentStatus: "Employed",
      incomeBand: "₦1M - ₦1.5M",
      ratingCardScore: 88,
      ratingCardLink: "/rating-cards/tenant-789",
      documents: [
        {
          id: "doc-7",
          name: "Employment Letter",
          type: "PDF",
          status: "verified",
          url: "/documents/emp-letter-3.pdf",
        },
        {
          id: "doc-8",
          name: "Bank Statement (6 months)",
          type: "PDF",
          status: "verified",
          url: "/documents/bank-statement-3.pdf",
        },
        {
          id: "doc-9",
          name: "ID Card",
          type: "PDF",
          status: "verified",
          url: "/documents/id-card-3.pdf",
        },
      ],
      incomeVerificationStatus: "verified",
      propertyId: 2,
    },
  ],
  3: [],
  4: [
    {
      id: "app-4",
      name: "Amina Bello",
      email: "amina.bello@email.com",
      phone: "+234 804 567 8901",
      applicationDate: "2024-12-20",
      status: "rejected",
      employmentStatus: "Employed",
      incomeBand: "₦300k - ₦500k",
      ratingCardScore: 65,
      ratingCardLink: "/rating-cards/tenant-101",
      documents: [
        {
          id: "doc-10",
          name: "Employment Letter",
          type: "PDF",
          status: "verified",
          url: "/documents/emp-letter-4.pdf",
        },
        {
          id: "doc-11",
          name: "Bank Statement (6 months)",
          type: "PDF",
          status: "rejected",
          url: "/documents/bank-statement-4.pdf",
        },
        {
          id: "doc-12",
          name: "ID Card",
          type: "PDF",
          status: "verified",
          url: "/documents/id-card-4.pdf",
        },
      ],
      incomeVerificationStatus: "rejected",
      propertyId: 4,
    },
  ],
}
