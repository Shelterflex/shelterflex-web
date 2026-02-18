import {
  Building2,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react"

export const agentManagedProperties = [
  {
    id: 1,
    title: "Luxury 3 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: 3500000,
    beds: 3,
    baths: 2,
    sqm: 150,
    landlord: { name: "Chief Okonkwo", avatar: "CO" },
    inquiries: 12,
    status: "active",
  },
  {
    id: 2,
    title: "Modern 2 Bedroom Flat",
    location: "Lekki Phase 1, Lagos",
    price: 2200000,
    beds: 2,
    baths: 2,
    sqm: 95,
    landlord: { name: "Mrs. Adeleke", avatar: "MA" },
    inquiries: 8,
    status: "active",
  },
]

export const agentManagedPropertiesWithMetrics = [
  {
    id: 1,
    title: "Luxury 3 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: 3500000,
    beds: 3,
    baths: 2,
    sqm: 150,
    landlord: { name: "Chief Okonkwo", avatar: "CO" },
    inquiries: 12,
    views: 234,
    status: "active",
    listedDate: "Dec 15, 2024",
  },
  {
    id: 2,
    title: "Modern 2 Bedroom Flat",
    location: "Lekki Phase 1, Lagos",
    price: 2200000,
    beds: 2,
    baths: 2,
    sqm: 95,
    landlord: { name: "Mrs. Adeleke", avatar: "MA" },
    inquiries: 8,
    views: 156,
    status: "active",
    listedDate: "Dec 20, 2024",
  },
  {
    id: 3,
    title: "Spacious Studio Apartment",
    location: "Ikeja GRA, Lagos",
    price: 1200000,
    beds: 1,
    baths: 1,
    sqm: 45,
    landlord: { name: "Mr. Obi", avatar: "MO" },
    inquiries: 5,
    views: 89,
    status: "rented",
    listedDate: "Nov 10, 2024",
  },
]

export const agentAvailableProperties = [
  {
    id: 3,
    title: "Spacious 4 Bedroom Duplex",
    location: "Ikoyi, Lagos",
    price: 5500000,
    beds: 4,
    baths: 3,
    sqm: 220,
    landlord: { name: "Chief Okonkwo", avatar: "CO" },
    postedAt: "2 days ago",
  },
  {
    id: 4,
    title: "Executive 5 Bedroom Mansion",
    location: "Banana Island, Lagos",
    price: 12000000,
    beds: 5,
    baths: 5,
    sqm: 450,
    landlord: { name: "Alhaji Bello", avatar: "AB" },
    postedAt: "1 week ago",
  },
  {
    id: 5,
    title: "Cozy Studio Apartment",
    location: "Yaba, Lagos",
    price: 800000,
    beds: 1,
    baths: 1,
    sqm: 40,
    landlord: { name: "Mr. Obi", avatar: "MO" },
    postedAt: "3 days ago",
  },
]

export const agentMyApplications = [
  {
    id: 1,
    property: "Executive 5 Bedroom Mansion",
    landlord: "Alhaji Bello",
    status: "pending",
    appliedAt: "3 days ago",
  },
  {
    id: 2,
    property: "Penthouse Suite",
    landlord: "Mrs. Fashola",
    status: "accepted",
    appliedAt: "1 week ago",
  },
  {
    id: 3,
    property: "Garden Terrace",
    landlord: "Dr. Eze",
    status: "declined",
    appliedAt: "2 weeks ago",
  },
]

export const agentDashboardStats = [
  {
    label: "Properties Managed",
    value: "2",
    icon: Building2,
    color: "bg-primary",
  },
  {
    label: "Active Inquiries",
    value: "20",
    icon: MessageSquare,
    color: "bg-secondary",
  },
  {
    label: "Average Rating",
    value: "4.8",
    icon: Star,
    color: "bg-accent",
  },
  {
    label: "Total Earnings",
    value: "₦450K",
    icon: TrendingUp,
    color: "bg-primary",
  },
]

export const agentApplications = [
  {
    id: 1,
    property: {
      title: "Executive 5 Bedroom Mansion",
      location: "Banana Island, Lagos",
      price: 12000000,
    },
    landlord: { name: "Alhaji Bello", avatar: "AB" },
    status: "pending",
    appliedAt: "Jan 2, 2025",
    message:
      "I have 5 years of experience managing luxury properties in Lagos. I would be honored to represent this property.",
  },
  {
    id: 2,
    property: {
      title: "Penthouse Suite",
      location: "Victoria Island, Lagos",
      price: 8500000,
    },
    landlord: { name: "Mrs. Fashola", avatar: "MF" },
    status: "accepted",
    appliedAt: "Dec 28, 2024",
    acceptedAt: "Dec 30, 2024",
    message:
      "I specialize in high-end properties and have successfully rented 20+ units this year.",
  },
  {
    id: 3,
    property: {
      title: "Garden Terrace Apartment",
      location: "Ikoyi, Lagos",
      price: 4200000,
    },
    landlord: { name: "Dr. Eze", avatar: "DE" },
    status: "declined",
    appliedAt: "Dec 20, 2024",
    declinedAt: "Dec 22, 2024",
    message:
      "I have experience with properties in the Ikoyi area and maintain strong tenant relationships.",
    declineReason: "Position filled by another agent",
  },
  {
    id: 4,
    property: {
      title: "Modern Duplex",
      location: "Lekki Phase 2, Lagos",
      price: 5500000,
    },
    landlord: { name: "Chief Okonkwo", avatar: "CO" },
    status: "pending",
    appliedAt: "Jan 5, 2025",
    message:
      "I already manage two properties for Chief Okonkwo and would like to add this to my portfolio.",
  },
]

export const agentRecentPayouts = [
  {
    date: "Jan 1, 2025",
    amount: "₦450,000",
    property: "Luxury 3BR Apartment",
    status: "Paid",
  },
  {
    date: "Dec 1, 2024",
    amount: "₦380,000",
    property: "Modern 2BR Flat",
    status: "Paid",
  },
  {
    date: "Nov 1, 2024",
    amount: "₦290,000",
    property: "Studio Apartment",
    status: "Paid",
  },
]
