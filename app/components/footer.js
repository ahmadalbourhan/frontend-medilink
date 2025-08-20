import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#9ebdb3] text-[#efefef] py-10 mt-10 rounded-b-3xl">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-8 rounded-b-3xl">
        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-[#efefef]">Contact Us</p>
          <p className="flex items-center gap-2 text-[#342520]">
            <FaEnvelope /> support@MediLink.gov.lb.com
          </p>
          <p className="flex items-center gap-2 text-[#342520]">
            <FaPhoneAlt /> +961 1 234 567
          </p>
        </div>

        <div className="flex gap-4 items-center md:justify-end">
          <a
            href="#"
            className="bg-[#00368c] hover:bg-[#4b7bc6] p-3 rounded-full text-white transition-colors text-lg flex items-center justify-center"
          >
            <FaFacebookF />
          </a>
          <a
            href="#"
            className="bg-[#00368c] hover:bg-[#4b7bc6] p-3 rounded-full text-white transition-colors text-lg flex items-center justify-center"
          >
            <FaTwitter />
          </a>
          <a
            href="#"
            className="bg-[#00368c] hover:bg-[#4b7bc6] p-3 rounded-full text-white transition-colors text-lg flex items-center justify-center"
          >
            <FaInstagram />
          </a>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-8 border-t border-[#4b7bc6]/50 pt-4 text-center text-sm text-[#efefef]">
        &copy; {new Date().getFullYear()} MediRecords. All rights reserved.
      </div>
    </footer>
  );
}
