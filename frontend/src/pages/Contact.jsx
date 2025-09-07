import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <section
        className="h-[50vh] bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
          <p className="mt-4 text-lg">
            We're here to help you. Reach out with your queries or hiring needs.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Get in Touch</h2>
            <ul className="space-y-5 text-gray-700 text-lg">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" /> +91 8157000553
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" /> hr@ozarx.in
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                1st Floor, Global Tech Park, Langford Road, Bengaluru, Karnataka
              </li>
            </ul>

            {/* Map Placeholder */}
            <div className="mt-10">
              <iframe
                title="Ozarx Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.271541516455!2d77.59709421530824!3d12.962157190859872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15dcd5df6ff1%3A0x9df2c34bdc098858!2sLangford%20Rd%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1653000000000!5m2!1sen!2sin"
                width="100%"
                height="220"
                className="rounded-xl border-0"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Send a Message</h2>
            <form className="space-y-5">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
