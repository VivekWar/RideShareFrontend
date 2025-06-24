'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { updateTrip, deleteTrip, joinTrip } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Trip } from '@/types/trip'
import { 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupeeIcon, 
  Edit, 
  Trash2, 
  UserPlus,
  Clock,
  Phone,
  Crown,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ContactIcon,
  Mail,
  MessageCircle
} from 'lucide-react'

interface TripCardProps {
  trip: Trip
  onUpdate?: (updatedTrip: Trip) => void
  onDelete?: (tripId: number) => void
  showActions?: boolean
  onJoin?: (tripId: number) => Promise<void>
}

export default function TripCard({ 
  trip, 
  onUpdate, 
  onDelete, 
  showActions = true,
  onJoin
}: TripCardProps) {
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPassengerDetailsModalOpen, setIsPassengerDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [localTrip, setLocalTrip] = useState(trip)
  const [showPassengerDetails, setShowPassengerDetails] = useState(false)
  
  const [editData, setEditData] = useState({
    from_location: localTrip.from,
    to_location: localTrip.to,
    departure_time: new Date(localTrip.departureTime).toISOString().slice(0, 16),
    max_passengers: localTrip.maxPassengers,
    price_per_person: localTrip.pricePerPerson,
    description: localTrip.description
  })

  const isOwner = user?.id === localTrip.driverId || localTrip.userRole === 'driver'
  const isPassenger = localTrip.userRole === 'passenger'
  const canJoin = !isOwner && !isPassenger && localTrip.currentPassengers < localTrip.maxPassengers
  const isFull = localTrip.currentPassengers >= localTrip.maxPassengers

  // Phone number formatting function
  const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return ''
    
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    }
    
    if (cleaned.length > 10) {
      const countryCode = cleaned.slice(0, -10)
      const number = cleaned.slice(-10)
      return `+${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`
    }
    
    return phoneNumber
  }

  // Handle phone call
  const handlePhoneCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`
    }
  }

  // Handle SMS
  const handleSMS = (phoneNumber: string, passengerName: string) => {
    if (phoneNumber) {
      const message = `Hi ${passengerName}, this is regarding our shared trip from ${localTrip.from} to ${localTrip.to} on ${new Date(localTrip.departureTime).toLocaleDateString()}.`
      window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
    }
  }

  // Handle email
  const handleEmail = (email: string, passengerName: string) => {
    if (email) {
      const subject = `Trip Details: ${localTrip.from} to ${localTrip.to}`
      const body = `Hi ${passengerName},\n\nThis is regarding our shared trip:\n\nFrom: ${localTrip.from}\nTo: ${localTrip.to}\nDate: ${new Date(localTrip.departureTime).toLocaleDateString()}\nTime: ${new Date(localTrip.departureTime).toLocaleTimeString()}\n\nLooking forward to the trip!\n\nBest regards,\n${user?.name}`
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }

  const handleJoin = async () => {
    if (!onJoin) {
      setIsLoading(true)
      try {
        await joinTrip(localTrip.id)
        const updatedTrip = { ...localTrip, currentPassengers: localTrip.currentPassengers + 1 }
        setLocalTrip(updatedTrip)
        onUpdate?.(updatedTrip)
        
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      } catch (error: any) {
        alert(error.message)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(true)
      try {
        await onJoin(localTrip.id)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      } catch (error: any) {
        alert(error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      const updatedTrip = await updateTrip(localTrip.id, editData)
      setLocalTrip(updatedTrip)
      onUpdate?.(updatedTrip)
      setIsEditModalOpen(false)
      
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteTrip(localTrip.id)
      
      setIsAnimating(true)
      setTimeout(() => {
        onDelete?.(localTrip.id)
      }, 500)
    } catch (error: any) {
      alert(error.message)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
        transform hover:-translate-y-1 border border-gray-100 overflow-hidden
        ${isAnimating ? 'animate-pulse bg-green-50' : ''}
        ${isAnimating && 'animate-fade-out' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}>
        {/* Enhanced Trip Header with Role Indicator */}
        <div className={`p-4 text-white ${
          isOwner 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
            : isPassenger 
              ? 'bg-gradient-to-r from-green-500 to-teal-600'
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">{localTrip.from}</span>
              <span className={isOwner ? 'text-blue-200' : isPassenger ? 'text-green-200' : 'text-gray-200'}>→</span>
              <span className="font-semibold">{localTrip.to}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Role Badge */}
              {isOwner && (
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                  <Crown className="h-3 w-3" />
                  <span className="text-xs font-medium">Initiator</span>
                </div>
              )}
              {isPassenger && (
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                  <UserCheck className="h-3 w-3" />
                  <span className="text-xs font-medium">Passenger</span>
                </div>
              )}
              
              {/* Edit/Delete buttons only for trip owners */}
              {isOwner && showActions && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(localTrip.departureTime).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {new Date(localTrip.departureTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {localTrip.currentPassengers}/{localTrip.maxPassengers} passengers
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <IndianRupeeIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">₹{localTrip.pricePerPerson}</span>
            </div>
          </div>

          {localTrip.description && (
            <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
              {localTrip.description}
            </p>
          )}

          {/* Enhanced Contact Section Based on User Role */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {/* Trip Initiator Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  isOwner 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600'
                }`}>
                  {localTrip.driver?.name?.charAt(0) || user?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {localTrip.driver?.name || (isOwner ? user?.name : 'Trip Initiator')}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">Trip Initiator</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {canJoin && showActions && (
                  <Button
                    onClick={handleJoin}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {isLoading ? 'Joining...' : 'Join Trip'}
                  </Button>
                )}
                
                {isFull && !isOwner && !isPassenger && (
                  <span className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium">
                    Trip Full
                  </span>
                )}
                
                {isPassenger && (
                  <span className="bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm font-medium">
                    You're Joining
                  </span>
                )}
                
                {isOwner && (
                  <span className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium">
                    Your Trip
                  </span>
                )}
              </div>
            </div>

            {/* Phone Number Section */}
            {(localTrip.driver?.phone || user?.phone) && !isOwner && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Contact Trip Initiator:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPhoneNumber(localTrip.driver?.phone || user?.phone || '')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Show own phone for trip owner */}
            {isOwner && user?.phone && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Your contact:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {formatPhoneNumber(user.phone)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Passengers can contact you at this number
                </p>
              </div>
            )}

            {/* ✅ NEW: Passenger Details Button for Trip Owner */}
            {isOwner && localTrip.passengers && localTrip.passengers.length > 0 && (
              <div className="pt-2">
                <Button
                  onClick={() => setIsPassengerDetailsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ContactIcon className="h-5 w-5" />
                  <span>View Passenger Details & Contacts</span>
                  <span className="bg-white/20 rounded-full px-2 py-1 text-xs">
                    {localTrip.passengers.length}
                  </span>
                </Button>
              </div>
            )}

            {/* Existing Collapsible Passenger Details Section */}
            {isOwner && localTrip.passengers && localTrip.passengers.length > 0 && (
              <div className="pt-4">
                <button
                  onClick={() => setShowPassengerDetails(!showPassengerDetails)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <span>Quick View Passengers</span>
                  {showPassengerDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {showPassengerDetails && (
                  <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg">
                    {localTrip.passengers.map((passenger) => (
                      <div key={passenger.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-r from-green-500 to-teal-600`}>
                            {passenger.name?.charAt(0) || 'P'}
                          </div>
                          <span className="text-sm text-gray-800">{passenger.name}</span>
                        </div>
                        {passenger.phone && (
                          <button
                            onClick={() => handlePhoneCall(passenger.phone!)}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{formatPhoneNumber(passenger.phone!)}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Passenger Details Modal */}
      <Modal
        isOpen={isPassengerDetailsModalOpen}
        onClose={() => setIsPassengerDetailsModalOpen(false)}
        title="Passenger Details & Contacts"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Trip Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Route:</strong> {localTrip.from} → {localTrip.to}</p>
              <p><strong>Date:</strong> {new Date(localTrip.departureTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(localTrip.departureTime).toLocaleTimeString()}</p>
              <p><strong>Passengers:</strong> {localTrip.passengers?.length || 0}/{localTrip.maxPassengers}</p>
            </div>
          </div>

          {localTrip.passengers && localTrip.passengers.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Passengers who joined your trip:</h4>
              {localTrip.passengers.map((passenger, index) => (
                <div key={passenger.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
                        {passenger.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{passenger.name}</h5>
                        <p className="text-sm text-gray-500">Passenger #{index + 1}</p>
                        {passenger.email && (
                          <p className="text-sm text-gray-600">{passenger.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Options */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {passenger.phone && (
                      <>
                        <button
                          onClick={() => handlePhoneCall(passenger.phone!)}
                          className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call {formatPhoneNumber(passenger.phone!)}</span>
                        </button>
                        <button
                          onClick={() => handleSMS(passenger.phone!, passenger.name || 'Passenger')}
                          className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>SMS</span>
                        </button>
                      </>
                    )}
                    {passenger.email && (
                      <button
                        onClick={() => handleEmail(passenger.email!, passenger.name || 'Passenger')}
                        className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </button>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Joined on {new Date(passenger.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Contact All Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const allPhones = localTrip.passengers?.map(p => p.phone).filter(Boolean).join(',') || ''
                    if (allPhones) {
                      const message = `Hi everyone! This is regarding our shared trip from ${localTrip.from} to ${localTrip.to} on ${new Date(localTrip.departureTime).toLocaleDateString()} at ${new Date(localTrip.departureTime).toLocaleTimeString()}. Looking forward to the trip!`
                      window.location.href = `sms:${allPhones}?body=${encodeURIComponent(message)}`
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Send Group Message to All Passengers</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No passengers have joined this trip yet.</p>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={() => setIsPassengerDetailsModalOpen(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Trip"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Location
            </label>
            <input
              type="text"
              value={editData.from_location}
              onChange={(e) => setEditData({ ...editData, from_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Location
            </label>
            <input
              type="text"
              value={editData.to_location}
              onChange={(e) => setEditData({ ...editData, to_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time
            </label>
            <input
              type="datetime-local"
              value={editData.departure_time}
              onChange={(e) => setEditData({ ...editData, departure_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Passengers
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={editData.max_passengers}
                onChange={(e) => setEditData({ ...editData, max_passengers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Person (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={editData.price_per_person}
                onChange={(e) => setEditData({ ...editData, price_per_person: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleEdit}
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? 'Updating...' : 'Update Trip'}
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Trip"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this trip?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. All passengers will be notified.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {isLoading ? 'Deleting...' : 'Delete Trip'}
            </Button>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
