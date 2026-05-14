import { useState } from "react";
import { Link } from "react-router-dom";
import { Database, Users, Shield, Activity, ArrowRight, ChevronLeft, ChevronRight, X, Star, Zap, Lock, CheckCircle } from "lucide-react";
import { Nav } from "@/components/Nav";


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
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: "PBK Modelling",
      description: "Advanced Physiologically Based Kinetic (PBK) modelling for precision medicine and drug development.",
      highlight: true,
      expandedContent: {
        details: [
          "Comprehensive PBK model library for various compounds and populations",
          "SBML model import for reproducible, interoperable research",
          "Real-time simulation and visualisation of drug disposition",
          "Population variability and sensitivity analysis tools",
          "Regulatory-compliant reporting and documentation",
          "Support for paediatric, elderly, and special populations"
        ],
        benefits: "Accelerate drug development, reduce clinical trial costs, and enable personalised dosing strategies with scientifically rigorous PBK modelling.",
        useCases: "Drug-drug interaction predictions, special population dosing, formulation optimisation, and regulatory submissions.",
        technicalSpecs: "Validated models according to FDA and EMA guidelines, support for multiple compartments and transport mechanisms."
      }
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "GDPR Compliance & Privacy",
      description: "Advanced privacy protection with automated GDPR compliance scoring and data transformation capabilities.",
      demoLink: "/explore",
      expandedContent: {
        details: [
          "Automated P29 Score calculation for GDPR compliance assessment",
          "Intelligent identification and removal of direct identifiers",
          "Differential privacy algorithms for data anonymisation",
          "Audit trail and compliance documentation generation",
          "Data minimisation recommendations and implementation"
        ],
        benefits: "Ensure regulatory compliance while maintaining data utility for research. Reduce legal risks and streamline ethics approval processes.",
        useCases: "Clinical trial data management, multi-centre research collaborations, and sensitive health data processing.",
        technicalSpecs: "Compliant with GDPR Article 89, ISO 27001 certified infrastructure, and regular security audits."
      }
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "FAIR Data Management",
      description: "Complete data lifecycle management following Findable, Accessible, Interoperable, and Reusable principles.",
      expandedContent: {
        details: [
          "Built on Supabase with enterprise-grade scalability",
          "Advanced search with metadata indexing and faceted filtering",
          "Rich dataset preview with comprehensive metadata display",
          "Version control and provenance tracking for all datasets",
          "API-first architecture for seamless integration"
        ],
        benefits: "Maximise data discoverability and reuse potential. Enable seamless collaboration across research institutions and disciplines.",
        useCases: "Multi-omics data integration, longitudinal studies, and cross-disciplinary research projects.",
        technicalSpecs: "RESTful API, support for multiple data formats, automated metadata extraction, and DOI integration."
      }
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaborative Research Platform",
      description: "Unified workspace designed through extensive user research to support diverse research workflows and teams.",
      expandedContent: {
        details: [
          "Intuitive dashboard with customisable widgets and views",
          "Role-based access control with granular permissions",
          "Real-time collaboration tools and commenting system",
          "Integrated project management and task tracking",
          "Comprehensive user onboarding with interactive tutorials"
        ],
        benefits: "Streamline research workflows and enhance team productivity. Reduce training time with intuitive, familiar interfaces.",
        useCases: "Distributed research teams, multi-site clinical trials, and interdisciplinary collaborations.",
        technicalSpecs: "Responsive design, WCAG 2.1 AA accessibility compliance, and support for 10+ languages."
      }
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-24 px-4 min-h-[80vh] flex items-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 animate-fade-up px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-white">Advanced PBK Modelling Now Available</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            FAIRDatabase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            The complete research data management platform with integrated PBK modelling and GDPR compliance
          </p>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Make your research data Findable, Accessible, Interoperable, and Reusable while ensuring regulatory compliance
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold">
              <Star className="h-5 w-5" />
              PBK Modelling Included
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold">
              <Lock className="h-5 w-5" />
              GDPR Compliant
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">Platform Capabilities</h2>
            <p className="text-xl text-dark/70 max-w-3xl mx-auto">
              Comprehensive solutions for modern research data management, privacy protection, and pharmacokinetic modelling
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-2 border-2 ${
                  feature.highlight ? 'border-primary bg-gradient-to-br from-primary/5 to-white' : 'border-transparent'
                }`}
                onClick={() => setActiveFeature(feature)}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                      <Star className="h-3 w-3" />
                      FEATURED
                    </span>
                  </div>
                )}
                <div className="mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-bold text-dark mb-3 ${feature.highlight ? 'text-primary' : ''}`}>
                  {feature.title}
                </h3>
                <p className="text-dark/70 leading-relaxed">{feature.description}</p>
                {feature.highlight && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-sm text-primary font-semibold">Click to explore PBK capabilities →</p>
                  </div>
                )}
                {feature.demoLink && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <Link
                      to={feature.demoLink}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-primary font-semibold hover:underline"
                    >
                      Try the GDPR compliance demo →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Modal */}
      {activeFeature && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto p-4"
          onClick={() => setActiveFeature(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white p-8 rounded-t-2xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-lg">
                  {activeFeature.icon}
                </div>
                <h3 className="text-3xl font-bold">{activeFeature.title}</h3>
              </div>
              <p className="text-white/90 text-lg">{activeFeature.description}</p>
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Key Capabilities
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {activeFeature.expandedContent.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-dark/80">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Benefits
                  </h4>
                  <p className="text-dark/70 leading-relaxed">{activeFeature.expandedContent.benefits}</p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Use Cases
                  </h4>
                  <p className="text-dark/70 leading-relaxed">{activeFeature.expandedContent.useCases}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-bold text-dark mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Technical Specifications
                </h4>
                <p className="text-dark/70">{activeFeature.expandedContent.technicalSpecs}</p>
              </div>

              {activeFeature.highlight && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-6 w-6 text-primary" />
                    <h4 className="text-lg font-bold text-primary">Featured Capability</h4>
                  </div>
                  <p className="text-dark/80">
                    This feature represents a major advancement in our platform. Contact our team for a personalised demonstration
                    and to discuss how it can accelerate your research workflows.
                  </p>
                </div>
              )}

              {activeFeature.demoLink && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <h4 className="text-lg font-bold text-primary">Try the Live Demo</h4>
                  </div>
                  <p className="text-dark/80 mb-4">
                    Experience our GDPR compliance scoring system live — upload your own dataset, run it through the anonymisation pipeline, and see the P29 score improve in real time.
                  </p>
                  <Link
                    to={activeFeature.demoLink}
                    onClick={() => setActiveFeature(null)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Open GDPR Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screenshots Section */}
      <section id="screenshots" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">Platform Overview</h2>
            <p className="text-xl text-dark/70 max-w-3xl mx-auto">
              Experience the intuitive interface and powerful features of FAIRDatabase
            </p>
          </div>

          <div className="relative w-full h-[500px] md:h-[700px] lg:h-[800px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
            {screenshots.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 cursor-pointer transition-all duration-500 ${
                  activeImage === index ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src={src}
                  alt={`Platform Screenshot ${index + 1}`}
                  className="w-full h-full object-contain p-8"
                />
              </div>
            ))}

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-dark p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-dark p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-white/90 px-4 py-2 rounded-full">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeImage === index ? "bg-primary scale-125" : "bg-gray-400 hover:bg-gray-600"
                  }`}
                  aria-label={`Go to screenshot ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-dark/60 text-sm">
              Click on any screenshot to view full screen · Use arrows or dots to navigate
            </p>
          </div>
        </div>

        {/* Full Screen Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <button
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-20"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-8 w-8" />
              </button>

              <img
                src={screenshots[activeImage]}
                alt={`Platform Screenshot ${activeImage + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-colors z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      activeImage === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SEEDBiomed CTA */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Meet Our Expert Team</h2>
            <p className="text-dark/70 mb-8 max-w-2xl mx-auto text-lg">
              FAIRDatabase is built by the SEEDBiomed consortium — leading researchers and developers
              dedicated to advancing biomedical data science and regulatory compliance.
            </p>
            <a
              href="https://seedbiomed.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            >
              Meet the Team at SEEDBiomed
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">FAIRDatabase</h3>
              <p className="text-white/70 max-w-md">
                Advanced research data management platform with integrated PBK modelling and GDPR compliance tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#screenshots" className="hover:text-primary transition-colors">Screenshots</a></li>
                <li>PBK Modelling</li>
                <li>GDPR Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="https://seedbiomed.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Our Team</a></li>
                <li><a href="https://seedbiomed.com" target="_blank" className="hover:text-primary transition-colors">SEEDBiomed</a></li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} FAIRDatabase. All rights reserved. |
              Built with modern web technologies for research excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
