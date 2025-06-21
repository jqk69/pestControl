import React, { useState, useEffect, useCallback, useRef } from 'react';
// Importing Lucide icons
import {
    Baby,
    Paintbrush,
    BookOpen,
    CheckCircle2,
    Star,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Youtube,
    Send,
    Menu as MenuIcon,
    ClipboardList, 
    MessageSquare, 
    Megaphone,     
    FileText,      
    ArrowLeft,
    Sparkles, // For new logo
    LogIn, // For Login
} from 'lucide-react';

// Define colors from the original CSS for easy use with Tailwind arbitrary values
const COLORS = {
    primary: '#FF9F1C', // Orange
    secondary: '#4ADE80', // Friendly Green
    accent: '#E71D36',   // Red
    light: '#FDFFFC',    // Off-white
    dark: '#011627',     // Dark Blue/Black
    bg: '#FFF9F0',       // Light beige background (Main page background)
};

// Helper function for scrolling to sections smoothly
const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

/**
 * Reusable Feature Card Component
 * Displays an icon, title, description, and an optional image for a feature.
 * Acts as a button to navigate to a specific feature page.
 * @param {object} props - Component props
 * @param {JSX.Element} props.icon - Icon element for the feature.
 * @param {string} props.title - Title of the feature.
 * @param {string} props.description - Description of the feature.
 * @param {string} [props.imgSrc] - Optional image source for the card.
 * @param {string} [props.imgAlt] - Optional alt text for the image.
 * @param {string} props.pageId - Identifier for the page to navigate to.
 * @param {function} props.onNavigate - Callback function to handle navigation.
 */
const FeatureCard = ({ icon, title, description, imgSrc, imgAlt, pageId, onNavigate }) => (
    <button
        onClick={() => onNavigate(pageId)}
        className="flex flex-col bg-white rounded-3xl p-6 md:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.1)] transition-all duration-300 hover:translate-y-[-5px] hover:rotate-1 hover:shadow-[12px_12px_0_rgba(0,0,0,0.1)] h-full relative overflow-hidden text-left w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        style={{'--primary-color': COLORS.primary}}
        aria-label={`Go to ${title} feature`}
    >
        <div className="absolute top-[-10px] right-[-10px] w-[50px] h-[50px] bg-[var(--primary-color)] rounded-full opacity-20" style={{'--primary-color': COLORS.primary}}></div>
        <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full border-3 border-dashed border-[var(--primary-color)] bg-[var(--light-color)]" style={{'--primary-color': COLORS.primary, '--light-color': COLORS.light}}>
            {icon}
        </div>
        <h3 className="text-2xl mb-2" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>{title}</h3>
        <p className="text-gray-700 flex-grow text-sm md:text-base">{description}</p>
        {imgSrc && (
            <div className="mt-auto text-right">
                <img src={imgSrc} alt={imgAlt} className="inline-block mt-3 h-10 md:h-12" />
            </div>
        )}
    </button>
);

/**
 * Reusable Testimonial Card Component
 * Displays a testimonial with an image, name, role, rating, and text.
 * @param {object} props - Component props
 * @param {string} props.imgSrc - Image source for the testimonial giver.
 * @param {string} props.name - Name of the testimonial giver.
 * @param {string} props.role - Role of the testimonial giver.
 * @param {number} props.rating - Star rating (out of 5).
 * @param {string} props.text - The testimonial text.
 */
const TestimonialCard = ({ imgSrc, name, role, rating, text }) => (
    <div className="bg-white p-8 rounded-3xl shadow-[5px_5px_0_rgba(0,0,0,0.1)] border-2 border-[var(--secondary-color)] relative h-full flex flex-col" style={{'--secondary-color': COLORS.secondary}}>
        <div className="absolute top-5 left-5 text-7xl text-[rgba(74,222,128,0.1)] font-serif z-0 select-none" aria-hidden="true">“</div>
        <div className="relative z-10 flex flex-col flex-grow">
            <div className="flex items-center mb-3">
                <img src={imgSrc} alt={name} className="rounded-full mr-4 w-16 h-16 object-cover" />
                <div>
                    <h4 className="mb-0 text-xl" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>{name}</h4>
                    <div className="text-yellow-400">
                        {[...Array(rating)].map((_, i) => <Star key={i} className="inline-block w-5 h-5 fill-current" />)}
                    </div>
                </div>
            </div>
            <p className="text-gray-700 italic flex-grow">"{text}"</p>
            <div className="text-right mt-2">
                <strong className="text-gray-600">- {role}</strong>
            </div>
        </div>
    </div>
);

