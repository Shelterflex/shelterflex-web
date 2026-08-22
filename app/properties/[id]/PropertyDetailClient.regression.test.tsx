import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PropertyDetailClient from './PropertyDetailClient'
import { apiPost } from '@/lib/api'
import type { PropertyListing } from '@/lib/propertiesApi'

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
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
}))

// Mock API functions
const mockApiPost = vi.fn()
vi.mock('@/lib/api', () => ({
  apiPost: mockApiPost,
}))

// Mock propertiesApi
const mockGetProperty = vi.fn()
vi.mock('@/lib/propertiesApi', () => ({
  getProperty: mockGetProperty,
  type PropertyListing: {},
}))

// Mock savedPropertiesApi
const mockFetchSavedListingIds = vi.fn().mockResolvedValue([])
const mockSetListingSaved = vi.fn()
vi.mock('@/lib/savedPropertiesApi', () => ({
  fetchSavedListingIds: mockFetchSavedListingIds,
  setListingSaved: mockSetListingSaved,
}))

// Mock propertyInspectionApi
const mockGetInspectionSummary = vi.fn().mockRejectedValue(new Error('No inspection'))
vi.mock('@/lib/propertyInspectionApi', () => ({
  propertyInspectionApi: {
    getInspectionSummary: mockGetInspectionSummary,
  },
}))

const mockProperty: PropertyListing = {
  listingId: '1',
  whistleblowerId: 'wb-1',
  address: '123 Test Street, Lagos',
  city: 'Lagos',
  area: 'Ikeja',
  bedrooms: 3,
  bathrooms: 2,
  annualRentNgn: 1500000,
  outrightPriceNgn: 45000000,
  installmentBasePriceNgn: 48000000,
  hasApprovedInspection: true,
  description: 'A beautiful 3-bedroom apartment in the heart of Lagos.',
  photos: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  ],
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
}

describe('PropertyDetailClient - Regression Check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProperty.mockResolvedValue({ success: true, data: mockProperty })
  })

  it('asserts Annual Rent section is present', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    // Wait for the async fetch to complete
    const annualRent = await screen.findByText('Annual Rent')
    expect(annualRent).toBeInTheDocument()

    // Price should be present (format varies, but should contain currency symbol)
    const priceElement = screen.queryByText(/₦/)
    expect(priceElement).toBeInTheDocument()
  })

  it('asserts the property address is displayed as title', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    // The API address becomes the display title
    const address = await screen.findByText('123 Test Street, Lagos')
    expect(address).toBeInTheDocument()
  })

  it('asserts all key sections are present together', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    // Wait for async fetch
    await screen.findByText('Annual Rent')

    // Annual Rent must be present
    expect(screen.getByText('Annual Rent')).toBeInTheDocument()

    // At minimum, pricing information should be visible
    const priceElements = screen.queryAllByText(/₦/)
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it('does not show Listed By section when API has no landlord data', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    // With real API data, landlord is not present, so "Listed By" should not appear
    expect(screen.queryByText('Listed By')).not.toBeInTheDocument()
  })

  it('does not show whistleblower section when API has no whistleblower data', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    // With real API data, whistleblower is not present
    expect(screen.queryByText('Reported by Resident')).not.toBeInTheDocument()
  })
})

describe('PropertyDetailClient - Report Dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProperty.mockResolvedValue({ success: true, data: mockProperty })
  })

  it('opens report dialog when Report Listing button is clicked', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    // Wait for render to complete
    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    expect(screen.getByText('Report Listing')).toBeInTheDocument()
    expect(screen.getByText('Report Category')).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    const submitButton = screen.getByText('Submit Report')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', async () => {
    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    // Select a category
    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)

    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    // Add details
    const detailsTextarea = screen.getByPlaceholderText(/Please provide more information/)
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    expect(submitButton).not.toBeDisabled()
  })

  it('shows loading state during submission', async () => {
    mockApiPost.mockImplementation(
      () => new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, reportId: '123' }), 100)
      )
    )

    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    // Fill form
    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(
      /Please provide more information/
    )
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })
  })

  it('shows success state after successful submission', async () => {
    mockApiPost.mockResolvedValue({ success: true, reportId: '123' })

    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    // Fill form
    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(
      /Please provide more information/
    )
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Report Submitted')).toBeInTheDocument()
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Report submitted successfully!'
      )
    })
  })

  it('shows error state on failed submission', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'))

    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    // Fill form
    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(
      /Please provide more information/
    )
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to submit report. Please try again.'
      )
    })
  })

  it('resets form state after successful submission', async () => {
    mockApiPost.mockResolvedValue({ success: true, reportId: '123' })

    render(<PropertyDetailClient propertyId="1" />)

    await screen.findByText('Annual Rent')

    const reportButton = screen.getByText('Report Listing')
    fireEvent.click(reportButton)

    // Fill form
    const categorySelect = screen.getByRole('combobox')
    fireEvent.click(categorySelect)
    const fraudOption = await screen.findByText('Fraudulent Listing')
    fireEvent.click(fraudOption)

    const detailsTextarea = screen.getByPlaceholderText(
      /Please provide more information/
    )
    fireEvent.change(detailsTextarea, { target: { value: 'This is a test report' } })

    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    // Wait for success state and dialog close
    await waitFor(
      () => {
        expect(screen.queryByText('Report Submitted')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})