import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import type { Profile } from '../../types/profile.types'
import { truncate, getInitials } from '../../utils/helpers'

interface BusinessCardProps {
  profile: Profile
}

const GRADIENT_COLORS = [
  'from-orange-400 to-brand-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-yellow-400 to-orange-500',
]

export default function BusinessCard({ profile }: BusinessCardProps) {
  const gradient = GRADIENT_COLORS[profile.id % GRADIENT_COLORS.length]

  return (
    <Link
      to={`/perfil/${profile.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover
                 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col group"
    >
      {/* Cover */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {profile.coverUrl
          ? <img src={profile.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : null
        }
        {/* Logo / Avatar */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white shadow-md
                        flex items-center justify-center border-2 border-white overflow-hidden">
          {profile.logoUrl
            ? <img src={profile.logoUrl} alt={profile.businessName} className="w-full h-full object-cover" />
            : <span className="font-display font-extrabold text-brand-600 text-sm">
                {getInitials(profile.businessName)}
              </span>
          }
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 px-4 pb-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-brand-600 mb-0.5">{profile.category}</p>
        <h3 className="font-display font-bold text-gray-900 text-sm leading-tight
                       group-hover:text-brand-600 transition-colors mb-1">
          {profile.businessName}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">
          {truncate(profile.description, 70)}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-gray-800">{profile.rating.toFixed(1)}</span>
            <span className="text-gray-400">({profile.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={11} />
            <span className="truncate max-w-[80px]">{profile.address.split(',')[0]}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
