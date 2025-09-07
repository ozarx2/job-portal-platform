import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Ozarx HR Solutions</h3>
          <p>
            Connecting talent with opportunity across India and abroad. We are dedicated to quality hiring and career development.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
          <ul className="space-y-2">
            <li><a href="#services" className="hover:text-white transition">Job Placement</a></li>
            <li><a href="#services" className="hover:text-white transition">Recruitment</a></li>
            <li><a href="#services" className="hover:text-white transition">Training</a></li>
            <li><a href="#services" className="hover:text-white transition">Resume Building</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              1st Floor, Global Tech Park, Langford Road, Bengaluru
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              +91 8157000553
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              hr@ozarx.in
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook className="w-5 h-5 hover:text-white transition" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter className="w-5 h-5 hover:text-white transition" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <Linkedin className="w-5 h-5 hover:text-white transition" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram className="w-5 h-5 hover:text-white transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ozarx HR Solutions. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
