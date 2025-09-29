import { useState } from "react";
import { Database, Users, Globe, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Nav } from "@/components/Nav";
import { useIsMobile } from "@/hooks/use-mobile";


const Index = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  
  const screenshots = [
    "127.0.0.1_5000_dashboard(Desktop Screenshot).png",
    "127.0.0.1_5000_p29score(Desktop Screenshot) (1).png",
    "127.0.0.1_5000_upload(Desktop Screenshot).png",
    "search.png"
  ];

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % screenshots.length);
  };

  const previousImage = () => {
    setActiveImage((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const features = [
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "FAIR Data Storage",
      description: "Handling and storing of data according to FAIR principles.",
      expandedContent: {
        details: [
          "Built using Supabase",
          "Search functionality",
          "Dataset preview with metadata",
          "Upload and update datasets",
        ],

      }
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "User Optimized UI/UX",
      description: "A user interface developed in collaborating with all user types to ensure the best user experience.",
      expandedContent: {
        details: [
          "Frontend built using Bootstrap",
          "User-friendly design with a familiar color scheme",
          "Includes a dashboard for easy navigation",
          "Includes tooltips for new users",
          "Intiutive collapsible navigation bar",
        ],
        benefits: "Enable efficient teamwork across different locations while maintaining full control over access permissions. Track all changes and communications in one centralized platform.",
        useCases: "Ideal for multi-institution research projects, international collaborations, and team-based research initiatives.",
        technicalSpecs: "Supports unlimited team members with customizable roles and permissions. Includes audit trails and compliance tracking."
      }
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "GDPR Compliance",
      description: "A unique privacy processing module that rates the GDPR compliance of the data and is able to transform uncompliant data to compliant data.",
      expandedContent: {
        details: [
          "Upload a dataset to see its GDPR compliance score (P29 Score)",
          "Select to delete direct identifiers",
          "Select to delete missing value columns",
          "If the dataset is not GDPR compliant, the user can choose to transform it to a GDPR compliant dataset using differential privacy",
        ],
        benefits: "Access your research data securely from any location, with automatic synchronization and conflict resolution. Work seamlessly across different time zones and locations.",
        useCases: "Essential for international research teams, field researchers, and organizations with multiple global locations.",
        technicalSpecs: "99.9% uptime guarantee with global CDN distribution and automatic failover systems."
      }
    }
  ];


  const teamMembers = [
    {
      name: "Dr. Vivek Sheraton",
      role: "Project supervisor",
      image: "https://www.seedbiomed.com/images/Members/VivekSheratonM.JPG",
    },
    {
      name: "Matthias Louws BSc.",
      role: "Developer",
      image: "https://www.seedbiomed.com/images/Members/MatthiasLouws.jpg",
    },
    {
      name: "Zefan Zhu MSc.",
      role: "Data Scientist & GDPR Expert",
      image: "https://www.seedbiomed.com/images/Members/ZefanZhu.jpg",
    },
    {
      name: "Allan Duah MSc.",
      role: "AI Developer",
      image: "https://www.seedbiomed.com/images/Members/AllanDuah.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-24 px-4 min-h-[70vh] flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-dark/70" /> {/* Overlay for better text readability */}
        <div className="container mx-auto text-center relative z-10">
          <span className="inline-block animate-fade-up px-3 py-1 text-sm font-medium text-white/80 bg-primary/20 rounded-full mb-4">
            Coming soon
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            FAIRDatabase
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            FAIRDatabase helps to make research data Findable, Accessible, Interoperable, Reusable and GDPR compliant.   
          </p>
          <div className="flex justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {/* <a
              href="https://external-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#245961] text-white rounded-lg hover:bg-[#8C999B]/90 transition-colors"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </a> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-dark text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveFeature(feature)}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-dark mb-2">{feature.title}</h3>
                <p className="text-dark/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Modal */}
      {activeFeature && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center overflow-y-auto p-4"
          onClick={() => setActiveFeature(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {activeFeature.icon}
                <h3 className="text-2xl font-bold text-dark">{activeFeature.title}</h3>
              </div>
              <button 
                onClick={() => setActiveFeature(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-dark mb-2">Key Features</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {activeFeature.expandedContent.details.map((detail, index) => (
                    <li key={index} className="text-dark/80">{detail}</li>
                  ))}
                </ul>
              </div>

              {/* <div>
                <h4 className="text-lg font-semibold text-dark mb-2">Benefits</h4>
                <p className="text-dark/80">{activeFeature.expandedContent.benefits}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-dark mb-2">Use Cases</h4>
                <p className="text-dark/80">{activeFeature.expandedContent.useCases}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-dark mb-2">Technical Specifications</h4>
                <p className="text-dark/80">{activeFeature.expandedContent.technicalSpecs}</p>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Screenshots Section */}
      <section id="screenshots" className="py-24">
        <div className="max-w-[90%] lg:max-w-[2000px] mx-auto px-4">
          <h2 className="text-4xl font-bold text-dark text-center mb-16">Screenshots</h2>
          <div className="relative w-full h-[600px] md:h-[800px] lg:h-[1000px] rounded-xl overflow-hidden bg-gray-100">
            {screenshots.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 cursor-pointer transition-opacity duration-500 ${
                  activeImage === index ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-contain p-8" // Changed from object-cover to object-contain and added padding
                />
              </div>
            ))}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeImage === index ? "bg-primary" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-8 w-8" />
              </button>
              
              <img
                src={screenshots[activeImage]}
                alt={`Screenshot ${activeImage + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-dark text-center mb-16">Meet the Team:</h2>
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {teamMembers.map((member, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm"
        >
          <img
            src={member.image}
            alt={member.name}
            className="w-32 h-33 rounded-full object-cover mb-4"
          />
          <h3 className="text-xl font-semibold text-dark">{member.name}</h3>
          <p className="text-dark/80">{member.role}</p>
        </div>
      ))}
    </div>
    <div className="text-center mt-12">
      <p className="text-lg text-dark mb-4">Get to know us and the whole team on the SEEDBiomed website!</p>
      <a
        href="https://seedbiomed.com"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-[#1f5b5f] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition"
      >
        Learn More
      </a>
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="py-12 bg-dark">
        <div className="container mx-auto px-4 text-center text-white/80">
          <p>&copy; {new Date().getFullYear()} FAIRDatabase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
