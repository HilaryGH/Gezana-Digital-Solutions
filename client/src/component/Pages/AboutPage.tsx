import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Target, Eye, Briefcase, Users, Star, Quote, ArrowLeft, ArrowRight, Linkedin, Twitter, Facebook, Mail, Phone, MapPin, GraduationCap, Award, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  email?: string;
  phone?: string;
  location?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  order: number;
  isActive: boolean;
};

// Helper function to get correct image URL
const getImageUrl = (photo: string): string => {
  if (!photo) return "https://via.placeholder.com/150?text=No+Image";
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  if (photo.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : 'https://gezana-api.onrender.com';
    return `${baseUrl}${photo}`;
  }
  return photo;
};

type Testimonial = {
  _id: string;
  name: string;
  email?: string;
  photo: string;
  text: string;
  rating: number;
  isApproved: boolean;
  isActive: boolean;
};

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await axios.get<TeamMember[]>("/team-members");
        setTeamMembers(res.data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await axios.get<Testimonial[]>("/testimonials");
        setTestimonials(res.data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTeamMembers();
    fetchTestimonials();
  }, []);

  const prevTestimonial = () =>
    setTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  const nextTestimonial = () =>
    setTestimonialIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-orange-50/30 pt-20">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-[#2e3dd3] via-[#00aeef] to-[#2e3dd3] py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              About <span className="text-[#ffc60b]">HomeHub</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 font-medium">
              Connecting People with Trusted Services – Seamlessly
            </p>
            <p className="text-lg text-blue-50 max-w-3xl mx-auto">
              Pioneering the future of home services in Ethiopia through innovation, trust, and community empowerment
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Company Overview Section */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2e3dd3] to-[#00aeef] rounded-2xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Company Overview
              </h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              <strong className="text-[#2e3dd3]">HomeHub Digital Solutions</strong> is a pioneering multi-vendor digital platform based in Addis Ababa, Ethiopia. Established to connect service seekers with certified, verified and reliable service providers, HomeHub offers real-time booking, secure payment processing, and location-based service matching for various home needs.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              By digitizing a traditionally fragmented market, the platform enhances convenience, accessibility, and operational efficiency, benefiting both customers and service providers while generating sustainable income opportunities, particularly for women and youth.
            </p>
          </div>
        </section>

        {/* Mission & Vision Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-[#2e3dd3] to-[#00aeef] rounded-3xl shadow-2xl p-8 md:p-10 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-blue-50 text-lg leading-relaxed">
              To empower Ethiopian households by providing seamless, trustworthy, and affordable home services while fostering dignified livelihoods for local artisans and entrepreneurs.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-gradient-to-br from-[#f7931e] to-[#ffc60b] rounded-3xl shadow-2xl p-8 md:p-10 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Eye className="w-7 h-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Vision</h2>
            </div>
            <p className="text-orange-50 text-lg leading-relaxed">
              To establish the leading digital home-services ecosystem in Ethiopia and East Africa by 2030, promoting inclusive economic growth, gender equity, and sustainable urban development.
            </p>
          </div>
        </section>

          {/* Team Profiles */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2e3dd3] to-[#00aeef] rounded-2xl mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Meet Our <span className="text-[#2e3dd3]">Team</span>
              </h2>
              <p className="text-gray-600 text-lg">
                The passionate people behind HomeHub
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No team members to display yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 flex flex-col items-center text-center group"
                  >
                    <div className="relative mb-4">
                      <img
                        src={getImageUrl(member.photo)}
                        alt={member.name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-[#2e3dd3] group-hover:border-[#00aeef] transition-colors duration-300 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#2e3dd3] to-[#00aeef] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#2e3dd3] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#00aeef] mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {member.bio}
                    </p>
                    
                    {/* Additional Info */}
                    {member.location && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{member.location}</span>
                      </div>
                    )}
                    
                    {/* Social Links */}
                    {(member.linkedin || member.twitter || member.facebook) && (
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 w-full justify-center">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#0077b5] text-white rounded-lg flex items-center justify-center hover:bg-[#005885] transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#1DA1F2] text-white rounded-lg flex items-center justify-center hover:bg-[#0d8bd9] transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {member.facebook && (
                          <a
                            href={member.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#1877F2] text-white rounded-lg flex items-center justify-center hover:bg-[#1565c0] transition-colors"
                          >
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Testimonials Slider */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f7931e] to-[#ffc60b] rounded-2xl mb-4 shadow-lg">
                <Quote className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What Our <span className="text-[#f7931e]">Clients Say</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Real stories from our community
              </p>
            </div>

            {testimonialsLoading ? (
              <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-12 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-xl p-12 text-center border border-orange-100">
                <Quote className="w-16 h-16 text-orange-300 mx-auto mb-6" />
                <p className="text-gray-600 text-lg mb-6">No testimonials yet. Be the first to share your experience!</p>
                <button
                  onClick={() => navigate("/submit-testimonial")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f7931e] to-[#ffc60b] text-white px-8 py-4 rounded-full hover:from-[#e6851a] hover:to-[#e6b60a] transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Star className="w-5 h-5" />
                  Submit Your Testimonial
                </button>
              </div>
            ) : (
              <>
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl p-8 md:p-12 relative border border-blue-100">
                  {/* Quote Icon */}
                  <div className="absolute top-6 left-6 opacity-20">
                    <Quote className="w-20 h-20 text-[#2e3dd3]" />
                  </div>
                  
                  <div className="relative z-10">
                    {/* Rating Stars */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < (testimonials[testimonialIndex].rating || 5)
                              ? "text-[#ffc60b] fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-gray-800 text-lg md:text-xl leading-relaxed text-center mb-8 font-medium italic">
                      "{testimonials[testimonialIndex].text}"
                    </p>
                    
                    {/* Author Info */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getImageUrl(testimonials[testimonialIndex].photo)}
                          alt={testimonials[testimonialIndex].name}
                          className="w-16 h-16 rounded-full border-4 border-[#2e3dd3] object-cover shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/150?text=User";
                          }}
                        />
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-lg">
                            {testimonials[testimonialIndex].name}
                          </p>
                          {testimonials[testimonialIndex].rating && (
                            <p className="text-sm text-gray-600">
                              {testimonials[testimonialIndex].rating.toFixed(1)} ⭐ Rating
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Navigation Controls */}
                      <div className="flex items-center gap-6 mt-4">
                        <button
                          onClick={prevTestimonial}
                          className="w-12 h-12 bg-white border-2 border-[#2e3dd3] text-[#2e3dd3] rounded-full flex items-center justify-center hover:bg-[#2e3dd3] hover:text-white transition-all shadow-lg hover:scale-110"
                          aria-label="Previous testimonial"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex gap-2">
                          {testimonials.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setTestimonialIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === testimonialIndex
                                  ? "bg-[#2e3dd3] w-8"
                                  : "bg-gray-300 hover:bg-gray-400"
                              }`}
                              aria-label={`Go to testimonial ${index + 1}`}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={nextTestimonial}
                          className="w-12 h-12 bg-white border-2 border-[#2e3dd3] text-[#2e3dd3] rounded-full flex items-center justify-center hover:bg-[#2e3dd3] hover:text-white transition-all shadow-lg hover:scale-110"
                          aria-label="Next testimonial"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-2">
                        {testimonialIndex + 1} of {testimonials.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="text-center mt-8">
                  <button
                    onClick={() => navigate("/submit-testimonial")}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2e3dd3] to-[#00aeef] text-white px-8 py-4 rounded-full hover:from-[#2638c0] hover:to-[#0099d9] transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Star className="w-5 h-5" />
                    Share Your Experience
                  </button>
                </div>
              </>
            )}
          </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our Core <span className="text-[#2e3dd3]">Values</span>
            </h2>
            <p className="text-gray-600 text-lg">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#2e3dd3] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2e3dd3] to-[#00aeef] rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Reliability</h3>
              <p className="text-gray-600 leading-relaxed">
                We verify all service providers to ensure you receive quality, trustworthy services every time.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#f7931e] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#f7931e] to-[#ffc60b] rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                We strive for excellence in every service interaction, setting high standards for our platform and partners.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#00aeef] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00aeef] to-[#00e5ff] rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600 leading-relaxed">
                We're committed to building a supportive community that empowers both service seekers and providers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
