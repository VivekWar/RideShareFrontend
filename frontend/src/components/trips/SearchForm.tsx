'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MapPin, Calendar, IndianRupeeIcon } from 'lucide-react'
import { debounce } from 'lodash' // You'll need to install lodash

interface SearchFormData {
  from: string
  to: string
  departureDate: string
  maxPrice: number
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void
  isLoading: boolean
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    from: '',
    to: '',
    departureDate: '',
    maxPrice: 0
  })
  
  const [errors, setErrors] = useState<Partial<SearchFormData>>({})

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchData: SearchFormData) => {
      onSearch(searchData)
    }, 500),
    [onSearch]
  )

  const normalizeLocation = (location: string): string => {
    return location
      .toLowerCase()
      .replace(/[,\.]/g, '') // Remove commas and periods
      .trim()
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SearchFormData> = {}
    
    if (!formData.from.trim()) {
      newErrors.from = 'Departure location is required'
    }
    
    if (!formData.to.trim()) {
      newErrors.to = 'Destination is required'
    }
    
    // Normalize and compare locations
    if (normalizeLocation(formData.from) === normalizeLocation(formData.to)) {
      newErrors.to = 'Destination must be different from departure location'
    }
    
    if (formData.departureDate) {
      const selectedDate = new Date(formData.departureDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.departureDate = 'Departure date cannot be in the past'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setErrors({})
    
    if (!validateForm()) {
      return
    }

    try {
      const searchData = {
        from: formData.from.trim(),
        to: formData.to.trim(),
        departureDate: formData.departureDate,
        maxPrice: formData.maxPrice || 10000
      }
      
      onSearch(searchData)
      
    } catch (error) {
      console.error('Search error:', error)
      setErrors({ from: 'Search failed. Please try again.' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (errors[name as keyof SearchFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
    
    const newFormData = {
      ...formData,
      [name]: type === 'number' ? 
        (value === '' ? 0 : Math.max(0, parseInt(value) || 0)) : 
        value
    }
    
    setFormData(newFormData)

    // Auto-search on location changes (debounced)
    if ((name === 'from' || name === 'to') && value.length >= 2) {
      debouncedSearch(newFormData)
    }
  }

  // Rest of your component remains the same...
  const handleReset = () => {
    setFormData({
      from: '',
      to: '',
      departureDate: '',
      maxPrice: 0
    })
    setErrors({})
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Trips</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="From"
            type="text"
            name="from"
            value={formData.from}
            onChange={handleChange}
            placeholder="e.g., Mumbai, New Delhi, Bangalore"
            required
            icon={<MapPin className="h-4 w-4" />}
          />
          {errors.from && (
            <p className="mt-1 text-sm text-red-600">{errors.from}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Search works with partial matches (e.g., "Delhi" finds "New Delhi")
          </p>
        </div>

        <div>
          <Input
            label="To"
            type="text"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="e.g., Pune, Chennai, Kolkata"
            required
            icon={<MapPin className="h-4 w-4" />}
          />
          {errors.to && (
            <p className="mt-1 text-sm text-red-600">{errors.to}</p>
          )}
        </div>

        <div>
          <Input
            label="Departure Date (Optional)"
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={today}
            icon={<Calendar className="h-4 w-4" />}
          />
          {errors.departureDate && (
            <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
          )}
        </div>

        <div>
          <Input
            label="Max Price (₹) - Optional"
            type="number"
            name="maxPrice"
            value={formData.maxPrice || ''}
            onChange={handleChange}
            min="0"
            step="10"
            placeholder="Maximum price per person"
            icon={<IndianRupeeIcon className="h-4 w-4" />}
          />
          {errors.maxPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.maxPrice}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to search all price ranges
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Searching...' : 'Search Trips'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}
