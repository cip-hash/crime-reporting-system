import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white shadow-lg w-full sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="mr-2">🛡️</span>
            Crime Reporting System
          </h1>
          <div className="space-x-6">
          <Link to="/login" className="font-medium bg-white text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-lg transition duration-300">
              Login
            </Link>
            <Link to="/register" className="font-medium bg-white text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-lg transition duration-300">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
<div
  className="flex items-center justify-center relative w-screen bg-black" 
  style={{
    height: "75vh"
  }}
>
  {/* We can keep the gradient overlay for subtle depth or remove it */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60"></div>

  {/* Hero Content */}
  <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
      Report Crimes Anonymously
    </h1>
    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
      Help make your community safer by reporting crimes quickly and securely. Your vigilance can save lives.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        to="/report-crime"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg transition duration-300 transform hover:-translate-y-1 shadow-lg"
      >
        Report a Crime
      </Link>
      <Link
        to="/emergency"
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-lg transition duration-300 transform hover:-translate-y-1 shadow-lg"
      >
        Emergency SOS
      </Link>
    </div>
  </div>
</div>

      {/* Stats Section */}
      <section className="py-8 bg-white w-screen shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">95%</p>
              <p className="text-gray-600">Resolution Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">24/7</p>
              <p className="text-gray-600">Support Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">500+</p>
              <p className="text-gray-600">Crimes Reported</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">100%</p>
              <p className="text-gray-600">Anonymous</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50 w-screen">
        <div className="w-full max-w-7xl mx-auto px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-gray-800">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white shadow-lg rounded-xl p-8 transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Anonymous Reporting</h3>
              <p className="text-gray-600 leading-relaxed">Report crimes without revealing your identity. Your privacy is our top priority.</p>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-8 transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-Time Alerts</h3>
              <p className="text-gray-600 leading-relaxed">Get instant updates on your reports. Stay informed about the progress of your case.</p>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-8 transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Community Safety</h3>
              <p className="text-gray-600 leading-relaxed">Join hands to create a safer community. Together we can make a difference.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white w-screen">
        <div className="w-full max-w-7xl mx-auto px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-gray-600">Create an account or report anonymously</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Report</h3>
              <p className="text-gray-600">Submit crime details and evidence</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Track</h3>
              <p className="text-gray-600">Monitor the status of your report</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-xl font-semibold mb-2">Resolution</h3>
              <p className="text-gray-600">Receive updates on actions taken</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 w-screen text-white">
        <div className="w-full max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make Your Community Safer?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Join thousands of citizens who are making a difference through anonymous reporting.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report-crime"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg rounded-lg transition duration-300 font-semibold"
            >
              Report a Crime
            </Link>
            <Link
              to="/learn-more"
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-3 text-lg rounded-lg transition duration-300 font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 w-screen">
        <div className="w-full max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Crime Reporting System</h3>
              <p className="text-gray-400">Making communities safer through technology and citizen participation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/statistics" className="text-gray-400 hover:text-white">Crime Statistics</Link></li>
                <li><Link to="/safety-tips" className="text-gray-400 hover:text-white">Safety Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2025 Crime Reporting System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;