import RecentWork from '@/components/SpecialOffer';
import { Metadata } from 'next';
import { FiGlobe as Globe, FiAward as Award,FiCamera as Camera, FiPenTool as PenTool } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Recent Work | Architecture Studio',
  description: 'Explore our latest architectural projects and design innovations',
};

const mediaLogos = [
  { name: 'ArchDaily', icon: <Globe className="w-8 h-8" /> },
  { name: 'Dezeen', icon: <PenTool className="w-8 h-8" /> },
  { name: 'Architectural Digest', icon: <Camera className="w-8 h-8" /> },
  { name: 'Wallpaper*', icon: <Award className="w-8 h-8" /> },
];

const testimonials = [
  {
    quote: "Their design transformed our urban landscape completely.",
    author: "City Development Board",
    role: "Municipal Project"
  },
  {
    quote: "The most innovative use of space we've seen this decade.",
    author: "International Design Review",
    role: "Jury Commentary"
  }
];

export default function WorkPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-amber-100/20"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      <RecentWork />
      
      {/* Media Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-center mb-12">
            Featured In
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {mediaLogos.map((media, index) => (
              <div 
                key={media.name}
                className="flex flex-col items-center p-6 hover:bg-white hover:shadow-lg rounded-xl transition-all duration-300"
              >
                <div className="text-amber-500 mb-3">
                  {media.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{media.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-8xl text-gray-100 font-serif select-none">
              “
            </div>
            <div className="carousel carousel-center p-4 space-x-4 rounded-box">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="carousel-item w-full md:w-2/3 flex flex-col bg-gray-50 p-8 rounded-xl"
                >
                  <blockquote className="text-lg italic text-gray-700 mb-6">
                    {testimonial.quote}
                  </blockquote>
                  <div className="mt-auto">
                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-8xl text-gray-100 font-serif select-none">
              ”
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-light mb-6">Ready to start your project?</h3>
          <p className="mb-8 text-stone-300 max-w-2xl mx-auto">
            Our team is ready to transform your vision into exceptional architectural reality.
          </p>
          <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors duration-300 flex items-center mx-auto">
            Get in Touch
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
}