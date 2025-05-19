import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { SkipLink, AccessibleModal, VisuallyHidden, AccessibleButton } from '../components/Accessibility';
import { initPerformanceOptimizations, prefersReducedMotion } from '../utils/performance';

export const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
    // Refs for scroll animations
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const testimonialRef = useRef(null);
  const demoRef = useRef(null);
  
  // Handle toggle menu for mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
    
    // Simulate loading content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll position for animations
  useEffect(() => {
    const handleScroll = useCallback(() => {
      setScrollPosition(window.scrollY);
      
      // Reveal animations on scroll
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    }, []);
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 300);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle feature hover
  const handleFeatureHover = (index) => {
    setActiveFeature(index);
  };
  
  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Simulating form submission
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };
    // Handle opening modal with content
  const openModal = (title, content) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
    
    // Ensure focus is returned to the element that opened the modal when it's closed
    setLastFocusedElement(document.activeElement);
  };
  
  // Store reference to the element that was focused before modal opened
  const [lastFocusedElement, setLastFocusedElement] = useState(null);
  
  // Handle closing modal and return focus
  const closeModal = () => {
    setIsModalOpen(false);
    
    // Return focus to the element that opened the modal
    if (lastFocusedElement) {
      setTimeout(() => {
        lastFocusedElement.focus();
      }, 0);
    }
  };
  return (
    <div className="min-h-screen mx-auto flex flex-col bg-[#1B263B] text-[#F0F3BD]">
      {/* Skip to content link for keyboard users */}
      <SkipLink />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#1B263B] flex items-center justify-center animate-fadeIn" role="status" aria-live="polite">
          <div className="text-center">
            <div className="inline-block w-16 h-16 relative">
              <span className="absolute inset-0 rounded-full border-4 border-t-[#1A936F] border-r-[#1A936F]/30 border-b-[#1A936F]/10 border-l-[#1A936F]/50 animate-rotateGlobe"></span>
              <span className="absolute inset-2 rounded-full border-2 border-t-[#F4D35E]/80 border-r-transparent border-b-transparent border-l-[#F4D35E]/40 animate-rotateGlobe" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></span>
            </div>
            <p className="mt-4 text-[#F0F3BD] font-medium">Loading Map Store</p>
            <div className="mt-2 w-32 h-1 bg-[#1A936F]/20 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#1A936F] animate-shimmer rounded-full"></div>
            </div>
          </div>
        </div>
      )}{/* Header/NavBar */}      
      <header className={`bg-[#1B263B]/${scrollPosition > 50 ? '95' : '80'} backdrop-blur-sm fixed w-full z-50 px-6 py-4 flex justify-between items-center border-b border-[#1A936F]/${scrollPosition > 50 ? '30' : '20'} transition-all duration-300`} role="banner">
        <div className="flex items-center">
          <a href="/" className="flex items-center group focus-visible" aria-label="MapStore Home">
            <span className={`material-symbols-outlined text-[#1A936F] text-4xl mr-2 group-hover:animate-pulse transition-all ${!reducedMotion ? 'animate-rotateGlobe' : ''}`} style={{ animationDuration: "15s" }} aria-hidden="true">public</span>
            <span className="text-xl font-bold tracking-wide text-[#F0F3BD] group-hover:text-[#F4D35E] transition-colors">Map Store</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <a 
            href="/" 
            className={`text-[#F0F3BD] hover:text-[#F4D35E] transition-colors flex items-center overflow-hidden group ${scrollPosition < 100 ? 'border-b-2 border-[#1A936F]' : ''} focus-visible`}
            aria-current="page"
          >
            <span className="material-symbols-outlined mr-1 text-sm align-middle group-hover:animate-pulse" aria-hidden="true">home</span>
            <span className="relative">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
            </span>
          </a>
          <a 
            href="#about" 
            onClick={(e) => {
              e.preventDefault();
              aboutRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            }}
            className={`text-[#F0F3BD] hover:text-[#F4D35E] transition-colors flex items-center overflow-hidden group focus-visible`}
          >
            <span className="material-symbols-outlined mr-1 text-sm group-hover:animate-pulse" aria-hidden="true">info</span>
            <span className="relative">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
            </span>
          </a>
          <a 
            href="#features" 
            onClick={(e) => {
              e.preventDefault();
              featuresRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            }}
            className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors flex items-center overflow-hidden group focus-visible"
          >
            <span className="material-symbols-outlined mr-1 text-sm group-hover:animate-pulse" aria-hidden="true">category</span>
            <span className="relative">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
            </span>
          </a>
          <a 
            href="#testimonials" 
            onClick={(e) => {
              e.preventDefault();
              testimonialRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            }}
            className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors flex items-center overflow-hidden group focus-visible"
          >
            <span className="material-symbols-outlined mr-1 text-sm group-hover:animate-pulse" aria-hidden="true">forum</span>
            <span className="relative">
              Testimonials
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
            </span>
          </a>
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              contactRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            }}
            className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors flex items-center overflow-hidden group focus-visible"
          >
            <span className="material-symbols-outlined mr-1 text-sm group-hover:animate-pulse" aria-hidden="true">contact_page</span>
            <span className="relative">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
            </span>
          </a>
          <a 
            href="/dashboard" 
            className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-4 py-2 rounded-md transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#1A936F]/20 flex items-center focus-visible"
          >
            <span className={`material-symbols-outlined mr-1 ${!reducedMotion ? 'animate-pulse' : ''}`} style={{ animationDuration: "3s" }} aria-hidden="true">dashboard</span>
            Dashboard
          </a>
        </nav>        {/* Mobile menu button */}
        <AccessibleButton
          onClick={toggleMenu}
          ariaLabel={isMenuOpen ? "Close menu" : "Open menu"}
          ariaExpanded={isMenuOpen}
          ariaControls="mobile-menu"
          className="md:hidden text-[#F0F3BD] focus:outline-none bg-[#1A936F]/10 p-2 rounded-md hover:bg-[#1A936F]/20 transition-all focus-visible"
        >
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </AccessibleButton>
      </header>      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="fixed inset-0 z-40 bg-[#1B263B]/95 backdrop-blur-md pt-20 px-6 md:hidden animate-fadeIn"
          role="navigation" 
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col space-y-6 text-lg">
            <a 
              href="/" 
              className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors py-2 border-b border-[#1A936F]/20 flex items-center focus-visible"
              onClick={toggleMenu}
              aria-current="page"
            >
              <span className="material-symbols-outlined mr-3 animate-pulse" style={{ animationDuration: "2s" }} aria-hidden="true">home</span>
              <span className="relative">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a 
              href="#about" 
              className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors py-2 border-b border-[#1A936F]/20 flex items-center focus-visible" 
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                aboutRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              <span className="material-symbols-outlined mr-3 animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.1s" }} aria-hidden="true">info</span>
              <span className="relative">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a 
              href="#features" 
              className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors py-2 border-b border-[#1A936F]/20 flex items-center focus-visible" 
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                featuresRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              <span className="material-symbols-outlined mr-3 animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.2s" }} aria-hidden="true">category</span>
              <span className="relative">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a 
              href="#testimonials" 
              className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors py-2 border-b border-[#1A936F]/20 flex items-center focus-visible" 
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                testimonialRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              <span className="material-symbols-outlined mr-3 animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.3s" }} aria-hidden="true">forum</span>
              <span className="relative">
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a 
              href="#contact" 
              className="text-[#F0F3BD] hover:text-[#F4D35E] transition-colors py-2 border-b border-[#1A936F]/20 flex items-center focus-visible" 
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                contactRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              <span className="material-symbols-outlined mr-3 animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.4s" }} aria-hidden="true">contact_page</span>
              <span className="relative">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1A936F] group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a 
              href="/dashboard" 
              className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-4 py-3 rounded-md transition-all transform hover:scale-105 text-center flex items-center justify-center hover:shadow-lg hover:shadow-[#1A936F]/20 focus-visible btn-mobile-sm"
              onClick={toggleMenu}
            >
              <span className="material-symbols-outlined mr-2 animate-pulse" style={{ animationDuration: "3s" }} aria-hidden="true">dashboard</span>
              Dashboard
            </a>
          </nav>
          
          {/* Quick social links in mobile menu */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-4">
            <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover:shadow-lg hover:shadow-[#1A936F]/20 hover-scale focus-visible" aria-label="Globe">
              <span className="material-symbols-outlined text-[#1A936F]" aria-hidden="true">language</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover:shadow-lg hover:shadow-[#1A936F]/20 hover-scale focus-visible" aria-label="Twitter">
              <span className="material-symbols-outlined text-[#1A936F]" aria-hidden="true">flutter_dash</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover:shadow-lg hover:shadow-[#1A936F]/20 hover-scale focus-visible" aria-label="Github">
              <span className="material-symbols-outlined text-[#1A936F]" aria-hidden="true">code</span>
            </a>
          </div>
        </div>
      )}      <main id="main" className="flex-grow" tabIndex="-1">        
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center px-6 pt-16" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-[url('/earth-grid.svg')] bg-cover bg-center opacity-20" aria-hidden="true"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B263B]/50 to-[#1B263B]" aria-hidden="true"></div>
          
          {/* Animated background elements - only show if no preference for reduced motion */}
          {!reducedMotion && (
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#1A936F]/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-[#F4D35E]/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute bottom-1/4 left-2/3 w-48 h-48 bg-[#1A936F]/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
            </div>
          )}
          
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 animate-fadeIn" style={{ animationDuration: "1s" }}>
              <span className="bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30">
                Geospatial AI Platform
              </span>
            </div>
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold leading-tight text-[#F0F3BD] mb-6 animate-slideInUp" style={{ animationDuration: "1.2s" }}>
              Geospatial Intelligence <span className="text-[#1A936F]">Powered by AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#F0F3BD]/80 mb-10 max-w-3xl mx-auto animate-slideInUp" style={{ animationDuration: "1.4s", animationDelay: "0.2s" }}>
              Unlock the potential of geospatial data with our advanced mapping and analysis tools. Transform complex geographic information into actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slideInUp" style={{ animationDuration: "1.6s", animationDelay: "0.4s" }}>
              <a 
                href="/dashboard" 
                className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-8 py-4 rounded-md text-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#1A936F]/20 flex items-center justify-center focus-visible btn-mobile-sm"
                aria-label="Get started with Map Store dashboard"
              >
                <span className="material-symbols-outlined mr-2" aria-hidden="true">rocket_launch</span>
                Get Started
              </a>
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  featuresRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
                }}
                className="border border-[#F4D35E] text-[#F4D35E] hover:bg-[#F4D35E]/10 px-8 py-4 rounded-md text-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center focus-visible btn-mobile-sm"
                aria-label="Learn more about Map Store features"
              >
                <span className="material-symbols-outlined mr-2" aria-hidden="true">explore</span>
                Learn More
              </a>
            </div>
              {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fadeIn" style={{ animationDuration: "2s", animationDelay: "0.8s" }}>
              <div className="bg-[#1B263B]/50 backdrop-blur-sm p-3 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all hover-scale">
                <span className="material-symbols-outlined text-[#F4D35E] text-2xl" aria-hidden="true">map</span>
                <p className="text-sm mt-1 text-[#F0F3BD]/80">Interactive Maps</p>
              </div>
              <div className="bg-[#1B263B]/50 backdrop-blur-sm p-3 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all hover-scale" style={{ transitionDelay: "0.1s" }}>
                <span className="material-symbols-outlined text-[#F4D35E] text-2xl" aria-hidden="true">bar_chart</span>
                <p className="text-sm mt-1 text-[#F0F3BD]/80">Data Visualization</p>
              </div>
              <div className="bg-[#1B263B]/50 backdrop-blur-sm p-3 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all hover-scale" style={{ transitionDelay: "0.2s" }}>
                <span className="material-symbols-outlined text-[#F4D35E] text-2xl" aria-hidden="true">smart_toy</span>
                <p className="text-sm mt-1 text-[#F0F3BD]/80">AI Analysis</p>
              </div>
              <div className="bg-[#1B263B]/50 backdrop-blur-sm p-3 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all hover-scale" style={{ transitionDelay: "0.3s" }}>
                <span className="material-symbols-outlined text-[#F4D35E] text-2xl" aria-hidden="true">cloud</span>
                <p className="text-sm mt-1 text-[#F0F3BD]/80">Cloud Processing</p>
              </div>
            </div>
          </div>

          {/* Floating graphics */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center items-center">
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault();
                aboutRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
              className={`${!reducedMotion ? 'animate-bounce' : ''} hover:text-[#F4D35E] transition-colors p-2 focus-visible`}
              aria-label="Scroll to About section"
            >
              <span className="material-symbols-outlined text-[#F4D35E] text-3xl" aria-hidden="true">keyboard_double_arrow_down</span>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section id="about" ref={aboutRef} className="py-20 px-6 bg-[#1B263B]/70">
          <div className="max-w-5xl mx-auto">            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30 mb-4">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-4">About Map Store</h2>
              <div className="w-20 h-1 bg-[#1A936F] mx-auto"></div>
            </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 reveal" style={{ transitionDelay: "0.1s" }}>
                <h3 className="text-2xl font-bold text-[#F4D35E] mb-4">Our Mission</h3>
                <p className="text-[#F0F3BD]/90 mb-6 leading-relaxed">
                   Map Store is a domain-specific model designed to revolutionize how we interact with geospatial data. Our mission is to democratize access to earth observation insights, enabling researchers, businesses, and governments to make data-driven decisions about Pakistan.
                </p>
                <p className="text-[#F0F3BD]/90 mb-6 leading-relaxed">
                  By combining advanced large language models with specialized geospatial processing capabilities, we're creating a new paradigm for geographic information analysis that's both powerful and accessible.
                </p>
                
                {/* Key stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#1B263B]/70 rounded-lg p-3 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all text-center">
                    <div className="text-[#F4D35E] text-2xl font-bold">99.8%</div>
                    <div className="text-sm text-[#F0F3BD]/70">Accuracy</div>
                  </div>
                  <div className="bg-[#1B263B]/70 rounded-lg p-3 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all text-center">
                    <div className="text-[#F4D35E] text-2xl font-bold">50+</div>
                    <div className="text-sm text-[#F0F3BD]/70">Countries</div>
                  </div>
                  <div className="bg-[#1B263B]/70 rounded-lg p-3 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all text-center">
                    <div className="text-[#F4D35E] text-2xl font-bold">5TB+</div>
                    <div className="text-sm text-[#F0F3BD]/70">Data Processed</div>
                  </div>
                </div>
                
                <a 
                  href="#features" 
                  onClick={(e) => {
                    e.preventDefault();
                    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center text-[#1A936F] hover:text-[#1A936F]/80 font-medium group"
                >
                  <span>Discover our capabilities</span>
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
                <div className="order-1 md:order-2 reveal" style={{ transitionDelay: "0.3s" }}>
                <div className="bg-[#1A936F]/10 rounded-xl p-6 border border-[#1A936F]/20 hover:shadow-lg hover:shadow-[#1A936F]/10 transition-all">
                  <div className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => openModal("Interactive Globe", "Our interactive globe visualization allows you to explore geospatial data from around the world with detailed analytics and insights.")}>
                    <div className="absolute inset-0 bg-[url('/globe-visualization.svg')] bg-contain bg-center bg-no-repeat opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Interactive points */}
                    <div className="absolute left-[30%] top-[25%] w-3 h-3 bg-[#F4D35E] rounded-full animate-ping" style={{ animationDuration: "3s" }}></div>
                    <div className="absolute right-[40%] bottom-[35%] w-3 h-3 bg-[#F4D35E] rounded-full animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }}></div>
                    
                    {/* Click to interact overlay */}
                    <div className="absolute inset-0 bg-[#1B263B]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-[#F0F3BD] bg-[#1B263B]/80 px-4 py-2 rounded-lg border border-[#1A936F]/40 flex items-center">
                        <span className="material-symbols-outlined mr-2">touch_app</span>
                        Click to explore
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <button 
                      className="text-[#F0F3BD]/70 hover:text-[#F4D35E] text-sm flex items-center"
                      onClick={() => openModal("Live Earth Data", "Access real-time data from multiple satellite sources showing climate patterns, land use, and geographic features.")}
                    >
                      <span className="material-symbols-outlined mr-1 text-sm">info</span>
                      More info
                    </button>
                    
                    <button 
                      className="text-[#1A936F] hover:text-[#1A936F]/80 text-sm flex items-center"
                      onClick={() => window.location.href = "/dashboard"}
                    >
                      <span className="material-symbols-outlined mr-1 text-sm">open_in_new</span>
                      Try the demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-20 px-6 bg-[#1B263B]">
          <div className="max-w-6xl mx-auto">            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30 mb-4">
                Capabilities
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-4">Key Features</h2>
              <p className="text-xl text-[#F0F3BD]/80 max-w-3xl mx-auto">
                Powerful tools for geospatial analysis and visualization
              </p>
              <div className="w-20 h-1 bg-[#1A936F] mx-auto mt-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 0 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 0 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(0)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("Interactive Mapping", "Our cutting-edge mapping technology allows users to navigate and interact with geographic data in real-time. Features include multi-layer visualization, custom map styling, and responsive controls for zooming, panning, and selecting regions of interest.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6 group-hover:animate-pulse">
                  <span className="material-symbols-outlined text-[#1A936F] text-3xl">map</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">Interactive Mapping</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Explore geospatial data through intuitive, interactive maps with customizable layers and real-time updates.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 1 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 1 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(1)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("AI-Powered Analysis", "Our advanced AI models are specifically trained on geospatial data patterns. They can identify land use changes, predict weather impacts, detect anomalies in terrain data, and extract meaningful insights from satellite imagery through deep learning techniques.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1A936F] text-3xl">smart_toy</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">AI-Powered Analysis</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Leverage our domain-specific language model to analyze and interpret complex geospatial patterns.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 2 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 2 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(2)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("Data Visualization", "Create compelling visual representations of geographic data with our advanced charting and visualization tools. Generate heatmaps, chloropleth maps, 3D terrain models, and time-series animations that communicate complex information clearly.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1A936F] text-3xl">insights</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">Data Visualization</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Transform raw geographic data into beautiful, informative visualizations that reveal hidden insights.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 2 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
              
              {/* Feature 4 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 3 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 3 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(3)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("Vector & Raster Support", "Our platform supports all major geospatial data formats, allowing you to work seamlessly with both vector data (points, lines, polygons) and raster data (satellite imagery, DEMs, climate models) in the same environment.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1A936F] text-3xl">data_object</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">Vector & Raster Support</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Process both vector and raster data types with specialized tools optimized for each format.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 3 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
              
              {/* Feature 5 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 4 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 4 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(4)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("Natural Language Interface", "Interact with maps and spatial data using simple English commands. Ask questions like 'Show me temperature anomalies in South Asia' or 'Calculate the vegetation index change in this region over the last 5 years' and get immediate visual responses.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#F4D35E] text-3xl">chat</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">Natural Language Interface</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Interact with geospatial data using plain language queries and get intelligent, context-aware responses.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 4 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
              
              {/* Feature 6 */}
              <div 
                className={`bg-[#1A936F]/${activeFeature === 5 ? '15' : '5'} rounded-xl p-6 border border-[#1A936F]/${activeFeature === 5 ? '40' : '20'} hover:bg-[#1A936F]/10 transition-all transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => handleFeatureHover(5)}
                onMouseLeave={() => handleFeatureHover(null)}
                onClick={() => openModal("API Integration", "Integrate Map Store capabilities into your own applications with our comprehensive API. Access all platform features programmatically, including data processing, AI analysis, and visualization tools. Full documentation and client libraries are available for Python, JavaScript, and R.")}
              >
                <div className="rounded-full bg-[#1A936F]/20 w-14 h-14 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#F4D35E] text-3xl">api</span>
                </div>
                <h3 className="text-xl font-bold text-[#F4D35E] mb-3">API Integration</h3>
                <p className="text-[#F0F3BD]/90 leading-relaxed">
                  Connect with our robust API to incorporate Map Store capabilities into your own applications and workflows.
                </p>
                <div className={`mt-4 flex items-center text-[#1A936F] ${activeFeature === 5 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  <span className="text-sm">Learn more</span>
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-[#1B263B]/70">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30 mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-4">What Our Users Say</h2>
              <p className="text-xl text-[#F0F3BD]/80 max-w-3xl mx-auto">
                Discover how organizations are using Map Store to transform their geospatial workflows
              </p>
              <div className="w-20 h-1 bg-[#1A936F] mx-auto mt-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}              <div className="bg-[#1B263B] rounded-xl p-6 border border-[#1A936F]/20 shadow-lg hover:shadow-xl hover:border-[#1A936F]/30 transition-all transform hover:-translate-y-1 reveal" style={{ transitionDelay: "0.1s" }}>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#1A936F]/20 flex items-center justify-center mr-4 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Sarah Johnson" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F0F3BD] text-lg">Sarah Johnson</h4>
                    <p className="text-sm text-[#F0F3BD]/70">Environmental Scientist</p>
                    <p className="text-xs text-[#1A936F]">Climate Research Institute</p>
                  </div>
                </div>
                <div className="relative mb-6">
                  <span className="absolute -top-3 -left-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                  <p className="text-[#F0F3BD]/90 italic relative z-10">
                    Map Store has completely transformed our climate research. The ability to analyze satellite imagery with natural language queries saves us countless hours of manual processing.
                  </p>
                  <span className="absolute -bottom-6 -right-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex text-[#F4D35E]">
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                  </div>
                  <button 
                    className="text-[#1A936F] hover:text-[#1A936F]/80 text-sm flex items-center"
                    onClick={() => openModal("Climate Research Case Study", "The Climate Research Institute uses Map Store to analyze vast amounts of satellite data to track climate change impacts across different regions. By using natural language queries like 'Show me areas with significant vegetation loss in the Amazon over the past 5 years,' researchers can quickly identify critical areas for further study. This has reduced their data processing time by 78% and allowed them to analyze 3x more data than they could with their previous tools.")}
                  >
                    <span className="text-sm">Read case study</span>
                    <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
              
              {/* Testimonial 2 */}              <div className="bg-[#1B263B] rounded-xl p-6 border border-[#1A936F]/20 shadow-lg hover:shadow-xl hover:border-[#1A936F]/30 transition-all transform hover:-translate-y-1 reveal" style={{ transitionDelay: "0.2s" }}>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#1A936F]/20 flex items-center justify-center mr-4 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/men/33.jpg" 
                      alt="Michael Rodriguez" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F0F3BD] text-lg">Michael Rodriguez</h4>
                    <p className="text-sm text-[#F0F3BD]/70">Urban Planner</p>
                    <p className="text-xs text-[#1A936F]">Metro City Development</p>
                  </div>
                </div>
                <div className="relative mb-6">
                  <span className="absolute -top-3 -left-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                  <p className="text-[#F0F3BD]/90 italic relative z-10">
                    The visualization capabilities in Map Store help us communicate complex spatial patterns to stakeholders. It's become an essential tool in our urban development projects.
                  </p>
                  <span className="absolute -bottom-6 -right-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex text-[#F4D35E]">
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star_half</span>
                  </div>
                  <button 
                    className="text-[#1A936F] hover:text-[#1A936F]/80 text-sm flex items-center"
                    onClick={() => openModal("Urban Planning Success Story", "Metro City Development employed Map Store to visualize population density, traffic patterns, and public transit usage for a major urban renewal project. The interactive 3D models and time-series visualizations helped them present complex data to community stakeholders in an accessible format. This improved community buy-in and allowed planners to better respond to public concerns by quickly creating 'what-if' scenarios during public meetings.")}
                  >
                    <span className="text-sm">Read case study</span>
                    <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
              
              {/* Testimonial 3 */}              <div className="bg-[#1B263B] rounded-xl p-6 border border-[#1A936F]/20 shadow-lg hover:shadow-xl hover:border-[#1A936F]/30 transition-all transform hover:-translate-y-1 reveal" style={{ transitionDelay: "0.3s" }}>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#1A936F]/20 flex items-center justify-center mr-4 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/women/67.jpg" 
                      alt="Aisha Patel" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F0F3BD] text-lg">Aisha Patel</h4>
                    <p className="text-sm text-[#F0F3BD]/70">GIS Analyst</p>
                    <p className="text-xs text-[#1A936F]">Global Resource Mapping</p>
                  </div>
                </div>
                <div className="relative mb-6">
                  <span className="absolute -top-3 -left-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                  <p className="text-[#F0F3BD]/90 italic relative z-10">
                    As someone who works with spatial data daily, I appreciate how Map Store combines traditional GIS capabilities with cutting-edge AI. It's genuinely impressive technology.
                  </p>
                  <span className="absolute -bottom-6 -right-2 text-[#1A936F]/20 text-5xl font-serif">"</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex text-[#F4D35E]">
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                    <span className="material-symbols-outlined">star</span>
                  </div>
                  <button 
                    className="text-[#1A936F] hover:text-[#1A936F]/80 text-sm flex items-center"
                    onClick={() => openModal("GIS Integration Case Study", "Global Resource Mapping integrate Map Store with their existing GIS infrastructure to enhance their natural resources mapping capabilities. By connecting the API to their custom workflows, they were able to automate the identification of land use changes and potential resource development areas. This reduced the time to generate comprehensive resource maps from weeks to days, giving them a significant advantage when bidding on international projects.")}
                  >
                    <span className="text-sm">Read case study</span>
                    <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <button 
                className="inline-flex items-center text-[#1A936F] hover:text-[#1A936F]/80 font-medium group"
                onClick={() => openModal("Customer Success Stories", "Map Store is trusted by organizations across various industries including environmental research, urban planning, agriculture, disaster response, and resource management. Our platform helps users process geospatial data more efficiently, extract meaningful insights through AI, and communicate findings through powerful visualizations.")}
              >
                <span>View all success stories</span>
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Demo/Showcase Section */}        <section className="py-20 px-6 bg-gradient-to-b from-[#1B263B] to-[#1B263B]/90">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30 mb-4">
                Live Demo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-4">See Map Store in Action</h2>
              <p className="text-xl text-[#F0F3BD]/80 max-w-3xl mx-auto">
                Explore our interactive demo to experience the power of Map Store
              </p>
              <div className="w-20 h-1 bg-[#1A936F] mx-auto mt-6"></div>
            </div>
            
            <div className="bg-[#1B263B] rounded-xl border border-[#1A936F]/30 shadow-xl overflow-hidden reveal hover-glow" style={{ transitionDelay: "0.2s" }}>
              <div className="relative aspect-video">                {/* Map Preview Frame */}
                <div className="absolute inset-0 bg-[#1E293B] flex items-center justify-center">
                  <div className="w-full h-full relative bg-[url('/earth-grid.svg')] bg-cover">
                    {/* Simulated Map UI */}
                    <div className="absolute top-0 left-0 right-0 bg-[#1A936F]/90 p-4 flex items-center justify-between z-10">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-[#F0F3BD] mr-2 animate-rotateGlobe" style={{ animationDuration: "15s" }}>public</span>
                        <span className="text-[#F0F3BD] font-medium">Map Store Explorer</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale" aria-label="Zoom in">
                          <span className="material-symbols-outlined text-[#F0F3BD] text-sm">add</span>
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale" aria-label="Zoom out">
                          <span className="material-symbols-outlined text-[#F0F3BD] text-sm">remove</span>
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale" aria-label="Layers">
                          <span className="material-symbols-outlined text-[#F0F3BD] text-sm">layers</span>
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale" aria-label="Share">
                          <span className="material-symbols-outlined text-[#F0F3BD] text-sm">share</span>
                        </button>
                      </div>
                    </div>
                      
                    {/* Interactive map elements */}
                    <div className="absolute inset-0 z-0">
                      {/* Map visualization elements - animated data points */}
                      <div className="absolute left-[20%] top-[30%] w-3 h-3 bg-[#F4D35E] rounded-full animate-ping cursor-pointer" style={{ animationDuration: "2s" }}></div>
                      <div className="absolute left-[30%] top-[60%] w-2 h-2 bg-[#1A936F] rounded-full animate-ping cursor-pointer" style={{ animationDuration: "3s" }}></div>
                      <div className="absolute left-[50%] top-[40%] w-4 h-4 bg-[#F4D35E]/80 rounded-full animate-ping cursor-pointer" style={{ animationDuration: "4s" }}></div>
                      <div className="absolute left-[70%] top-[25%] w-3 h-3 bg-[#1A936F]/80 rounded-full animate-ping cursor-pointer" style={{ animationDuration: "2.5s" }}></div>
                      <div className="absolute left-[80%] top-[70%] w-2 h-2 bg-[#F4D35E]/80 rounded-full animate-ping cursor-pointer" style={{ animationDuration: "3.5s" }}></div>
                      
                      {/* Tooltip for data point (shown on hover in real app) */}
                      <div className="absolute left-[50%] top-[39%] transform -translate-x-1/2 -translate-y-full bg-[#1B263B]/90 border border-[#1A936F]/40 p-2 rounded shadow-lg text-xs text-[#F0F3BD] w-32 z-10">
                        <div className="font-bold text-[#F4D35E] mb-1">Amazon Rainforest</div>
                        <div className="text-[#F0F3BD]/80 text-xs">Deforestation Rate: +2.7%</div>
                        <div className="text-[#F0F3BD]/80 text-xs">Alert Level: High</div>
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1B263B] border-r border-b border-[#1A936F]/40"></div>
                      </div>
                      
                      {/* Simulated data areas */}
                      <div className="absolute left-[40%] top-[35%] w-[15%] h-[10%] bg-[#F4D35E]/20 rounded-lg border border-[#F4D35E]/40 animate-pulse cursor-pointer" data-region="South America"></div>
                      <div className="absolute left-[65%] top-[55%] w-[20%] h-[15%] bg-[#1A936F]/20 rounded-lg border border-[#1A936F]/40 animate-pulse cursor-pointer" style={{ animationDelay: "1s" }} data-region="Africa"></div>
                      
                      {/* Simulated continent labels */}
                      <div className="absolute left-[45%] top-[33%] text-[#F4D35E] text-xs font-bold">South America</div>
                      <div className="absolute left-[70%] top-[53%] text-[#1A936F] text-xs font-bold">Africa</div>
                      
                      {/* Simulated data visualization legend */}
                      <div className="absolute bottom-4 left-4 bg-[#1B263B]/80 p-2 rounded border border-[#1A936F]/20 text-xs">
                        <div className="text-[#F0F3BD] font-bold mb-1">Vegetation Density</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-12 h-2 bg-gradient-to-r from-[#FF5555] via-[#F4D35E] to-[#1A936F]"></div>
                          <div className="flex justify-between w-full">
                            <span className="text-[#F0F3BD]/70">Low</span>
                            <span className="text-[#F0F3BD]/70">High</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Simulated sidebar */}
                    <div className="absolute top-[4rem] bottom-0 right-0 w-[250px] bg-[#1B263B]/90 border-l border-[#1A936F]/20 p-4 z-20">
                      <div className="mb-4">
                        <h4 className="text-[#F0F3BD] font-medium mb-2">Data Layers</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="layer-temp" className="mr-2" checked aria-label="Temperature layer" />
                            <label htmlFor="layer-temp" className="text-[#F0F3BD]/80 text-sm cursor-pointer">Temperature</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="layer-veg" className="mr-2" checked aria-label="Vegetation layer" />
                            <label htmlFor="layer-veg" className="text-[#F0F3BD]/80 text-sm cursor-pointer">Vegetation</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="layer-pop" className="mr-2" aria-label="Population layer" />
                            <label htmlFor="layer-pop" className="text-[#F0F3BD]/80 text-sm cursor-pointer">Population</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-[#F0F3BD] font-medium mb-2">Analysis</h4>
                        <div className="bg-[#1B263B] border border-[#1A936F]/30 rounded-md p-2 mb-3">
                          <div className="text-[#F0F3BD]/80 text-sm mb-1">Ask Map Store</div>
                          <div className="flex">
                            <input 
                              type="text" 
                              placeholder="Type a query..." 
                              className="flex-grow bg-[#1E293B] border border-[#1A936F]/20 rounded-l-md px-2 py-1 text-sm text-[#F0F3BD] focus:outline-none"
                              aria-label="Query input"
                            />
                            <button className="bg-[#1A936F] px-2 py-1 rounded-r-md hover:bg-[#1A936F]/80 transition-colors" aria-label="Send query">
                              <span className="material-symbols-outlined text-[#F0F3BD] text-sm">send</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-[#1E293B] rounded-md p-2 text-xs text-[#F0F3BD]/70 h-[100px] overflow-y-auto custom-scrollbar">
                          <div className="mb-2">
                            <div className="font-medium text-[#F4D35E]">Query:</div>
                            <div>Show vegetation density in highlighted region</div>
                          </div>
                          <div>
                            <div className="font-medium text-[#1A936F]">Response:</div>
                            <div>The highlighted region shows a vegetation density of 62% with seasonal variations of ±8% over the past year.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  {/* Interactive overlay */}
                <div className="absolute inset-0 bg-[#1B263B]/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a 
                    href="/dashboard" 
                    className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-6 py-3 rounded-md text-lg font-medium transition-all transform hover:scale-105 flex items-center hover:shadow-lg hover:shadow-[#1A936F]/20"
                  >
                    <span className="material-symbols-outlined mr-2">play_arrow</span>
                    Try Interactive Demo
                  </a>
                </div>
              </div>
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between reveal" style={{ transitionDelay: "0.4s" }}>
                <div>
                  <h3 className="text-xl font-bold text-[#F4D35E] mb-2">Map Store Explorer Platform</h3>
                  <p className="text-[#F0F3BD]/80 max-w-2xl">
                    Our interactive mapping platform combines AI-powered analysis with visualization tools to help you make sense of complex geospatial data.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <a 
                    href="/dashboard" 
                    className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-4 py-2 rounded-md text-base font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#1A936F]/20 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2 animate-pulse" style={{ animationDuration: "3s" }}>play_arrow</span>
                    <span>Open Dashboard</span>
                  </a>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      openModal("API Documentation", "Our comprehensive API documentation includes detailed endpoints, code examples in multiple languages, and interactive testing tools to help you integrate Map Store into your applications.");
                    }}
                    className="bg-[#1B263B]/80 hover:bg-[#1B263B] text-[#F0F3BD] border border-[#1A936F]/30 px-4 py-2 rounded-md text-base font-medium transition-all transform hover:scale-105 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2">code</span>
                    <span>View API</span>
                  </a>
                </div>
              </div>
              
              {/* Interactive Demo Examples */}
              <div className="p-6 border-t border-[#1A936F]/20 grid grid-cols-1 md:grid-cols-3 gap-4 reveal" style={{ transitionDelay: "0.6s" }}>
                <div 
                  className="bg-[#1B263B]/70 rounded-lg p-4 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all cursor-pointer hover-scale hover-glow group" 
                  onClick={() => openModal("Vegetation Analysis", "This demo showcases our vegetation analysis capabilities using multispectral satellite imagery. It uses AI to detect changes over time and identify areas of concern or interest.")}
                >
                  <div className="rounded-full bg-[#1A936F]/20 w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-[#1A936F]/40 transition-all">
                    <span className="material-symbols-outlined text-[#1A936F] text-2xl group-hover:text-[#F4D35E] transition-colors">eco</span>
                  </div>
                  <h4 className="font-medium text-[#F4D35E] mb-1 flex items-center">
                    Vegetation Analysis
                    <span className="material-symbols-outlined ml-2 text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">arrow_forward</span>
                  </h4>
                  <p className="text-sm text-[#F0F3BD]/70">Track greenery changes and identify land use patterns over time.</p>
                </div>
                
                <div 
                  className="bg-[#1B263B]/70 rounded-lg p-4 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all cursor-pointer hover-scale hover-glow group" 
                  onClick={() => openModal("Climate Data Prediction", "Our climate prediction model uses historical data combined with machine learning to forecast climate patterns. Explore temperature, precipitation, and other environmental factors.")}
                >
                  <div className="rounded-full bg-[#1A936F]/20 w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-[#1A936F]/40 transition-all">
                    <span className="material-symbols-outlined text-[#1A936F] text-2xl group-hover:text-[#F4D35E] transition-colors">cloudy</span>
                  </div>
                  <h4 className="font-medium text-[#F4D35E] mb-1 flex items-center">
                    Climate Prediction
                    <span className="material-symbols-outlined ml-2 text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">arrow_forward</span>
                  </h4>
                  <p className="text-sm text-[#F0F3BD]/70">Forecast temperature and precipitation patterns worldwide.</p>
                </div>
                
                <div 
                  className="bg-[#1B263B]/70 rounded-lg p-4 border border-[#1A936F]/20 hover:border-[#1A936F]/40 transition-all cursor-pointer hover-scale hover-glow group" 
                  onClick={() => openModal("Natural Language Interface", "This demo showcases our natural language interface for geospatial data. Simply ask questions like 'Show me deforestation in the Amazon from 2010-2020' and get visual answers.")}
                >
                  <div className="rounded-full bg-[#1A936F]/20 w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-[#1A936F]/40 transition-all">
                    <span className="material-symbols-outlined text-[#1A936F] text-2xl group-hover:text-[#F4D35E] transition-colors">chat</span>
                  </div>
                  <h4 className="font-medium text-[#F4D35E] mb-1 flex items-center">
                    Natural Language Interface
                    <span className="material-symbols-outlined ml-2 text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">arrow_forward</span>
                  </h4>
                  <p className="text-sm text-[#F0F3BD]/70">Query complex geospatial data using simple English commands.</p>
                </div>
              </div>
              
              {/* Demo Testimonial */}
              <div className="p-6 border-t border-[#1A936F]/20 reveal" style={{ transitionDelay: "0.8s" }}>
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <div className="bg-[#1A936F]/10 w-16 h-16 rounded-full flex items-center justify-center mr-6">
                      <span className="material-symbols-outlined text-[#1A936F] text-3xl animate-pulse">history_edu</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#F0F3BD]/80 italic text-sm md:text-base">
                      "The Map Store Explorer platform transformed our workflow. The natural language interface lets us analyze satellite data in minutes instead of hours. Essential for our climate research."
                    </p>
                    <p className="text-[#F4D35E] text-sm mt-2">
                      — Dr. Sarah Chen, Climate Research Director
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>{/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-[#1A936F]/20 to-[#1B263B]">
          <div className="max-w-4xl mx-auto text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-6">Ready to Transform Your Geospatial Data?</h2>
            <p className="text-xl text-[#F0F3BD]/80 mb-10 max-w-3xl mx-auto">
              Join thousands of researchers, businesses, and organizations already unlocking the power of AI-driven geospatial analysis.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="/dashboard" 
                className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-8 py-4 rounded-md text-lg font-bold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#1A936F]/20 animate-pulse"
                style={{ animationDuration: "3s" }}
              >
                <span className="inline-flex items-center">
                  <span className="material-symbols-outlined mr-2">rocket_launch</span>
                  Get Started Now
                </span>
              </a>
              <a 
                href="#contact" 
                onClick={(e) => {
                  e.preventDefault();
                  contactRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-[#F4D35E] text-[#F4D35E] hover:bg-[#F4D35E]/10 px-8 py-4 rounded-md text-lg font-bold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#F4D35E]/10"
              >
                <span className="inline-flex items-center">
                  <span className="material-symbols-outlined mr-2">contact_page</span>
                  Contact Sales
                </span>
              </a>
            </div>
          </div>
        </section>{/* Newsletter Section */}
        <section className="py-16 px-6 bg-[#1B263B]/90">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1B263B] rounded-xl p-8 border border-[#1A936F]/20 shadow-lg relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#1A936F]/5 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#F4D35E]/5 rounded-full filter blur-3xl"></div>
              
              <div className="relative">
                <div className="text-center mb-8">
                  <span className="material-symbols-outlined text-[#1A936F] text-3xl mb-2">mail</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#F0F3BD] mb-3">Stay Updated</h2>
                  <p className="text-[#F0F3BD]/80">
                    Subscribe to our newsletter for the latest features and updates
                  </p>
                </div>
                
                <form className="max-w-xl mx-auto" onSubmit={handleFormSubmit}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A936F]">
                        <span className="material-symbols-outlined">mail</span>
                      </span>
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full pl-12 pr-4 py-3 bg-[#1B263B] border border-[#1A936F]/40 rounded-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD] placeholder-[#F0F3BD]/50"
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                        title="Please enter a valid email address"
                      />
                    </div>
                    <button 
                      type="submit"
                      className={`${formSubmitted ? 'bg-[#F4D35E]/70 cursor-not-allowed' : 'bg-[#F4D35E] hover:bg-[#F4D35E]/90'} text-[#1B263B] font-medium px-6 py-3 rounded-md transition-all transform hover:scale-105 flex items-center justify-center min-w-[140px]`}
                      disabled={formSubmitted}
                    >
                      {formSubmitted ? 'Subscribed!' : 'Subscribe'}
                    </button>
                  </div>
                  
                  <div className="flex items-start mt-4">
                    <input type="checkbox" id="newsletter-consent" className="mt-1 mr-2" required />
                    <label htmlFor="newsletter-consent" className="text-[#F0F3BD]/60 text-sm">
                      I agree to receive emails about Map Store updates, tips, and special offers. We respect your privacy and you can unsubscribe at any time.
                    </label>
                  </div>
                  
                  {formSubmitted && (
                    <div className="bg-[#1A936F]/20 border border-[#1A936F]/30 rounded-md p-3 mt-4 text-center animate-fadeIn">
                      <p className="text-[#F4D35E] flex items-center justify-center">
                        <span className="material-symbols-outlined mr-2">check_circle</span>
                        Thank you for subscribing to our newsletter!
                      </p>
                    </div>
                  )}
                </form>
                
                <div className="mt-8 text-center">
                  <div className="text-[#F0F3BD]/80 text-sm mb-3">Join our community</div>
                  <div className="flex justify-center space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors">
                      <span className="material-symbols-outlined text-[#1A936F]">language</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors">
                      <span className="material-symbols-outlined text-[#1A936F]">flutter_dash</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors">
                      <span className="material-symbols-outlined text-[#1A936F]">code</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors">
                      <span className="material-symbols-outlined text-[#1A936F]">video_library</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-[#1B263B]">
          <div className="max-w-5xl mx-auto">            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-[#1A936F]/20 text-[#1A936F] text-sm font-medium px-3 py-1 rounded-full border border-[#1A936F]/30 mb-4">
                Contact Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F0F3BD] mb-4">Get in Touch</h2>
              <p className="text-xl text-[#F0F3BD]/80 max-w-3xl mx-auto">
                Have questions or need assistance? We're here to help!
              </p>
              <div className="w-20 h-1 bg-[#1A936F] mx-auto mt-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="reveal" style={{ transitionDelay: "0.1s" }}>
                <h3 className="text-2xl font-bold text-[#F4D35E] mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-[#1A936F] mt-1 mr-4 animate-float">location_on</span>
                    <div>
                      <h4 className="font-bold text-[#F0F3BD]">Location</h4>
                      <p className="text-[#F0F3BD]/80">123 GeoTech Plaza, San Francisco, CA 94105</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-[#1A936F] mt-1 mr-4 animate-float" style={{ animationDelay: "0.5s" }}>mail</span>
                    <div>
                      <h4 className="font-bold text-[#F0F3BD]">Email</h4>
                      <p className="text-[#F0F3BD]/80">info@mapstore-example.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-[#1A936F] mt-1 mr-4 animate-float" style={{ animationDelay: "1s" }}>call</span>
                    <div>
                      <h4 className="font-bold text-[#F0F3BD]">Phone</h4>
                      <p className="text-[#F0F3BD]/80">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-[#F0F3BD] mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                      <span className="material-symbols-outlined text-[#1A936F]">language</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                      <span className="material-symbols-outlined text-[#1A936F]">flutter_dash</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                      <span className="material-symbols-outlined text-[#1A936F]">code</span>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                      <span className="material-symbols-outlined text-[#1A936F]">video_library</span>
                    </a>
                  </div>
                </div>
              </div>                <div className="reveal" style={{ transitionDelay: "0.3s" }}>
                <form className="bg-[#1B263B] rounded-xl p-6 border border-[#1A936F]/20 shadow-lg hover-glow" onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-[#F0F3BD] font-medium mb-2">Name</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A936F]">
                        <span className="material-symbols-outlined">person</span>
                      </span>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full pl-12 px-4 py-3 bg-[#1B263B] border border-[#1A936F]/40 rounded-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD]"
                        required
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-[#F0F3BD] font-medium mb-2">Email</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A936F]">
                        <span className="material-symbols-outlined">mail</span>
                      </span>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full pl-12 px-4 py-3 bg-[#1B263B] border border-[#1A936F]/40 rounded-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD]"
                        required
                        placeholder="your.email@example.com"
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                        title="Please enter a valid email address"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-[#F0F3BD] font-medium mb-2">Subject</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A936F]">
                        <span className="material-symbols-outlined">subject</span>
                      </span>
                      <select 
                        id="subject" 
                        className="w-full pl-12 px-4 py-3 bg-[#1B263B] border border-[#1A936F]/40 rounded-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD] appearance-none"
                        required
                      >
                        <option value="" disabled selected className="text-[#F0F3BD]/50">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales Question</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1A936F] pointer-events-none">
                        <span className="material-symbols-outlined">arrow_drop_down</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-[#F0F3BD] font-medium mb-2">Message</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-[#1A936F]">
                        <span className="material-symbols-outlined">chat</span>
                      </span>
                      <textarea 
                        id="message" 
                        rows="5" 
                        className="w-full pl-12 px-4 py-3 bg-[#1B263B] border border-[#1A936F]/40 rounded-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD] resize-none"
                        required
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mb-6 flex items-start">
                    <input 
                      type="checkbox" 
                      id="privacy" 
                      className="mt-1 mr-3"
                      required
                    />
                    <label htmlFor="privacy" className="text-sm text-[#F0F3BD]/70">
                      I agree to the <a href="#" className="text-[#1A936F] hover:underline">Privacy Policy</a> and consent to having my data processed.
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    className={`w-full ${formSubmitted ? 'bg-[#1A936F]/60 cursor-not-allowed' : 'bg-[#1A936F] hover:bg-[#1A936F]/80'} text-[#F0F3BD] font-medium px-6 py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-[#1A936F]/20 transition-all`}
                    disabled={formSubmitted}
                  >
                    {formSubmitted ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2">send</span>
                        Send Message
                      </>
                    )}
                  </button>
                  
                  {formSubmitted && (
                    <div className="mt-4 p-3 bg-[#1A936F]/20 border border-[#1A936F]/30 rounded-md text-[#F4D35E] text-sm flex items-center justify-center animate-fadeIn">
                      <span className="material-symbols-outlined mr-2">check_circle</span>
                      Thank you! Your message has been sent successfully.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}      <footer className="bg-[#1B263B]/90 border-t border-[#1A936F]/20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="reveal" style={{ transitionDelay: "0.1s" }}>
              <div className="flex items-center mb-6 hover-scale">
                <span className="material-symbols-outlined text-[#1A936F] text-3xl mr-2 animate-rotateGlobe" style={{ animationDuration: "15s" }}>public</span>
                <span className="text-xl font-bold tracking-wide text-[#F0F3BD]">Map Store</span>
              </div>
              <p className="text-[#F0F3BD]/70 mb-6">
                Advanced geospatial analysis powered by AI, making earth observation data accessible and actionable.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                  <span className="material-symbols-outlined text-[#1A936F] text-sm">language</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                  <span className="material-symbols-outlined text-[#1A936F] text-sm">flutter_dash</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#1A936F]/20 flex items-center justify-center hover:bg-[#1A936F]/40 transition-colors hover-scale">
                  <span className="material-symbols-outlined text-[#1A936F] text-sm">code</span>
                </a>
              </div>
            </div>
            
            <div className="reveal" style={{ transitionDelay: "0.2s" }}>
              <h4 className="text-lg font-bold text-[#F0F3BD] mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    About
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Features
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="reveal" style={{ transitionDelay: "0.3s" }}>
              <h4 className="text-lg font-bold text-[#F0F3BD] mb-6">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors flex items-center group">
                    <span className="material-symbols-outlined text-[#1A936F] mr-2 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="reveal" style={{ transitionDelay: "0.4s" }}>
              <h4 className="text-lg font-bold text-[#F0F3BD] mb-6">Newsletter</h4>
              <p className="text-[#F0F3BD]/70 mb-4">Subscribe to get the latest updates</p>
              <form className="mb-4" onSubmit={handleFormSubmit}>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="w-full px-3 py-2 bg-[#1B263B] border border-[#1A936F]/40 rounded-l-md focus:outline-none focus:border-[#1A936F] text-[#F0F3BD]"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-3 py-2 rounded-r-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
                {formSubmitted && (
                  <p className="text-[#F4D35E] text-xs mt-2 animate-fadeIn">
                    Thank you for subscribing!
                  </p>
                )}
              </form>
              <div>
                <h5 className="text-[#F0F3BD] font-medium mb-2">Our Certifications</h5>
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F4D35E]/10 flex items-center justify-center" title="ISO Certified">
                    <span className="material-symbols-outlined text-[#F4D35E] text-sm">verified</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F4D35E]/10 flex items-center justify-center" title="GDPR Compliant">
                    <span className="material-symbols-outlined text-[#F4D35E] text-sm">security</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F4D35E]/10 flex items-center justify-center" title="Cloud Native">
                    <span className="material-symbols-outlined text-[#F4D35E] text-sm">cloud_done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#1A936F]/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#F0F3BD]/50 text-sm">
              &copy; {new Date().getFullYear()} Map Store. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-[#F0F3BD]/50 hover:text-[#F0F3BD] text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-[#F0F3BD]/50 hover:text-[#F0F3BD] text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-[#F0F3BD]/50 hover:text-[#F0F3BD] text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>      </footer>
      
      {/* Accessible Modal Component */}
      {isModalOpen && (
        <AccessibleModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalContent.title}
          className="p-4 animate-fadeIn"
        >
          <div className="border-t border-[#1A936F]/20 pt-4 mt-2">
            <p className="text-[#F0F3BD]/90 leading-relaxed">{modalContent.content}</p>
            
            {/* Modal CTA */}
            <div className="mt-8 flex justify-end">
              <AccessibleButton
                onClick={closeModal}
                className="mr-4 text-[#F0F3BD]/70 hover:text-[#F4D35E] transition-colors"
                ariaLabel="Close dialog"
              >
                Close
              </AccessibleButton>
              <a 
                href="/dashboard" 
                className="bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] px-4 py-2 rounded-md transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#1A936F]/20 flex items-center focus-visible"
                aria-label="Try this feature in dashboard"
              >
                <span className="material-symbols-outlined mr-2" aria-hidden="true">play_arrow</span>
                Try this feature
              </a>
            </div>
          </div>
        </AccessibleModal>
      )}
    </div>
  );
};
