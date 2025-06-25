import React from "react";

const About = () => {
  return (
    <div className="text-gray-800">
      {/* Hero / Intro */}
      <section className="bg-blue-50 py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">About Us</h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          Ozarx HR Solutions is dedicated to connecting skilled professionals with meaningful opportunities across India and the globe.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To provide high-quality HR services including recruitment, staffing, and career guidance that bridge the gap between companies and talent. We empower candidates to achieve their career goals and help businesses find perfect fits for their roles.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To be the most trusted and preferred HR solutions partner globally, enabling careers and building high-performing organizations through ethical and efficient hiring practices.
            </p>
          </div>
        </div>
      </section>

      {/* Stats / Highlights */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Our Impact</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: "Companies Served", value: "120+" },
              { label: "Candidates Placed", value: "3,000+" },
              { label: "Cities Covered", value: "30+" },
              { label: "Industries Served", value: "15+" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-4xl font-extrabold text-blue-600">{item.value}</p>
                <p className="text-gray-600 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section (optional) */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                name: "Shamseer PM",
                role: "Founder & CEO",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                name: "Neha Rao",
                role: "Head of Recruitment",
                image: "https://randomuser.me/api/portraits/women/45.jpg",
              },
              {
                name: "Arjun Kumar",
                role: "Operations Manager",
                image: "https://randomuser.me/api/portraits/men/76.jpg",
              },
            ].map((person, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">{person.name}</h3>
                <p className="text-blue-600">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-12 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to grow your team or career?</h2>
        <p className="mb-6">Connect with Ozarx HR Solutions today.</p>
        <a
          href="/contact"
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default About;
