"use client"

export default function CompanyTieup() {
  const partners = [
    { name: "Ministry of Agriculture", logo: "🏛️", category: "Government" },
    { name: "NABARD", logo: "🏦", category: "Banking" },
    { name: "FCI", logo: "🌾", category: "Food Corp" },
    { name: "APMC", logo: "🏪", category: "Market" },
    { name: "Digital India", logo: "🇮🇳", category: "Initiative" },
    { name: "ICAR", logo: "🔬", category: "Research" },
    { name: "Startup India", logo: "🚀", category: "Startup" },
    { name: "Make in India", logo: "🏭", category: "Manufacturing" },
  ]

  const duplicatedPartners = [...partners, ...partners]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full opacity-50 animate-float blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full opacity-50 animate-float-delayed blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Trusted Partners
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-6 animate-fadeInUp">
            Our Partners & Integrations
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed animate-fadeInUp animation-delay-200">
            Working with leading government bodies, financial institutions, and technology partners to create a
            comprehensive agricultural ecosystem
          </p>
        </div>

        {/* Partners Grid - Fixed width and proper container */}
        <div className="max-w-6xl mx-auto relative overflow-hidden">
          <div className="flex animate-scroll space-x-3 md:space-x-6 py-4">
            {duplicatedPartners.map((partner, index) => (
              <div key={index} className="flex-shrink-0 group cursor-pointer w-48 md:w-64">
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-emerald-200 transform hover:scale-105 hover:-translate-y-2">
                  <div className="text-center">
                    <div className="text-3xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {partner.logo}
                    </div>
                    <h3 className="font-bold text-sm md:text-base text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 mb-2">
                      {partner.name}
                    </h3>
                    <span className="inline-block bg-emerald-100 text-emerald-700 px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                      {partner.category}
                    </span>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center group">
            <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              25+
            </div>
            <div className="text-gray-600 font-medium">Government Partners</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              15+
            </div>
            <div className="text-gray-600 font-medium">Banking Partners</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              50+
            </div>
            <div className="text-gray-600 font-medium">Tech Integrations</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              100%
            </div>
            <div className="text-gray-600 font-medium">Compliance Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
