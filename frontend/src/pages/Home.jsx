import React from "react";
import {
  Briefcase,
  MapPin,
  Building2,
  Star,
  Users,
  ClipboardList,
} from "lucide-react";

const Clients = () => {
  const clients = [
    {
      name: "TCS",
      logo: "/img/tcs.png",
    },
    {
      name: "Muthoot Finance",
      logo: "/img/muthoot.svg",
    },
    {
      name: "Infosys",
      logo: "/img/infosys.png",
    },
    {
      name: "Vi",
      logo: "/img/vodafone.png",
    },
    {
      name: "vi",
      logo: "/img/vi.png",
    },
    {
      name: "hcl",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Capgemini_201x_logo.svg/512px-Capgemini_201x_logo.svg.png",
    },
  ];

  return (
    <section className="py-16 bg-white text-center px-4">
      <h2 className="text-3xl font-bold mb-10">Our Clients</h2>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
        Trusted by leading companies across India and the world. Here are some of the brands we've proudly worked with.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 items-center justify-items-center max-w-6xl mx-auto">
        {clients.map((client, index) => (
          <div key={index} className="grayscale hover:grayscale-0 transition duration-300">
            <img
              src={client.logo}
              alt={client.name}
              className="h-12 object-contain"
              title={client.name}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  
  const services = [
    {
      title: "Job Placement",
      image: "/img/img1.jpg",
      desc: "We help you find the right role with top employers in India and abroad.",
    },
    {
      title: "Career Consulting",
      image: "/img/img2.jpg",
      desc: "Professional guidance for career change, growth, or fresh starts.",
    },
    {
      title: "Resume Building",
      image: "/img/img3.jpg",
      desc: "We craft powerful resumes that get attention from recruiters.",
    },
  ];

  const jobs = [
    {
      title: "Sales Executive",
      company: "Muthoot Finance",
      location: "Bengaluru, India",
      salary: "₹18,000 + Incentives",
    },
    {
      title: "Backend Developer",
      company: "TechNova Pvt Ltd",
      location: "Remote",
      salary: "₹60,000 - ₹80,000",
    },
    {
      title: "HR Recruiter",
      company: "Ozarx HR Solutions",
      location: "Chennai, India",
      salary: "₹25,000 + Bonus",
    },
  ];

  const testimonials = [
    {
      quote: "Amazing support and very helpful team. Got placed in 2 weeks!",
      name: "Ayesha R.",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      quote: "Their resume service landed me more interviews in a week.",
      name: "Rahul N.",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
    },
  ];

  return (
    <div className="text-gray-800">
      {/* Hero */}
      <section className="relative h-[90vh] w-full overflow-hidden">
  <video
    autoPlay
    loop
    muted
    className="absolute top-0 left-0 w-full h-full object-cover z-0"
    src="/img/vid1.mp4"
  />
  <div className="absolute inset-0 bg-black bg-opacity-60 z-10 flex items-center justify-center">
    <div className="text-center px-4 z-20">
      <h1 className="text-white text-4xl md:text-6xl font-bold mb-6 drop-shadow">
        Find Your Dream Job
      </h1>
      <input
        type="text"
        placeholder="Search jobs by title or location"
        className="w-full max-w-md px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
</section>


      {/* About */}
      <section className="py-16 bg-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          We connect job seekers with top companies across India and abroad. Trusted by 100+ employers and thousands of candidates. Our comprehensive HR solutions include recruitment, resume optimization, career counseling, and placement services. With over 5 years of experience in the industry, we've successfully placed candidates in leading tech companies, startups, and multinational corporations. Our dedicated team of HR professionals works tirelessly to match the right talent with the right opportunities, ensuring both employers and job seekers achieve their goals.
        </p>
      </section>

      {/* Services with Illustrations */}
      <section className="py-16 bg-gray-50 text-center px-4">
        <h2 className="text-3xl font-bold mb-10">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition text-center"
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-20 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Job Listings with Icons */}
      <section className="py-16 bg-white px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Current Job Listings</h2>
        <div className="max-w-5xl mx-auto space-y-6">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition flex flex-col md:flex-row justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  {job.title}
                </h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {job.company}
                </p>
                <p className="text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-blue-600 font-medium">{job.salary}</p>
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                  <Link to="/login">Apply Now</Link>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials with Avatars */}
      <section className="py-16 bg-gray-50 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">What Our Clients Say</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-semibold">{t.name}</p>
                  <div className="flex text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      <Clients />
    </div>
  );
};

export default Home;
