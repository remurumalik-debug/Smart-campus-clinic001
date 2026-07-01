import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="font-semibold text-dark">CampusClinic</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Smart campus clinic appointment booking and AI health assistant.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted hover:text-primary transition-colors">Home</Link>
              <Link href="/booking" className="block text-sm text-muted hover:text-primary transition-colors">Book Appointment</Link>
              <Link href="/chat" className="block text-sm text-muted hover:text-primary transition-colors">AI Chatbot</Link>
              <Link href="/admin/login" className="block text-sm text-muted hover:text-primary transition-colors">Admin Portal</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Clinic</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted">8:00 AM - 5:00 PM</p>
              <p className="text-sm text-muted">Mon - Fri</p>
              <p className="text-sm text-muted">Campus Health Center</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Contact</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted">clinic@campus.edu</p>
              <p className="text-sm text-muted">+234 800 000 0000</p>
              <p className="text-sm text-muted">Privacy Policy</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} CampusClinic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
