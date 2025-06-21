'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import { 
  Car, 
  Users, 
  IndianRupee, 
  Clock, 
  TrendingUp, 
  MapPin,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import TripCard from '@/components/trips/TripCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const { trips, isLoading } = useTrips()
  
  // Calculate meaningful metrics
  const recentTrips = trips?.slice(0, 3) || []
  const totalTrips = trips?.length || 0
  const activeTrips = trips?.filter(trip => trip.status === 'active').length || 0
  
  // Calculate actual money saved based on shared rides
  const totalSavings = trips?.reduce((sum, trip) => {
    if (trip.currentPassengers > 1) {
      // Savings = price per person * (passengers - 1) for shared cost benefit
      return sum + (trip.pricePerPerson * (trip.currentPassengers - 1)/(trip.currentPassengers))
    }
    return sum
  }, 0) || 0
  
  // Total people helped (excluding driver)
  const totalPassengersHelped = trips?.reduce((sum, trip) => 
    sum + Math.max(0, trip.currentPassengers - 1), 0) || 0
  
  // Upcoming trips in next 7 days
  const upcomingTrips = trips?.filter(trip => {
    const tripDate = new Date(trip.departureTime)
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return trip.status === 'active' && tripDate >= now && tripDate <= nextWeek
  }).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.name}! 
              </h1>
              <p className="text-gray-600 text-lg">
                {upcomingTrips > 0 
                  ? `You have ${upcomingTrips} upcoming ${upcomingTrips === 1 ? 'trip' : 'trips'} this week`
                  : "Ready to plan your next journey?"
                }
              </p>
            </div>
            <Link
              href="/dashboard/trips/create"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create New Trip
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Stats Cards with Gradients and Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Trips */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900">{totalTrips}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {totalTrips > 0 ? 'Active' : 'Get started'}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Active Trips */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-3xl font-bold text-gray-900">{activeTrips}</p>
                <div className="flex items-center text-xs text-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {activeTrips > 0 ? 'In progress' : 'None active'}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Money Saved */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-3xl font-bold text-gray-900">₹{totalSavings.toFixed(0)}</p>
                <div className="flex items-center text-xs text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {totalSavings > 0 ? 'From sharing' : 'Start sharing'}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* People Helped */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">People Helped</p>
                <p className="text-3xl font-bold text-gray-900">{totalPassengersHelped}</p>
                <div className="flex items-center text-xs text-green-600">
                  <Users className="h-3 w-3 mr-1" />
                  {totalPassengersHelped > 0 ? 'Passengers' : 'Help others'}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/trips/create"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Create Trip</h3>
                <p className="text-blue-100 text-sm">Plan your next journey</p>
              </div>
              <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          <Link
            href="/search"
            className="group bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Find Rides</h3>
                <p className="text-green-100 text-sm">Join existing trips</p>
              </div>
              <MapPin className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/trips"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">My Trips</h3>
                <p className="text-purple-100 text-sm">Manage your rides</p>
              </div>
              <Calendar className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Trips Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Trips</h2>
                <p className="text-gray-600 mt-1">Your latest travel activities</p>
              </div>
              <Link
                href="/dashboard/trips"
                className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View all trips
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading your trips...</span>
              </div>
            ) : recentTrips.length > 0 ? (
              <div className="space-y-6">
                {recentTrips.map((trip, index) => (
                  <div 
                    key={trip.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TripCard trip={trip} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Start your journey by creating your first trip or finding rides to join.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/dashboard/trips/create"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Create Your First Trip
                  </Link>
                  <Link
                    href="/search"
                    className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                  >
                    Find Existing Rides
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
