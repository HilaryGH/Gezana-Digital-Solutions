import React, { useState } from "react";

const teamMembers = [
  {
    name: "Hilary Gebremedhin",
    role: "Founder & CEO",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Passionate about digital transformation and connecting people with trusted services.",
  },
  {
    name: "Mekdes Tadesse",
    role: "Head of Operations",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Ensuring smooth and efficient service delivery across all platforms.",
  },
  {
    name: "Abel Tesfaye",
    role: "Lead Developer",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Building innovative and scalable digital solutions.",
  },
  {
    name: "Sara Desta",
    role: "Customer Success Manager",
    photo: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "Dedicated to delivering exceptional customer experiences.",
  },
];

const testimonials = [
  {
    name: "Tesfaye Gebremedhin",
    photo: "https://randomuser.me/api/portraits/men/12.jpg",
    text: "Gezana Digital Solutions changed how I find reliable services. Booking is super easy!",
  },
  {
    name: "Helen Amanuel",
    photo: "https://randomuser.me/api/portraits/women/21.jpg",
    text: "The platform connects me to verified professionals, making life hassle-free.",
  },
  {
    name: "Daniel Kifle",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "Highly recommend Gezana! The service gifting feature is a game-changer.",
  },
];

const About: React.FC = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const prevTestimonial = () =>
    setTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  const nextTestimonial = () =>
    setTestimonialIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto bg-white p-10 md:p-16 shadow-xl rounded-2xl border border-orange-100">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-extrabold text-orange-600 mb-3">
            About Gezana Digital Solutions
          </h1>
          <p className="text-gray-600 text-sm text-base">
            Connecting People with Trusted Services – Seamlessly.
          </p>
          <div className="w-24 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Overview
          </h2>
          <p className="text-gray-700 text-sm text-base leading-relaxed text-justify">
            <strong>Gezana Digital Solutions</strong> is an innovative digital
            platform designed to transform how customers access and purchase
            services. It empowers users to easily search, discover, and book a
            wide range of services — from everyday essentials to professional
            needs — all in one place.
            <br />
            <br />
            Features include seamless booking, secure payments, service gifting,
            and digital gift card generation. By connecting customers with
            trusted service providers, Gezana streamlines the entire service
            experience, making it efficient, secure, and user-friendly.
          </p>
        </div>

        <hr className="my-10 border-gray-300" />

        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-lg  md:text-2xl font-semibold text-gray-800 mb-4">
            Mission
          </h2>
          <p className="text-gray-700 text-sm text-base leading-relaxed text-justify">
            To deliver a seamless and user-friendly platform that connects
            customers with trusted, high-quality service providers and
            professionals. Our mission is to ensure convenience, reliability,
            and exceptional satisfaction throughout every service interaction.
          </p>
        </div>

        <hr className="my-10 border-gray-300" />

        {/* Vision */}
        <div className="mb-16">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4">
            Vision
          </h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2 text-justify">
            <li>
              To become the leading digital services platform by 2030,
              revolutionizing how people access services across diverse sectors.
            </li>
            <li>
              To build a thriving ecosystem of skilled professionals and loyal
              customers through innovation, trust, and community-centered
              solutions.
            </li>
          </ul>
        </div>

        {/* Team Profiles */}
        <section className="mb-16">
          <h2 className="text-xl md:text-3xl font-bold text-center text-orange-600 mb-10">
            Meet Our Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
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
        </section>

        {/* Testimonials Slider */}
        <section>
          <h2 className=" text-xl md:text-3xl font-bold text-center text-orange-600 mb-10">
            What Our Clients Say
          </h2>

          <div className="max-w-xl mx-auto bg-orange-50 rounded-xl shadow-md p-8 relative">
            <p className="text-gray-800 italic text-sm text-base mb-6 text-center">
              “{testimonials[testimonialIndex].text}”
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={prevTestimonial}
                className="text-orange-600 hover:text-orange-800 focus:outline-none"
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
                className="text-orange-600 hover:text-orange-800 focus:outline-none"
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default About;
