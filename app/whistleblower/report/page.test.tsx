import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportApartmentPage from './page'

// The form is gated on sign-in; render it as a signed-in user would see it.
vi.mock('@/components/auth-guard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const api = vi.hoisted(() => ({
  uploadPhotos: vi.fn(),
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  checkPhotoQuality: vi.fn(),
  playWhistle: vi.fn(),
  getIdentityStatus: vi.fn(),
}))
vi.mock('@/lib/api/whistleblowerIdentity', () => ({ getIdentityStatus: api.getIdentityStatus }))
vi.mock('@/lib/mediaApi', () => ({ uploadPhotos: api.uploadPhotos }))
vi.mock('@/lib/apiClient', () => ({ apiPost: api.apiPost, apiGet: api.apiGet }))
// jsdom can't decode images, so the quality check is stubbed (it has its own tests).
vi.mock('@/lib/photoQuality', () => ({ checkPhotoQuality: api.checkPhotoQuality }))
vi.mock('@/lib/whistleSound', () => ({
  playWhistle: api.playWhistle,
  soundEffectsEnabled: () => true,
  setSoundEffectsEnabled: vi.fn(),
}))

// Stub only the members the page uses: globalThis.crypto is a read-only
// getter, and replacing the whole URL global breaks `new URL(...)` elsewhere.
let uuidCounter = 0
const mockRandomUUID = vi.fn(() => `test-uuid-${++uuidCounter}`)
const mockCreateObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`)
const mockRevokeObjectURL = vi.fn()

function stubBrowserApis() {
  vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(
    mockRandomUUID as unknown as typeof crypto.randomUUID,
  )
  URL.createObjectURL = mockCreateObjectURL
  URL.revokeObjectURL = mockRevokeObjectURL
}

describe('ReportApartmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stubBrowserApis()
    api.apiGet.mockResolvedValue({ address: 'Test Address' })
    api.checkPhotoQuality.mockResolvedValue(null)
    api.getIdentityStatus.mockResolvedValue({ verified: true, verifiedAt: null, suspended: false })
  })

  it('renders the report form initially', () => {
    render(<ReportApartmentPage />)

    expect(screen.getByText('Report a Vacant Apartment')).toBeInTheDocument()
    expect(screen.getByLabelText('Apartment Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Bedrooms')).toBeInTheDocument()
    expect(screen.getByLabelText('Bathrooms')).toBeInTheDocument()
    expect(screen.getByLabelText('Annual Rent (₦)')).toBeInTheDocument()
  })

  it('shows photo upload section with minimum requirement', () => {
    render(<ReportApartmentPage />)

    expect(screen.getByText('Upload Photos (Minimum 3)')).toBeInTheDocument()
    expect(screen.getByText('Click to upload photos')).toBeInTheDocument()
  })

  it('displays photo previews when photos are added', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ]

    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.getByText('2 photos selected')).toBeInTheDocument()
    })

    // Check that preview images are rendered
    const images = screen.getAllByAltText('Preview')
    expect(images).toHaveLength(2)
  })

  it('allows removing individual photos', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
    ]

    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.getByText('3 photos selected')).toBeInTheDocument()
    })

    // Hover over a photo to reveal remove button
    const removeButtons = screen.getAllByLabelText('Remove photo')
    expect(removeButtons).toHaveLength(3)

    // Click the first remove button
    fireEvent.click(removeButtons[0])

    await waitFor(() => {
      expect(screen.getByText('2 photos selected')).toBeInTheDocument()
    })

    // Verify URL was revoked
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('shows validation error when fewer than 3 photos are selected', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ]

    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.getByText('Minimum 3 photos required')).toBeInTheDocument()
    })

    expect(screen.getByText(/You need at least 3 photos to submit your report/)).toBeInTheDocument()
  })

  it('does not show validation error when 3 or more photos are selected', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
    ]

    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.queryByText('Minimum 3 photos required')).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/You need at least 3 photos to submit your report/)).not.toBeInTheDocument()
  })

  it('prevents form submission with fewer than 3 photos', async () => {
    render(<ReportApartmentPage />)

    // Fill required fields
    await userEvent.type(screen.getByLabelText('Apartment Address'), 'Test Address')
    await userEvent.selectOptions(screen.getByLabelText('Bedrooms'), '1')
    await userEvent.selectOptions(screen.getByLabelText('Bathrooms'), '1')
    await userEvent.type(screen.getByLabelText('Annual Rent (₦)'), '500000')

    // Add only 2 photos
    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.getByText('2 photos selected')).toBeInTheDocument()
    })

    // Try to submit
    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    // Should still be on form step, not confirmation
    await waitFor(() => {
      expect(screen.getByText('Report a Vacant Apartment')).toBeInTheDocument()
      expect(screen.queryByText('Apartment Reported!')).not.toBeInTheDocument()
    })
  })

  it('uploads the photos, then files the listing with their URLs', async () => {
    const urls = ['https://cdn/1.jpg', 'https://cdn/2.jpg', 'https://cdn/3.jpg']
    api.uploadPhotos.mockResolvedValue(urls)
    api.apiPost.mockResolvedValue({ success: true })
    render(<ReportApartmentPage />)

    // Fill required fields
    // The address arrives prefilled from the reporter's registered address.
    await waitFor(() => {
      expect(screen.getByLabelText('Apartment Address')).toHaveValue('Test Address')
    })
    await userEvent.selectOptions(screen.getByLabelText('Bedrooms'), '1')
    await userEvent.selectOptions(screen.getByLabelText('Bathrooms'), '1')
    await userEvent.type(screen.getByLabelText('Annual Rent (₦)'), '500000')

    // Add 3 photos
    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      expect(screen.getByText('3 photos selected')).toBeInTheDocument()
    })

    // Submit form
    const submitButton = screen.getByText('Submit Report')
    fireEvent.click(submitButton)

    // Should move to confirmation step
    await waitFor(() => {
      expect(screen.getByText('Apartment Reported!')).toBeInTheDocument()
      expect(screen.getByText('Your Listing Details:')).toBeInTheDocument()
    })

    expect(api.uploadPhotos).toHaveBeenCalledWith(files, { purpose: 'listing' })
    expect(api.playWhistle).toHaveBeenCalled()
    const [path, body] = api.apiPost.mock.calls[0]
    expect(path).toBe('/whistleblower/listings')
    expect(body).toMatchObject({ address: 'Test Address', annualRentNgn: 500000, photos: urls })
    expect(body).not.toHaveProperty('whistleblowerId')
  })

  it('revokes object URLs on component unmount', async () => {
    const { unmount } = render(<ReportApartmentPage />)

    // Add photos
    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    const files = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files)
    await waitFor(() => {
      expect(screen.getByText('2 photos selected')).toBeInTheDocument()
    })

    // Unmount component
    unmount()

    // URLs should be revoked
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it('handles adding more photos after initial upload', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement

    // Add first batch
    const files1 = [
      new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files1)

    await waitFor(() => {
      expect(screen.getByText('2 photos selected')).toBeInTheDocument()
    })

    // Add second batch
    const files2 = [
      new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
      new File(['photo4'], 'photo4.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files2)

    await waitFor(() => {
      expect(screen.getByText('4 photos selected')).toBeInTheDocument()
    })

    const images = screen.getAllByAltText('Preview')
    expect(images).toHaveLength(4)
  })

  it('shows correct pluralization for photo count', async () => {
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement

    // Test singular
    const files1 = [new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' })]
    await userEvent.upload(fileInput, files1)

    await waitFor(() => {
      expect(screen.getByText('1 photo selected')).toBeInTheDocument()
    })

    // Test plural
    const files2 = [
      new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.upload(fileInput, files2)

    await waitFor(() => {
      expect(screen.getByText('3 photos selected')).toBeInTheDocument()
    })
  })

  it('rejects low-quality photos and says why', async () => {
    api.checkPhotoQuality.mockImplementation(async (file: File) =>
      file.name === 'blurry.jpg' ? 'looks blurry. Hold the phone steady.' : null,
    )
    render(<ReportApartmentPage />)

    const fileInput = screen.getByLabelText(/upload photos/i) as HTMLInputElement
    await userEvent.upload(fileInput, [
      new File(['a'], 'good.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'blurry.jpg', { type: 'image/jpeg' }),
    ])

    await waitFor(() => {
      expect(screen.getByText('1 photo selected')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert')).toHaveTextContent('blurry.jpg looks blurry')
  })

  it("prefills the reporter's registered address and explains the rule", async () => {
    api.apiGet.mockResolvedValue({ address: '15 Admiralty Way, Lekki' })
    render(<ReportApartmentPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('Apartment Address')).toHaveValue('15 Admiralty Way, Lekki')
    })
    expect(screen.getByText(/only report the apartment you live in/i)).toBeInTheDocument()
  })

  it('warns when there is no address on file', async () => {
    api.apiGet.mockResolvedValue({ address: null })
    render(<ReportApartmentPage />)

    await waitFor(() => {
      expect(screen.getByText(/no residential address on file/i)).toBeInTheDocument()
    })
  })

  it('sends unverified reporters to verify their identity first', async () => {
    api.getIdentityStatus.mockResolvedValue({ verified: false, verifiedAt: null, suspended: false })
    render(<ReportApartmentPage />)

    expect(await screen.findByText('Verify your identity first')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Verify now' })).toHaveAttribute('href', '/whistleblower/verify')
  })

  it('tells suspended reporters their reporting is paused', async () => {
    api.getIdentityStatus.mockResolvedValue({ verified: true, verifiedAt: null, suspended: true })
    render(<ReportApartmentPage />)

    expect(await screen.findByText(/reporting is paused/i)).toBeInTheDocument()
  })
})
