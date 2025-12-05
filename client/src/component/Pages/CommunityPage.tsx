import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getJobs } from "../../api/jobs";

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsCount = async () => {
      try {
        const jobs = await getJobs();
        // Filter only active jobs
        const activeJobs = jobs.filter(job => job.status === 'active');
        setJobsCount(activeJobs.length);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #2E3DD3 0%, #00AEEF 50%, #F7931E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Join Our Community
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 leading-relaxed">
            Connect with skilled professionals and find exciting job opportunities. Be part of a growing community of service providers.
          </p>
        </div>

        {/* Community Sections */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Find Job Opportunities Card */}
          <div
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const jobsSection = document.getElementById('jobs-section');
                if (jobsSection) {
                  jobsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-[#2E3DD3] cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E3DD3';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(46, 61, 211, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {/* Gradient Background Overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #2E3DD3 0%, #00AEEF 100%)'
              }}
            ></div>
            
            {/* Decorative Corner Accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #2E3DD3 0%, #00AEEF 100%)'
              }}
            ></div>

            <div className="relative p-8 z-10">
              {/* Card Header */}
              <div className="mb-6">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #2E3DD3 0%, #00AEEF 100%)'
                  }}
                >
                  <span className="text-2xl">💼</span>
                </div>
                <h2 
                  className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{ color: '#2E3DD3' }}
                >
                  Find Job Opportunities
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Discover new job opportunities that match your skills and grow your career with us.
                </p>
              </div>
              
              {/* Stats Section */}
              <div 
                className="mt-8 pt-6 border-t-2 rounded-lg p-4 group-hover:bg-gradient-to-br transition-all duration-300"
                style={{
                  borderColor: 'rgba(46, 61, 211, 0.2)',
                  background: 'linear-gradient(135deg, rgba(46, 61, 211, 0.05) 0%, rgba(0, 174, 239, 0.05) 100%)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-4xl font-bold"
                    style={{ color: '#2E3DD3' }}
                  >
                    {loading ? '...' : jobsCount}
                  </span>
                  <span className="text-gray-600 font-semibold">jobs available</span>
                </div>
                <div 
                  className="w-full bg-gradient-to-r from-[#2E3DD3] to-[#00AEEF] text-white py-3 rounded-xl font-semibold hover:from-[#1e2db3] hover:to-[#0099cc] transition-all duration-300 transform group-hover:scale-[1.02] shadow-lg text-center"
                >
                  View Jobs →
                </div>
              </div>
            </div>
          </div>

          {/* Diaspora Community Card */}
          <Link
            to="/diaspora"
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-[#F7931E]"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F7931E';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(247, 147, 30, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {/* Gradient Background Overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #F7931E 0%, #FFA64D 100%)'
              }}
            ></div>
            
            {/* Decorative Corner Accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #F7931E 0%, #FFA64D 100%)'
              }}
            ></div>

            <div className="relative p-8 z-10">
              {/* Card Header */}
              <div className="mb-6">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #F7931E 0%, #FFA64D 100%)'
                  }}
                >
                  <span className="text-2xl">🌍</span>
                </div>
                <h2 
                  className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{ color: '#F7931E' }}
                >
                  Diaspora Community
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Connect with your community abroad. Share experiences and discover opportunities to contribute back home.
                </p>
              </div>
              
              {/* CTA Section */}
              <div 
                className="mt-8 pt-6 border-t-2 rounded-lg p-4 group-hover:bg-gradient-to-br transition-all duration-300"
                style={{
                  borderColor: 'rgba(247, 147, 30, 0.2)',
                  background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.05) 0%, rgba(255, 166, 77, 0.05) 100%)'
                }}
              >
                <div 
                  className="w-full bg-gradient-to-r from-[#F7931E] to-[#FFA64D] text-white py-3 rounded-xl font-semibold hover:from-[#e6830d] hover:to-[#ff9500] transition-all duration-300 transform group-hover:scale-[1.02] shadow-lg text-center"
                >
                  Join Now →
                </div>
              </div>
            </div>
          </Link>

          {/* Premium Membership Card */}
          <Link
            to="/premium-membership"
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-[#2E3DD3]"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E3DD3';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(46, 61, 211, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {/* Premium Badge */}
            <div 
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg z-20"
              style={{
                background: 'linear-gradient(135deg, #2E3DD3 0%, #F7931E 100%)'
              }}
            >
              PREMIUM
            </div>

            {/* Gradient Background Overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #2E3DD3 0%, #F7931E 50%, #00AEEF 100%)'
              }}
            ></div>
            
            {/* Decorative Corner Accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #2E3DD3 0%, #F7931E 100%)'
              }}
            ></div>

            <div className="relative p-8 z-10">
              {/* Card Header */}
              <div className="mb-6">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #2E3DD3 0%, #F7931E 50%, #00AEEF 100%)'
                  }}
                >
                  <span className="text-2xl">👑</span>
                </div>
                <h2 
                  className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #2E3DD3 0%, #F7931E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Premium Membership
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Unlock exclusive access to premium services, priority booking, and advanced platform features.
                </p>
              </div>
              
              {/* Features List */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2" style={{ color: '#2E3DD3' }}>✓</span>
                  <span>Priority booking</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2" style={{ color: '#F7931E' }}>✓</span>
                  <span>Exclusive features</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2" style={{ color: '#00AEEF' }}>✓</span>
                  <span>Advanced tools</span>
                </div>
              </div>
              
              {/* CTA Section */}
              <div 
                className="mt-6 pt-6 border-t-2 rounded-lg p-4 group-hover:bg-gradient-to-br transition-all duration-300"
                style={{
                  borderColor: 'rgba(46, 61, 211, 0.2)',
                  background: 'linear-gradient(135deg, rgba(46, 61, 211, 0.05) 0%, rgba(247, 147, 30, 0.05) 50%, rgba(0, 174, 239, 0.05) 100%)'
                }}
              >
                <div 
                  className="w-full bg-gradient-to-r from-[#2E3DD3] via-[#F7931E] to-[#00AEEF] text-white py-3 rounded-xl font-semibold hover:from-[#1e2db3] hover:via-[#e6830d] hover:to-[#0099cc] transition-all duration-300 transform group-hover:scale-[1.02] shadow-lg text-center"
                >
                  Join Now →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
