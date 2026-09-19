import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PropertyDetailClient from './PropertyDetailClient'

// jsdom doesn't implement scrollIntoView, which Radix's Select calls when an
// option is highlighted.
window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}))

// Mock toast functions
const mockShowSuccessToast = vi.fn()
const mockShowErrorToast = vi.fn()
vi.mock('@/lib/toast', () => ({
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
  showErrorToast: (...args: unknown[]) => mockShowErrorToast(...args),
}))

// Mock the real-API property fetch (this page now fetches from the backend
// instead of the mock property dataset — see PropertyPageContent.tsx)
const mockGetProperty = vi.fn()
vi.mock('@/lib/propertiesApi', () => ({
  getProperty: (...args: unknown[]) => mockGetProperty(...args),
}))

const mockGetInspectionSummary = vi.fn()
vi.mock('@/lib/propertyInspectionApi', () => ({
  propertyInspectionApi: {
    getInspectionSummary: (...args: unknown[]) => mockGetInspectionSummary(...args),
  },
}))

vi.mock('@/store/useAuthStore', () => ({
  default: () => ({ isAuthenticated: false, user: null }),
}))

const mockApiPost = vi.fn()
vi.mock('@/lib/api', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}))

// Reviews and the sidebar/inspection-accordion are loaded via next/dynamic
// inside PropertyPageContent; stub them so tests don't depend on their
// own data fetching.
vi.mock('@/components/properties/ApartmentReviews', () => ({
  ApartmentReviews: () => <div>Reviews</div>,
}))

const sampleListing = {
  listingId: 'listing-1',
  whistleblowerId: 'wb-1',
  address: '4 Marigold Close, Lekki Phase 1, Lagos',
  city: 'Lagos',
  area: 'Lekki Phase 1',
  bedrooms: 3,
  bathrooms: 2,
  annualRentNgn: 3_850_000,
  outrightPriceNgn: 4_235_000,
  installmentBasePriceNgn: 3_850_000,
  hasApprovedInspection: false,
  description: 'A well-kept three bedroom home close to the Lekki tollgate.',
  photos: ['/properties/1/exterior.jpg', '/properties/1/living-room.jpg'],
  status: 'approved',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('PropertyDetailClient - Regression Check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProperty.mockResolvedValue({ success: true, data: sampleListing })
    mockGetInspectionSummary.mockRejectedValue(new Error('No inspection'))
  })

  it('renders the real fetched property (not a mock/placeholder listing)', async () => {
    render(<PropertyDetailClient propertyId="listing-1" />)

    // The address is used as both the page title and the address line, so it
    // legitimately appears twice.
    expect((await screen.findAllByText(sampleListing.address)).length).toBeGreaterThan(0)
    expect(mockGetProperty).toHaveBeenCalledWith('listing-1')

    // Installment + outright pricing, since this listing has both. The
    // sidebar is loaded via next/dynamic, so give it time to resolve.
    await screen.findByText('Pay with Shelterflex')
    const priceElements = screen.queryAllByText(/₦/)
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it('shows bed/bath counts from the fetched listing', async () => {
    render(<PropertyDetailClient propertyId="listing-1" />)

    await screen.findAllByText(sampleListing.address)
    expect(screen.getByText('3 Beds')).toBeInTheDocument()
    expect(screen.getByText('2 Baths')).toBeInTheDocument()
  })

  it('shows a not-found state when the property fetch fails', async () => {
    mockGetProperty.mockRejectedValue(new Error('Not found'))

    render(<PropertyDetailClient propertyId="does-not-exist" />)

    expect(await screen.findByText('Property Not Found')).toBeInTheDocument()
  })
})

describe('PropertyDetailClient - Report Dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProperty.mockResolvedValue({ success: true, data: sampleListing })
    mockGetInspectionSummary.mockRejectedValue(new Error('No inspection'))
  })

  it('opens report dialog when Report Listing button is clicked', async () => {
    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    expect(screen.getByText('Report Category')).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', async () => {
    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    const submitButton = screen.getByText('Submit Report')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', async () => {
    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)

    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(/Please provide more information/)
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    expect(submitButton).not.toBeDisabled()
  })

  it('posts to the versioned /property-issue-reports path, not a literal /api path', async () => {
    mockApiPost.mockResolvedValue({ success: true, reportId: '123' })

    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(/Please provide more information/)
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    fireEvent.click(screen.getByText('Submit Report'))

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/property-issue-reports',
        expect.objectContaining({ propertyId: 'listing-1' }),
      )
    })
  })

  it('shows success state after successful submission', async () => {
    mockApiPost.mockResolvedValue({ success: true, reportId: '123' })

    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(/Please provide more information/)
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    fireEvent.click(screen.getByText('Submit Report'))

    await waitFor(() => {
      expect(screen.getByText('Report Submitted')).toBeInTheDocument()
      expect(mockShowSuccessToast).toHaveBeenCalledWith('Report submitted successfully!')
    })
  })

  it('shows error state on failed submission', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'))

    render(<PropertyDetailClient propertyId="listing-1" />)

    const reportButton = await screen.findByText('Report Listing')
    fireEvent.click(reportButton)

    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(/Please provide more information/)
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    fireEvent.click(screen.getByText('Submit Report'))

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to submit report. Please try again.',
      )
    })
  })
})
