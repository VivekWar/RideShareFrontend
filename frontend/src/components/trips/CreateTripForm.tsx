'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createTrip } from '@/lib/api'
import { CreateTripData } from '@/types/trip'
import { 
  MapPin, 
  Clock, 
  Users, 
  IndianRupee, 
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText
} from 'lucide-react'

interface CreateTripFormData {
  from: string
  to: string
  departureTime: string
  maxPassengers: number
  pricePerPerson: number
  description: string
}

interface FormErrors {
  from?: string
  to?: string
  departureTime?: string
  maxPassengers?: string
  pricePerPerson?: string
  description?: string
  general?: string
}

interface CreateTripFormProps {
  // Removed onSubmitStateChange prop
}

export default function CreateTripForm({}: CreateTripFormProps) {
  const [formData, setFormData] = useState<CreateTripFormData>({
    from: '',
    to: '',
    departureTime: '',
    maxPassengers: 1,
    pricePerPerson: 0,
    description: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()

  // Get current date-time for min attribute
  const now = new Date()
  const minDateTime = new Date(now.getTime() + 30 * 60000)
    .toISOString()
    .slice(0, 16)

  // Real-time validation
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'from':
        if (!value.trim()) return 'Departure location is required'
        if (value.trim().length < 3) return 'Location must be at least 3 characters'
        return undefined
        
      case 'to':
        if (!value.trim()) return 'Destination is required'
        if (value.trim().length < 3) return 'Location must be at least 3 characters'
        if (value.trim().toLowerCase() === formData.from.trim().toLowerCase()) {
          return 'Destination must be different from departure location'
        }
        return undefined
        
      case 'departureTime':
        if (!value) return 'Departure time is required'
        const departureDate = new Date(value)
        const currentDate = new Date()
        const minAllowedDate = new Date(currentDate.getTime() + 30 * 60000)
        
        if (departureDate <= currentDate) {
          return 'Departure time must be in the future'
        }
        if (departureDate < minAllowedDate) {
          return 'Departure time must be at least 30 minutes from now'
        }
        return undefined
        
      case 'maxPassengers':
        if (!value || value < 1) return 'At least 1 passenger is required'
        if (value > 100) return 'Maximum 100 passengers allowed'
        return undefined
        
      case 'pricePerPerson':
        if (!value || value <= 0) return 'Price must be greater than 0'
        if (value > 100000) return 'Price seems too high. Please check.'
        return undefined
        
      default:
        return undefined
    }
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof CreateTripFormData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle field changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let processedValue: any = value
    
    // Convert to number for numeric fields
    if (type === 'number') {
      processedValue = parseInt(value, 10) || 0
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, processedValue)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  // Handle field blur (mark as touched)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, formData[name as keyof CreateTripFormData])
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {})
    setTouched(allFields)
    
    // Validate form
    if (!validateForm()) {
      setErrors(prev => ({
        ...prev,
        general: 'Please fix the errors above before submitting'
      }))
      return
    }
    
    setIsLoading(true)
    setErrors({})

    try {
      console.log('=== CREATE TRIP FORM SUBMISSION ===')
      console.log('Form data:', formData)
      
      // ✅ Format data to match CreateTripData interface exactly
      const apiData: CreateTripData = {
        from: formData.from.trim(),
        to: formData.to.trim(),
        departureTime: new Date(formData.departureTime).toISOString(),
        maxPassengers: formData.maxPassengers,
        pricePerPerson: formData.pricePerPerson,
        description: formData.description.trim() || undefined // Use null for empty description
      }
      
      console.log('API data being sent:', apiData)
      
      const result = await createTrip(apiData)
      console.log('Trip created successfully:', result)
      
      // Show success state
      setShowSuccess(true)
      
      // Navigate after short delay
      setTimeout(() => {
        router.push('/dashboard/trips')
      }, 1500)
      
    } catch (err: any) {
      console.error('Create trip error:', err)
      
      let errorMessage = 'Failed to create trip. Please try again.'
      
      if (err.response?.status) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid trip data. Please check your inputs.';
            break;
          case 401:
            errorMessage = 'Please log in again to create a trip.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            if (err.response.data?.error) {
              errorMessage = err.response.data.error;
            }
        }
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Trip Created!</h3>
        <p className="text-gray-600 text-sm">Redirecting you to your trips...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Compact Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 text-sm">Error</h4>
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Compact Route Section */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Route
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="From"
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="e.g., Mumbai Central"
              icon={<MapPin className="h-4 w-4" />}
              className={`text-sm ${errors.from ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.from && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.from}
              </p>
            )}
          </div>

          <div>
            <Input
              label="To"
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="e.g., Pune Station"
              icon={<MapPin className="h-4 w-4" />}
              className={`text-sm ${errors.to ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.to && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.to}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compact Trip Details */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Departure"
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              onBlur={handleBlur}
              min={minDateTime}
              required
              icon={<Clock className="h-4 w-4" />}
              className={`text-sm ${errors.departureTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.departureTime && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.departureTime}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Passengers(Number excluding yourself)"
              type="number"
              name="maxPassengers"
              value={formData.maxPassengers.toString()}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              max="8"
              required
              icon={<Users className="h-4 w-4" />}
              className={`text-sm ${errors.maxPassengers ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.maxPassengers && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.maxPassengers}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Total Approximate Fare Price (₹)"
              type="number"
              name="pricePerPerson"
              value={formData.pricePerPerson.toString()}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              step="1"
              required
              placeholder="500"
              icon={<IndianRupee className="h-4 w-4" />}
              className={`text-sm ${errors.pricePerPerson ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.pricePerPerson && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.pricePerPerson}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compact Description */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          Description <span className="text-sm text-gray-400 font-normal">(Optional)</span>
        </h3>
        
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Additional details about pickup points, preferences..."
        />
      </div>

      {/* Compact Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </div>
          ) : (
            'Create Trip'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
