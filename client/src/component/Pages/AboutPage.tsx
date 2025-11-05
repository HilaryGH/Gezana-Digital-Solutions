import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  order: number;
  isActive: boolean;
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white p-10 md:p-16 shadow-xl rounded-2xl border border-orange-100">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-4xl font-extrabold text-orange-600 mb-3">
              Company Profile: HomeHub Digital Solutions
            </h1>
            <p className="text-gray-600 text-sm text-base">
              Connecting People with Trusted Services – Seamlessly.
            </p>
            <div className="w-24 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* Company Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Company Overview
            </h2>
            <p className="text-gray-700 text-sm text-base leading-relaxed text-justify">
              <strong>HomeHub Digital Solutions</strong> is a pioneering multi-vendor digital platform based in Addis Ababa, Ethiopia. Established to connect service seekers with certified, verified and reliable service providers, HomeHub offers real-time booking, secure payment processing, and location-based service matching for various home needs. By digitizing a traditionally fragmented market, the platform enhances convenience, accessibility, and operational efficiency, benefiting both customers and service providers while generating sustainable income opportunities, particularly for women and youth.
            </p>
          </div>

          <hr className="my-10 border-gray-300" />

          {/* Mission */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4">
              Mission
            </h2>
            <p className="text-gray-700 text-sm text-base leading-relaxed text-justify">
              To empower Ethiopian households by providing seamless, trustworthy, and affordable home services while fostering dignified livelihoods for local artisans and entrepreneurs.
            </p>
          </div>

          <hr className="my-10 border-gray-300" />

          {/* Vision */}
          <div className="mb-16">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4">
              Vision
            </h2>
            <p className="text-gray-700 text-sm text-base leading-relaxed text-justify">
              To establish the leading digital home-services ecosystem in Ethiopia and East Africa by 2030, promoting inclusive economic growth, gender equity, and sustainable urban development.
            </p>
          </div>

          {/* Team Profiles */}
          <section className="mb-16">
            <h2 className="text-xl md:text-3xl font-bold text-center text-orange-600 mb-10">
              Meet Our Team
            </h2>

            {loading ? (
              <p className="text-center text-gray-600">Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p className="text-center text-gray-600">No team members to display yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-orange-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
                  >
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-orange-300"
                    />
                    <h3 className="text-xl font-semibold text-orange-700">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-orange-500 mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-700 text-sm">{member.bio}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Testimonials Slider */}
          <section>
            <h2 className=" text-xl md:text-3xl font-bold text-center text-orange-600 mb-10">
              What Our Clients Say
            </h2>

            {testimonialsLoading ? (
              <p className="text-center text-gray-600">Loading testimonials...</p>
            ) : testimonials.length === 0 ? (
              <div className="max-w-xl mx-auto bg-orange-50 rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">No testimonials yet. Be the first to share your experience!</p>
                <a
                  href="/submit-testimonial"
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  Submit Your Testimonial
                </a>
              </div>
            ) : (
              <>
                <div className="max-w-xl mx-auto bg-orange-50 rounded-xl shadow-md p-8 relative">
                  <p className="text-gray-800 italic text-sm text-base mb-6 text-center">
                    "{testimonials[testimonialIndex].text}"
                  </p>
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={prevTestimonial}
                      className="text-orange-600 hover:text-orange-800 focus:outline-none text-2xl"
                      aria-label="Previous testimonial"
                    >
                      ←
                    </button>
                    <div className="flex items-center space-x-3">
                      <img
                        src={testimonials[testimonialIndex].photo}
                        alt={testimonials[testimonialIndex].name}
                        className="w-12 h-12 rounded-full border-2 border-orange-600 object-cover"
                      />
                      <span className="font-semibold text-orange-700">
                        {testimonials[testimonialIndex].name}
                      </span>
                    </div>
                    <button
                      onClick={nextTestimonial}
                      className="text-orange-600 hover:text-orange-800 focus:outline-none text-2xl"
                      aria-label="Next testimonial"
                    >
                      →
                    </button>
                  </div>
                  <div className="text-center mt-4 text-sm text-gray-500">
                    {testimonialIndex + 1} / {testimonials.length}
                  </div>
                </div>
                <div className="text-center mt-6">
                  <a
                    href="/submit-testimonial"
                    className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                  >
                    Share Your Experience
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
