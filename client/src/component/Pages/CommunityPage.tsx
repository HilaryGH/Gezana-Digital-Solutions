import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGlobe, FaUsers, FaHandshake, FaArrowRight, FaUserFriends } from "react-icons/fa";
import { MdConnectWithoutContact, MdVolunteerActivism } from "react-icons/md";

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20" style={{ backgroundColor: 'var(--brand-background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg" style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))' }}>
            <MdConnectWithoutContact className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--brand-black)' }}>
            Join Our Community
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4b5563' }}>
            Connect with others, make a difference, and be part of something bigger. Choose how you'd like to contribute to our community.
          </p>
        </div>

        {/* Community Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Support Community Card - For Volunteers */}
          <Link
            to="/support"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-[#2e3dd3]"
            style={{ borderColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))' }}>
                  <MdVolunteerActivism className="w-8 h-8 text-white" />
                </div>
                <FaArrowRight className="w-6 h-6 text-gray-400 group-hover:translate-x-2 transition-all duration-300" style={{ color: 'var(--brand-accent)' }} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--brand-black)' }}>
                Support Community
              </h2>
              <p className="mb-6 leading-relaxed" style={{ color: '#4b5563' }}>
                Become a volunteer and help support our community! Join our team of dedicated volunteers who assist users, answer questions, and make a positive impact.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaHeart className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <span>Volunteer to help others</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaUserFriends className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <span>Join our support team</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaHandshake className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <span>Make a difference in the community</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <span className="font-semibold group-hover:underline transition-all" style={{ color: 'var(--brand-primary)' }}>
                  Become a Volunteer →
                </span>
              </div>
            </div>
          </Link>

          {/* Diaspora Community Card */}
          <Link
            to="/diaspora"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-[#f7931e]"
            style={{ borderColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(45deg, var(--brand-accent), var(--brand-gold))' }}>
                  <FaGlobe className="w-8 h-8 text-white" />
                </div>
                <FaArrowRight className="w-6 h-6 text-gray-400 group-hover:translate-x-2 transition-all duration-300" style={{ color: 'var(--brand-accent)' }} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--brand-black)' }}>
                Diaspora Community
              </h2>
              <p className="mb-6 leading-relaxed" style={{ color: '#4b5563' }}>
                Connect with fellow diaspora members worldwide. Share experiences, network, and contribute to community projects and initiatives.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaGlobe className="w-4 h-4" style={{ color: 'var(--brand-accent)' }} />
                  <span>Global network of members</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaUsers className="w-4 h-4" style={{ color: 'var(--brand-accent)' }} />
                  <span>Cultural exchange opportunities</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: '#374151' }}>
                  <FaHandshake className="w-4 h-4" style={{ color: 'var(--brand-accent)' }} />
                  <span>Business and investment networking</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <span className="font-semibold group-hover:underline transition-all" style={{ color: 'var(--brand-accent)' }}>
                  Join Diaspora →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="mb-4" style={{ color: '#4b5563' }}>
            Not sure which community is right for you?
          </p>
          <Link
            to="/contact"
            className="font-semibold underline hover:no-underline transition-all"
            style={{ color: 'var(--brand-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
          >
            Contact us for more information
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;

