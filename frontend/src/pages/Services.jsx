import React from 'react';
import {
    UserPlus,
    ClipboardList,
    Briefcase,
    BookOpen,
    Users,
    ShieldCheck,
  } from "lucide-react";
  
  const services = [
    {
      title: "Recruitment Services",
      icon: <UserPlus className="w-8 h-8 text-blue-600" />,
      description:
        "We provide end-to-end recruitment services to match the right talent with the right job across industries.",
    },
    {
      title: "Bulk Hiring / Staffing",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      description:
        "Quick turnaround hiring for sales, field, and operations staff with onboarding and compliance support.",
    },
    {
      title: "Resume Building",
      icon: <ClipboardList className="w-8 h-8 text-blue-600" />,
      description:
        "Professional CV writing that highlights your strengths and increases your chances of selection.",
    },
    {
      title: "HR Outsourcing",
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      description:
        "End-to-end HR process management for businesses including payroll, compliance, and leave tracking.",
    },
    {
      title: "Training & Development",
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      description:
        "Custom training programs for sales, soft skills, onboarding, and compliance readiness.",
    },
    {
      title: "Background Verification",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      description:
        "Thorough background checks, education & employment verification to ensure hiring safety.",
    },
  ];
  
  const Services = () => {
    return (
      <div className="text-gray-800">
        {/* Hero / Header */}
        <section className="bg-blue-50 py-16 text-center px-6">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Our Services</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            We offer a wide range of HR and recruitment solutions tailored to meet your business needs and candidate aspirations.
          </p>
        </section>
  
        {/* Services Grid */}
        <section className="py-16 bg-white px-6">
          <div className="max-w-6xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* CTA */}
        <section className="py-12 bg-blue-600 text-white text-center px-6">
          <h2 className="text-2xl font-bold mb-4">Looking for Reliable HR Support?</h2>
          <p className="mb-6 max-w-xl mx-auto">
            Whether you're hiring for one role or 1000, we're here to help. Let’s talk about your needs.
          </p>
          <a
            href="/contact"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-blue-100 transition"
          >
            Get in Touch
          </a>
        </section>
      </div>
    );
  };
  
  export default Services;
  