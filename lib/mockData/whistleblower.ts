export const whistleblowerData = {
  name: "Chiamaka Okonkwo",
  earnings: 45000,
  reportsThisMonth: 1,
  maxReportsPerMonth: 2,
  totalReports: 6,
  rating: 4.8,
  reviews: 24,
  activeListings: 2,
}

export const whistleblowerListings = [
  {
    id: 1,
    address: "Block 5, Flat 2B, Yaba",
    price: 500000,
    beds: 2,
    baths: 1,
    status: "active",
    views: 156,
    earnings: 15000,
    postedDate: "Dec 15, 2024",
  },
  {
    id: 2,
    address: "Block 3, Flat 1C, Yaba",
    price: 400000,
    beds: 1,
    baths: 1,
    status: "rented",
    views: 289,
    earnings: 20000,
    postedDate: "Nov 28, 2024",
  },
]

export const whistleblowerEarnings = [
  {
    date: "Dec 15, 2024",
    listing: "Block 5, Flat 2B",
    amount: 15000,
    status: "pending",
  },
  {
    date: "Nov 28, 2024",
    listing: "Block 3, Flat 1C",
    amount: 20000,
    status: "completed",
  },
]
