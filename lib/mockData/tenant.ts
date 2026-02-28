export type TenantWalletData = {
  balance: number
  lastTopUp: string
  autoPayEnabled: boolean
}

export type TenantPaymentScheduleItem = {
  month: string
  amount: number
  status: "upcoming" | "pending"
  dueDate: string
}

export type TenantPastPaymentItem = {
  month: string
  amount: number
  status: "paid"
  paidDate: string
  method: string
}

export const tenantWalletData: TenantWalletData = {
  balance: 150000,
  lastTopUp: "Dec 28, 2024",
  autoPayEnabled: true,
}

export const tenantPaymentSchedule: TenantPaymentScheduleItem[] = [
  { month: "Jan 2025", amount: 215000, status: "upcoming", dueDate: "Jan 15" },
  { month: "Feb 2025", amount: 215000, status: "pending", dueDate: "Feb 15" },
  { month: "Mar 2025", amount: 215000, status: "pending", dueDate: "Mar 15" },
  { month: "Apr 2025", amount: 215000, status: "pending", dueDate: "Apr 15" },
  { month: "May 2025", amount: 215000, status: "pending", dueDate: "May 15" },
  { month: "Jun 2025", amount: 215000, status: "pending", dueDate: "Jun 15" },
]

export const tenantPastPayments: TenantPastPaymentItem[] = [
  {
    month: "Dec 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Dec 12",
    method: "Auto-debit",
  },
  {
    month: "Nov 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Nov 14",
    method: "Wallet",
  },
  {
    month: "Oct 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Oct 13",
    method: "Manual",
  },
  {
    month: "Sep 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Sep 15",
    method: "Auto-debit",
  },
  {
    month: "Aug 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Aug 12",
    method: "Wallet",
  },
  {
    month: "Jul 2024",
    amount: 215000,
    status: "paid",
    paidDate: "Jul 14",
    method: "Manual",
  },
]

export type TenantDashboardPaymentItem =
  | {
      month: string
      amount: number
      status: "upcoming" | "pending"
      dueDate: string
    }
  | {
      month: string
      amount: number
      status: "paid"
      paidDate: string
    }

export const tenantCurrentLease = {
  property: "Modern 3 Bedroom Flat",
  location: "Lekki Phase 1, Lagos",
  monthlyPayment: 215000,
  nextPaymentDate: "Jan 15, 2025",
  leaseEnd: "Dec 31, 2025",
  totalPaid: 1290000,
  totalOwed: 2580000,
  progress: 33,
  landlord: { name: "Chief Emeka Okonkwo" },
}

export const tenantDashboardPaymentSchedule: TenantDashboardPaymentItem[] = [
  { month: "Jan 2025", amount: 215000, status: "upcoming", dueDate: "Jan 15" },
  { month: "Feb 2025", amount: 215000, status: "pending", dueDate: "Feb 15" },
  { month: "Mar 2025", amount: 215000, status: "pending", dueDate: "Mar 15" },
  { month: "Apr 2025", amount: 215000, status: "pending", dueDate: "Apr 15" },
]

export const tenantDashboardPastPayments: TenantDashboardPaymentItem[] = [
  { month: "Dec 2024", amount: 215000, status: "paid", paidDate: "Dec 12" },
  { month: "Nov 2024", amount: 215000, status: "paid", paidDate: "Nov 14" },
  { month: "Oct 2024", amount: 215000, status: "paid", paidDate: "Oct 13" },
]

export const tenantSavedProperties = [
  {
    id: 1,
    title: "Luxury 2BR in VI",
    location: "Victoria Island",
    price: 2800000,
  },
  { id: 2, title: "Spacious Studio", location: "Ikeja GRA", price: 1500000 },
]

export const tenantApplicationProperties = [
  {
    id: 1,
    title: "Modern 3-Bedroom Apartment",
    location: "Lekki Phase 1, Lagos",
    address: "15 Admiralty Road, Lekki Phase 1, Lagos",
    price: 2400000,
    beds: 3,
    baths: 2,
    sqm: 180,
  },
  {
    id: 2,
    title: "Luxury 4-Bedroom Penthouse",
    location: "Banana Island, Lagos",
    address: "Plot 45, Banana Island Avenue, Lagos",
    price: 5200000,
    beds: 4,
    baths: 3,
    sqm: 320,
  },
  {
    id: 3,
    title: "Cozy 2-Bedroom Flat",
    location: "Yaba, Lagos",
    address: "12 Fela Kuti Road, Yaba, Lagos",
    price: 1800000,
    beds: 2,
    baths: 1,
    sqm: 120,
  },
  {
    id: 4,
    title: "Executive 5-Bedroom Mansion",
    location: "Ikoyi, Lagos",
    address: "89 Bourdillon Road, Ikoyi, Lagos",
    price: 8500000,
    beds: 5,
    baths: 4,
    sqm: 450,
  },
  {
    id: 5,
    title: "Spacious 3-Bedroom Duplex",
    location: "Victoria Island, Lagos",
    address: "Block 12, Maryland Street, VI, Lagos",
    price: 3100000,
    beds: 3,
    baths: 2,
    sqm: 240,
  },
  {
    id: 6,
    title: "Contemporary 2-Bedroom Apartment",
    location: "Lekki Chevron, Lagos",
    address: "78 Chevron Drive, Lekki, Lagos",
    price: 2200000,
    beds: 2,
    baths: 2,
    sqm: 160,
  },
  {
    id: 7,
    title: "Premium 4-Bedroom Terrace",
    location: "Ikoyi, Lagos",
    address: "Plot 5, Nana Asma'u Street, Ikoyi, Lagos",
    price: 4500000,
    beds: 4,
    baths: 3,
    sqm: 300,
  },
  {
    id: 8,
    title: "Compact 1-Bedroom Studio",
    location: "Yaba, Lagos",
    address: "Unit 7, Herbert Macaulay Way, Yaba, Lagos",
    price: 1200000,
    beds: 1,
    baths: 1,
    sqm: 80,
  },
]

export const tenantWhistleblowersToRate = [
  {
    id: 1,
    name: "Chiamaka Okonkwo",
    apartment: "Block 5, Flat 2B, Yaba",
    rentDate: "Dec 15, 2024",
    rating: 4.8,
    reviews: 24,
    hasRated: false,
  },
  {
    id: 2,
    name: "Adanna Smith",
    apartment: "Block 3, Flat 1C, Yaba",
    rentDate: "Nov 28, 2024",
    rating: 4.9,
    reviews: 18,
    hasRated: true,
  },
]