/**
 * Container Component for Feature Pages
 * Provides a consistent layout with a title and a back button.
 * @param {object} props - Component props
 * @param {string} props.title - The title of the feature page.
 * @param {JSX.Element} props.children - Content to be displayed within the page.
 * @param {function} props.onNavigate - Callback function to handle navigation (e.g., back to home).
 */
const FeaturePageContainer = ({ title, children, onNavigate }) => (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-[calc(100vh-10rem)]">
        <button
            onClick={() => onNavigate('home')}
            className="mb-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-opacity"
            style={{'--primary-color': COLORS.primary}}
        >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
        </button>
        <h1 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>{title}</h1>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
            {children}
        </div>
    </div>
);

// --- Placeholder Page Components for Features ---
const ViewChildProgressPage = ({ onNavigate }) => ( <FeaturePageContainer title="View Child Progress" onNavigate={onNavigate}><p className="text-lg text-gray-700">Detailed progress reports for your child will be displayed here.</p></FeaturePageContainer> );
const ChatWithTeacherPage = ({ onNavigate }) => ( <FeaturePageContainer title="Chat with Teacher" onNavigate={onNavigate}><p className="text-lg text-gray-700">A secure messaging interface to communicate with your child's teacher.</p></FeaturePageContainer> );
const ViewAnnouncementsPage = ({ onNavigate }) => ( <FeaturePageContainer title="View Announcements" onNavigate={onNavigate}><p className="text-lg text-gray-700">Important school news and updates will be listed here.</p></FeaturePageContainer> );
const FileComplaintsPage = ({ onNavigate }) => ( <FeaturePageContainer title="File Complaints / Feedback" onNavigate={onNavigate}><p className="text-lg text-gray-700">Submit any complaints, concerns, or feedback here.</p></FeaturePageContainer> );
const LoginPage = ({ onNavigate }) => ( <FeaturePageContainer title="Login" onNavigate={onNavigate}><p className="text-lg text-gray-700">Login form will be here.</p></FeaturePageContainer> );


/**
 * Main Application Component
 * Handles overall layout, navigation state, and renders different views/pages.
 */
export default function Home() {
    // State for mobile navigation toggle
    const [isNavOpen, setIsNavOpen] = useState(false);
    // State for current page/view being displayed (e.g., 'home', 'viewChildProgress')
    const [currentPage, setCurrentPage] = useState('home');
    // State to store target section ID for scrolling after navigating back to home
    const [targetScroll, setTargetScroll] = useState(null);
    
    // Testimonial data
    const testimonialsData = [
        { imgSrc: `https://placehold.co/80x80/${COLORS.primary.slice(1)}/FFFFFF?text=😊`, name: "Sunshine Preschool", role: "Sarah Johnson, Teacher", rating: 5, text: "The kids get so excited to see their daily 'learning adventure' report! It's made parent-teacher communication joyful instead of stressful." },
        { imgSrc: `https://placehold.co/80x80/${COLORS.secondary.slice(1)}/FFFFFF?text=😍`, name: "Parent of 4-year-old", role: "Michael Chen, Parent", rating: 5, text: "I love getting photos during the day and the bedtime stories recorded by teachers. My child asks to hear them every night!" },
        { imgSrc: `https://placehold.co/80x80/${COLORS.accent.slice(1)}/FFFFFF?text=🥳`, name: "Happy Learners Playschool", role: "Anita Desai, Director", rating: 5, text: "This platform has streamlined our administrative tasks significantly, allowing us to focus more on the children's development." },
        { imgSrc: `https://placehold.co/80x80/${COLORS.dark.slice(1)}/FFFFFF?text= `, name: "Parent of Twins", role: "Priya & Rohan Kumar, Parents", rating: 5, text: "Tracking progress for two little ones used to be overwhelming. Now, it's all organized and easy to access. Thank you!" }
    ];

    // State and refs for Testimonial Slider
    const [currentVisualSlide, setCurrentVisualSlide] = useState(0); // Tracks the visual slide index for transform
    const testimonialSliderRef = useRef(null); // Ref to the sliding container
    const testimonialIntervalRef = useRef(null); // Stores the interval ID for cleanup
    const isResettingRef = useRef(false); // Flag to prevent multiple transitions during the loop reset

    // Prepare testimonial slides (pairs of cards)
    const testimonialSlides = []; 
    for (let i = 0; i < testimonialsData.length; i += 2) {
        testimonialSlides.push(testimonialsData.slice(i, i + 2));
    }
    const numOriginalSlides = testimonialSlides.length;
    // Clone the first slide and append it for seamless looping, only if there's more than one slide
    const displayableSlides = numOriginalSlides > 1 ? [...testimonialSlides, testimonialSlides[0]] : testimonialSlides;

    // Navigation function to change the current page view
    const navigateTo = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll to top when changing "page"
    }, []);

    // useEffect to dynamically add Google Fonts to the document head on component mount
    useEffect(() => {
        const FredokaOne = document.createElement('link');
        FredokaOne.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"; FredokaOne.rel = "stylesheet"; document.head.appendChild(FredokaOne);
        const ComicNeue = document.createElement('link');
        ComicNeue.href = "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap"; ComicNeue.rel = "stylesheet"; document.head.appendChild(ComicNeue);
    }, []);

    // useEffect to handle scrolling to a section after navigating back to the 'home' page
    useEffect(() => {
        if (currentPage === 'home' && targetScroll) {
            scrollToSection(targetScroll);
            setTargetScroll(null); // Reset target after scrolling
        }
    }, [currentPage, targetScroll]);

    // useEffect for the Testimonial slider animation
    useEffect(() => {
        // Only run the slider if on the home page and there's more than one original slide to show
        if (currentPage === 'home' && numOriginalSlides > 1) {
            const advanceSlide = () => {
                if (isResettingRef.current) return; // Don't advance if a reset is already in progress

                setCurrentVisualSlide(prevVisualSlide => {
                    const nextVisualSlide = prevVisualSlide + 1; // Tentative next visual slide index
                    
                    if (testimonialSliderRef.current) {
                        // Apply smooth transition for the slide
                        testimonialSliderRef.current.style.transition = 'transform 1.5s ease-in-out';
                        testimonialSliderRef.current.style.transform = `translateX(-${nextVisualSlide * 100}%)`;
                    }

                    // Check if we've reached the cloned slide (which is at index numOriginalSlides)
                    if (nextVisualSlide >= numOriginalSlides) { 
                        isResettingRef.current = true; // Set flag to indicate a reset is happening
                        // After the transition to the cloned slide finishes (1.5s), jump back to the start
                        setTimeout(() => {
                            if (testimonialSliderRef.current) {
                                testimonialSliderRef.current.style.transition = 'none'; // No transition for the jump
                                testimonialSliderRef.current.style.transform = `translateX(0%)`; // Instantly jump to the first actual slide
                            }
                            setCurrentVisualSlide(0); // Reset the visual slide index to 0
                            isResettingRef.current = false; // Clear the reset flag
                        }, 1500); // This timeout duration MUST match the CSS transition duration (1.5s)
                    }
                    // The state will naturally be 0 after the reset, or nextVisualSlide otherwise.
                    // No need to return nextVisualSlide % numOriginalSlides here, as the timeout handles the loop reset for the state.
                    return nextVisualSlide; 
                });
            };
            
            // Set up the interval to advance slides
            testimonialIntervalRef.current = setInterval(advanceSlide, 5000); // 5-second interval

            // Cleanup function for when the component unmounts or dependencies change
            return () => {
                clearInterval(testimonialIntervalRef.current);
            };
        } else {
            // If not on home page or not enough slides, clear any existing interval
             if (testimonialIntervalRef.current) clearInterval(testimonialIntervalRef.current);
        }
    }, [currentPage, numOriginalSlides]); // Rerun effect if currentPage or numOriginalSlides changes


    // Navigation links for the main sections of the homepage
    const navLinks = [
        { name: 'Home', sectionId: 'hero', pageId: 'home' }, 
        { name: 'About', sectionId: 'about', pageId: 'home' },
        { name: 'Features', sectionId: 'features', pageId: 'home' },
        { name: 'Testimonials', sectionId: 'testimonials', pageId: 'home' },
        { name: 'Contact', sectionId: 'contact', pageId: 'home' },
    ];
    // Link for login page
    const loginLink = { name: 'Login', pageId: 'login', icon: <LogIn className="w-5 h-5 mr-1 md:mr-2"/> };

    // Handles clicks on navigation items
    const handleNavClick = (pageId, sectionId) => {
        if (pageId !== 'home') { // If navigating to a feature page
            navigateTo(pageId);
        } else if (currentPage !== 'home') { // If on a feature page and navigating back to home
            navigateTo('home');
            setTargetScroll(sectionId); // Set target for scrolling after home page renders
        } else { // If already on home page, just scroll to section
            scrollToSection(sectionId);
        }
        setIsNavOpen(false); // Close mobile nav if open
    };

    // --- Inline styles for SVG backgrounds (kept for brevity in this example) ---
    const heroSectionStyle = {
        position: 'relative', overflow: 'hidden',
        '--wavy-bg': `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="${encodeURIComponent(COLORS.bg)}" opacity="1"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="${encodeURIComponent(COLORS.bg)}" opacity="1"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="${encodeURIComponent(COLORS.bg)}" opacity="1"/></svg>')`
    };
    const sectionTitleStyleAfter = {
        '--wavy-underline': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="${encodeURIComponent(COLORS.primary)}" stroke-width="2"/></svg>')`
    };
    const footerStyle = {
        position: 'relative',
        '--wavy-top-dark': `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="${encodeURIComponent(COLORS.dark)}" opacity=".25"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="${encodeURIComponent(COLORS.dark)}" opacity=".5"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="${encodeURIComponent(COLORS.dark)}"/></svg>')`
    };

    // Renders the content for the homepage sections
    const renderHomePageContent = () => (
        <>
            {/* Hero Section */}
            <section id="hero" className="py-24 md:py-32 text-center hero-section-wavy" style={{...heroSectionStyle, backgroundColor: COLORS.bg }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>Where Little Minds <br /> Grow Big Ideas!</h1>
                        <p className="text-xl md:text-2xl mb-10 opacity-90" style={{color: COLORS.dark}}>Our fun and easy system helps teachers and parents work together to create amazing learning adventures!</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button 
                                onClick={() => handleNavClick('contact', 'contact')} 
                                className="px-6 py-3 rounded-full font-bold shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition-opacity hover:opacity-90 text-lg" 
                                style={{ backgroundColor: COLORS.accent, color: COLORS.light }}
                            >
                                Contact Us
                            </button>
                            <button 
                                onClick={() => handleNavClick('features', 'features')} 
                                className="px-6 py-3 rounded-full font-bold border-2 shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition-colors text-lg"
                                style={{ color: COLORS.primary, borderColor: COLORS.primary }}
                                onMouseEnter={e => {e.currentTarget.style.backgroundColor = COLORS.primary; e.currentTarget.style.color = 'white';}}
                                onMouseLeave={e => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = COLORS.primary;}}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 md:py-24">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl text-center mb-12 md:mb-16 section-title-underline relative inline-block" style={{...sectionTitleStyleAfter, fontFamily: "'Fredoka One', cursive", color: COLORS.accent, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>About Our System</h2>
                    <div className="flex flex-col items-center">
                        <div className="lg:w-2/3 animate-floating"> 
                            <div className="p-6 md:p-8 bg-white rounded-3xl shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
                                <p className="text-xl md:text-2xl leading-relaxed mb-4 text-[var(--secondary-color)]" style={{'--secondary-color': COLORS.secondary}}>🌈 The Early Childhood Assessment and Support Platform for Anganwadis!</p>
                                <p className="text-gray-700 mb-3">This platform is a digital companion for Anganwadis, designed to empower teachers with tools for continuous assessment and monitoring of children's development (ages 2-4). It simplifies daily documentation, records activities, and uses AI-assisted analysis to identify students who might need special attention.</p>
                                <p className="text-gray-700 mb-3">Our system is built with bright colors, simple buttons, and friendly characters that children love, while providing all the powerful tools educators need.</p>
                                <p className="text-gray-700 mb-4">From tracking milestones to sharing updates with parents, we've made everything joyful and simple, fostering better parent-teacher communication and supporting administrators with insightful reports.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 md:py-24" style={{ backgroundColor: COLORS.bg }}>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl text-center mb-12 md:mb-16 section-title-underline relative inline-block" style={{ ...sectionTitleStyleAfter, fontFamily: "'Fredoka One', cursive", color: COLORS.accent, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <FeatureCard pageId="viewChildProgress" onNavigate={navigateTo} icon={<ClipboardList className="w-12 h-12" style={{color: COLORS.accent}} />} title="View Child Progress" description="Stay updated on your child's developmental milestones and daily learning journey with easy-to-read progress reports." />
                        <FeatureCard pageId="chatWithTeacher" onNavigate={navigateTo} icon={<MessageSquare className="w-12 h-12" style={{color: COLORS.accent}} />} title="Chat with Teacher" description="Communicate directly and securely with your child's teacher for quick updates, questions, or sharing insights." />
                        <FeatureCard pageId="viewAnnouncements" onNavigate={navigateTo} icon={<Megaphone className="w-12 h-12" style={{color: COLORS.accent}} />} title="View Announcements" description="Never miss important school news, event reminders, or updates from the Anganwadi, all in one place." />
                        <FeatureCard pageId="fileComplaints" onNavigate={navigateTo} icon={<FileText className="w-12 h-12" style={{color: COLORS.accent}} />} title="File Complaints" description="A dedicated space to voice any concerns or provide feedback, ensuring your queries are addressed effectively." />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 md:py-24">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl text-center mb-12 md:mb-16 section-title-underline relative inline-block" style={{...sectionTitleStyleAfter, fontFamily: "'Fredoka One', cursive", color: COLORS.accent, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>What Teachers & Parents Say</h2>
                    <div className="relative w-full overflow-hidden">
                        <div 
                            ref={testimonialSliderRef}
                            className="flex" 
                            style={{ 
                                width: `${displayableSlides.length * 100}%`, // Total width for all visual slides
                                transform: `translateX(-${currentVisualSlide * (100 / displayableSlides.length)}%)`
                            }} 
                        >
                            {displayableSlides.map((pair, slideIndex) => (
                                <div key={slideIndex} className="w-full grid md:grid-cols-2 gap-8 flex-shrink-0 px-2" style={{ width: `${100 / displayableSlides.length}%`}}>
                                    {pair.map((testimonial, cardIndex) => (
                                        <TestimonialCard key={cardIndex} {...testimonial} />
                                    ))}
                                    {/* Fill empty slot if only one card in the last actual pair and it's not a cloned slide */}
                                    {pair.length === 1 && slideIndex < numOriginalSlides && <div className="hidden md:block"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Founders Section */}
            <section id="founders" className="py-16 md:py-24 bg-[var(--light-color)] relative overflow-hidden" style={{'--light-color': COLORS.light, backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><circle cx="20" cy="20" r="5" fill="${encodeURIComponent(COLORS.primary)}" opacity="0.1"/><circle cx="80" cy="30" r="7" fill="${encodeURIComponent(COLORS.secondary)}" opacity="0.1"/><circle cx="40" cy="70" r="6" fill="${encodeURIComponent(COLORS.accent)}" opacity="0.1"/><circle cx="70" cy="80" r="8" fill="${encodeURIComponent(COLORS.primary)}" opacity="0.1"/></svg>')`, backgroundSize: '200px' }}>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl text-center mb-12 md:mb-16 section-title-underline relative inline-block" style={{...sectionTitleStyleAfter, fontFamily: "'Fredoka One', cursive", color: COLORS.accent, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>Meet Our Team</h2>
                     <div className="flex justify-center"> 
                        <div className="flex flex-col items-center text-center max-w-xs md:max-w-sm">
                            <div className="relative mb-4">
                                <img src={`https://placehold.co/300x300/${COLORS.primary.slice(1)}/FFFFFF?text=Ms.+Teacher`} alt="Ms. Teacher" className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-white shadow-xl" />
                                <div className={`absolute bottom-[-15px] right-[-15px] w-20 h-20 rounded-full z-[-1]`} style={{backgroundColor: COLORS.accent}}></div>
                            </div>
                            <h3 className="text-2xl mb-1" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>Ms. Teacher</h3>
                            <p className="text-gray-600 font-semibold">Founder</p>
                            <p className="text-gray-700 mt-2 text-sm md:text-base">Former preschool teacher with 15 years of experience making learning fun!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 md:py-24">
                <div className="container mx-auto px-4 relative z-10">
                     <h2 className="text-4xl text-center mb-12 md:mb-16 section-title-underline relative inline-block" style={{...sectionTitleStyleAfter, fontFamily: "'Fredoka One', cursive", color: COLORS.accent, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>Let's Chat!</h2>
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="p-6 md:p-8 bg-white rounded-3xl shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
                            {[
                                { icon: <Phone className="w-6 h-6"/>, text: "(123) 456-7890" },
                                { icon: <Mail className="w-6 h-6"/>, text: "hello@littleexplorers.com" },
                                { icon: <MapPin className="w-6 h-6"/>, text: "123 Playground Lane, Fun City, FC 12345" }
                            ].map((info, index) => (
                                <div key={index} className="flex items-start mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full border-2 border-[var(--accent-color)] bg-[var(--light-color)] text-[var(--primary-color)] shrink-0" style={{'--accent-color': COLORS.accent, '--light-color': COLORS.light, '--primary-color': COLORS.primary}}>
                                        {info.icon}
                                    </div>
                                    <span className="text-gray-700 mt-1">{info.text}</span>
                                </div>
                            ))}
                             <div className="mt-8">
                                <p className="mb-3 text-gray-800 font-semibold">Follow our adventures:</p>
                                <div className="flex space-x-4">
                                    <a href="#" aria-label="Facebook" className="text-[var(--accent-color)] hover:opacity-75 transition-opacity" style={{'--accent-color': COLORS.accent}}><Facebook size={32} /></a>
                                    <a href="#" aria-label="Instagram" className="text-[var(--accent-color)] hover:opacity-75 transition-opacity" style={{'--accent-color': COLORS.accent}}><Instagram size={32} /></a>
                                    <a href="#" aria-label="YouTube" className="text-[var(--accent-color)] hover:opacity-75 transition-opacity" style={{'--accent-color': COLORS.accent}}><Youtube size={32} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 bg-white rounded-3xl shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Your Email</label>
                                    <input type="email" id="email" placeholder="hello@example.com" className="w-full px-4 py-3 rounded-xl border-2 border-[var(--secondary-color)] focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-colors" style={{'--secondary-color': COLORS.secondary, '--primary-color': COLORS.primary}} />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-gray-700 font-semibold mb-1">Your Message</label>
                                    <textarea id="message" rows="4" placeholder="Tell us what's on your mind..." className="w-full px-4 py-3 rounded-xl border-2 border-[var(--secondary-color)] focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-colors" style={{'--secondary-color': COLORS.secondary, '--primary-color': COLORS.primary}}></textarea>
                                </div>
                                <button type="submit" className="w-full px-6 py-3 rounded-full font-bold shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition-opacity hover:opacity-90 text-lg flex items-center justify-center text-white" style={{ backgroundColor: COLORS.accent, borderColor: COLORS.accent }}>
                                    Send Message <Send className="w-5 h-5 ml-2" />
                                </button>
                            </form>
                            <p className="text-center text-sm text-gray-600 mt-6">A community project developed by Akshay</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    // Renders the current page based on the 'currentPage' state
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'viewChildProgress': return <ViewChildProgressPage onNavigate={navigateTo} />;
            case 'chatWithTeacher': return <ChatWithTeacherPage onNavigate={navigateTo} />;
            case 'viewAnnouncements': return <ViewAnnouncementsPage onNavigate={navigateTo} />;
            case 'fileComplaints': return <FileComplaintsPage onNavigate={navigateTo} />;
            case 'login': return <LoginPage onNavigate={navigateTo} />;
            case 'home': 
            default: 
                return renderHomePageContent();
        }
    };

    // Main return statement for the App component
    return (
        <div style={{ fontFamily: "'Comic Neue', cursive", color: COLORS.dark, backgroundColor: COLORS.bg }} className="overflow-x-hidden">
            {/* Global styles injected into the page */}
            <style jsx global>{`
                body { 
                    font-family: 'Comic Neue', cursive; color: ${COLORS.dark}; background-color: ${COLORS.bg}; overflow-x: hidden;
                }
                .hero-section-wavy::before { content: ""; position: absolute; bottom: -50px; left: 0; right: 0; height: 100px; background: var(--wavy-bg); background-size: cover; z-index: 0; }
                .section-title-underline::after { content: ""; position: absolute; bottom: -10px; left: 0; width: 100%; height: 15px; background: var(--wavy-underline) repeat-x; background-size: 100px 15px; }
                .footer-wavy-top::before { content: ""; position: absolute; top: -30px; left: 0; right: 0; height: 60px; background: var(--wavy-top-dark); background-size: cover; }
                @keyframes floating { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } } 
                .animate-floating { animation: floating 3s ease-in-out infinite; }
                @keyframes custom-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } } 
                .animate-custom-pulse { animation: custom-pulse 2s infinite; }
                @keyframes custom-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .animate-custom-rotate { animation: custom-rotate 10s linear infinite; }
            `}</style>

            {/* Decorative background shapes, only shown on the homepage view */}
            {currentPage === 'home' && (
                <>
                    <div className="absolute z-0 opacity-10 top-[10%] left-[5%] w-24 h-24 bg-[var(--primary-color)] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] animate-custom-rotate" style={{'--primary-color': COLORS.primary}}></div>
                    <div className="absolute z-0 opacity-10 bottom-[20%] right-[10%] w-36 h-36 bg-[var(--secondary-color)] rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] animate-floating" style={{'--secondary-color': COLORS.secondary}}></div>
                    <div className="absolute z-0 opacity-10 top-[40%] right-[20%] w-20 h-20 bg-[var(--accent-color)] rounded-full animate-custom-pulse" style={{'--accent-color': COLORS.accent}}></div>
                </>
            )}

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo and Brand Name - clickable to go to home */}
                        <button onClick={() => handleNavClick('home', 'hero')} className="flex items-center text-2xl focus:outline-none" style={{ fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.dark}`, textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
                            <Sparkles className="w-8 h-8 md:w-10 md:h-10 mr-2" style={{color: COLORS.accent}}/>
                            Little Explorers
                        </button>
                        
                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            {navLinks.map(link => (
                                <button 
                                    key={link.name} 
                                    onClick={() => handleNavClick(link.pageId, link.sectionId)} 
                                    className="text-sm lg:text-base text-gray-600 hover:text-[var(--primary-color)] transition-colors duration-300 px-3 py-2 rounded-md" style={{'--primary-color': COLORS.primary}}
                                >
                                    {link.name}
                                </button>
                            ))}
                             <button
                                key={loginLink.name}
                                onClick={() => handleNavClick(loginLink.pageId, null)}
                                className="flex items-center text-sm lg:text-base font-medium text-white bg-[var(--accent-color)] hover:opacity-90 transition-opacity duration-300 px-4 py-2 rounded-full shadow-md ml-2"
                                style={{'--accent-color': COLORS.accent}}
                            >
                                {loginLink.icon} {loginLink.name}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Toggle menu" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)]" style={{'--primary-color': COLORS.primary}}>
                                <MenuIcon className="w-8 h-8" style={{ color: COLORS.primary }} />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Dropdown Menu */}
                {isNavOpen && (
                    <div className="md:hidden bg-white shadow-xl absolute w-full py-2 z-40 border-t border-gray-200">
                        {navLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.pageId, link.sectionId)}
                                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[var(--primary-color)] transition-colors duration-300"
                                style={{'--primary-color': COLORS.primary}}
                            >
                                {link.name}
                            </button>
                        ))}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                             <button
                                key={loginLink.name}
                                onClick={() => handleNavClick(loginLink.pageId, null)}
                                className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[var(--primary-color)] transition-colors duration-300"
                                style={{'--primary-color': COLORS.primary}}
                            >
                               {loginLink.icon} {loginLink.name}
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            
            {/* Main content area where different pages are rendered */}
            <main>
                {renderCurrentPage()}
            </main>

            {/* Footer */}
            <footer className="bg-[var(--dark-color)] text-white py-12 text-center footer-wavy-top" style={{...footerStyle, '--dark-color': COLORS.dark}}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex justify-center items-center mb-4">
                        <Sparkles className="w-10 h-10 mr-2" style={{color: COLORS.primary}}/>
                         <span className="text-2xl" style={{fontFamily: "'Fredoka One', cursive", color: COLORS.primary, WebkitTextStroke: `1px ${COLORS.light}`, textShadow: '2px 2px 0 rgba(0,0,0,0.1)'}}>Little Explorers</span>
                    </div>
                    <p className="mb-6 opacity-80">Making preschool management as fun as recess time!</p>
                    <p className="text-sm opacity-70">&copy; {new Date().getFullYear()} Little Explorers Academy Management System. All rights reserved.</p>
                    <div className="mt-6 space-x-4">
                        {["Privacy Policy", "Terms of Service", "FAQ"].map(link => (
                            <a key={link} href="#" className="text-sm text-gray-300 hover:text-white transition-colors">{link}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
 