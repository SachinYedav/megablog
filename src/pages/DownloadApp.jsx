import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
    Star, Download, ShieldCheck, Smartphone, Monitor, Share2, 
    ChevronDown, X, Check, Lock, Trash2, 
    MessageSquarePlus, MoreVertical, Edit2, Trash, CheckCircle2 ,
    FileText, LayoutList, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom"; 
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import appwriteService from "../appwrite/config";
import { Modal } from "../components/index";

// ==========================================
// 1. SUB-COMPONENT: SCREENSHOT LIGHTBOX VIWER
// ==========================================
const ScreenshotViewer = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current && scrollRef.current.children[currentIndex]) {
            scrollRef.current.children[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentIndex]);

    if (initialIndex === null) return null;

    const handleNext = () => {
        if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
       <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-6 text-white bg-gradient-to-b from-black/50 to-transparent absolute top-0 w-full z-20">
                <span className="text-sm font-medium tracking-wide">{currentIndex + 1} / {images.length}</span>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Navigation Buttons */}
            <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            <button 
                onClick={handleNext} 
                disabled={currentIndex === images.length - 1}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-x-auto flex items-center gap-8 px-8 snap-x snap-mandatory scrollbar-hide w-full h-full"
            >
                {images.map((img, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex justify-center items-center py-8 relative">
                        <img 
                            src={img} 
                            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" 
                            alt={`Screen ${idx + 1}`} 
                        />
                    </div>
                ))}
            </div>
       </div>
    );
};


// ==========================================
// 2. SUB-COMPONENT: RATING STATS
// ==========================================
const RatingStats = React.memo(({ reviews }) => {
    const { counts, total, average } = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => counts[r.rating] = (counts[r.rating] || 0) + 1);
        const total = reviews.length || 0;
        const avg = total > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) 
            : "0.0";
        return { counts, total, average: avg };
    }, [reviews]);

    return (
        <div className="flex flex-col sm:flex-row gap-8 items-center mb-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800">
            <div className="text-center sm:text-left min-w-[120px]">
                <div className="text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {average}
                </div>
                <div className="flex text-green-500 my-2 justify-center sm:justify-start gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(average)) ? "fill-current" : "text-gray-300 dark:text-gray-700 fill-none"}`} />
                    ))}
                </div>
                <p className="text-sm text-gray-500 font-medium">{total} ratings</p>
            </div>
            
            <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-4 text-xs group">
                        <span className="w-3 font-bold text-gray-600 dark:text-gray-400">{star}</span>
                        <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-green-400" 
                                style={{ width: total ? `${(counts[star] / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// ==========================================
// 3. SUB-COMPONENT: DATA SAFETY CARD
// ==========================================
const DataSafetyCard = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="border dark:border-gray-800 rounded-xl overflow-hidden mb-8 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700">
            <button 
                onClick={() => setIsOpen(!isOpen)}
               className="w-full flex justify-between items-center p-5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-expanded={isOpen}
                >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Data safety</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Developer's data collection practices</p>
                    </div>
                </div>
                {isOpen ? <ChevronDown className="dark:text-white w-5 h-5 transition-transform rotate-180" /> : <ChevronRight className="dark:text-white w-5 h-5" />}
            </button>

            {isOpen && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900/30 space-y-5 text-sm animate-in slide-in-from-top-4 duration-300 border-t dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.
                    </p>
                    <div className="space-y-4">
                        {[
                            { icon: Share2, title: "No data shared", desc: "No data shared with third parties" },
                            { icon: Lock, title: "Data encrypted", desc: "Data is encrypted in transit" },
                            { icon: Trash2, title: "Data deletion", desc: "You can request that data be deleted" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <item.icon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-200">{item.title}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="text-green-600 font-medium text-sm hover:underline flex items-center gap-1">
                        See details <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 3.5. SUB-COMPONENT: PERMISSIONS CARD 
// ==========================================
const PermissionsCard = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="border dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 mt-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-expanded={isOpen}
                >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">App permissions</h3>
                        <p className="text-[10px] text-gray-500">Camera, Storage, Network</p>
                    </div>
                </div>
                {isOpen ? <ChevronDown className="dark:text-white w-4 h-4 rotate-180 transition-transform" /> : <ChevronRight className="dark:text-white w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 text-sm animate-in slide-in-from-top-2 border-t dark:border-gray-800">
                    <ul className="space-y-3">
                        {[
                            { l: "Camera", d: "Take pictures for profile avatar" },
                            { l: "Storage", d: "Read/Write for offline content" },
                            { l: "Network", d: "Sync data with cloud server" },
                            { l: "Notifications", d: "Receive updates & alerts" }
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-200 text-xs">{item.l}</p>
                                    <p className="text-gray-500 text-[10px]">{item.d}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="mt-3 text-purple-600 dark:text-purple-400 font-medium text-xs hover:underline">
                        See more
                    </button>
                </div>
            )}
        </div>
    );
};


const formatCount = (num) => {
    if (!num) return "100+"; 
    
    if (num < 10) return "10+";      
    if (num < 50) return "50+";      
    if (num < 100) return "100+";    
    
    // Standard Formatting
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
    
    return num + "+";
};

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const DownloadApp = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const reviewFormRef = useRef(null);

    // States
    const [activeTab, setActiveTab] = useState("mobile"); 
    const [viewImageIndex, setViewImageIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installStatus, setInstallStatus] = useState("installable");

    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [showMenuId, setShowMenuId] = useState(null);
    const [downloadCount, setDownloadCount] = useState("10k+");

    const mobileScreens = useMemo(() => ["/screenshots/mhomepage.jpeg", "/screenshots/msubscriptionspage.jpg", 
         "/screenshots/mpostpage.jpg", "/screenshots/mprofilepage.jpg", "/screenshots/msettingspage.jpg",], []); 
    const desktopScreens = useMemo(() => ["/screenshots/dhomepage.png", "screenshots/dpostpage.png", "/screenshots/dprofilepage.png", 
        "/screenshots/daddpostpage.png",  "screenshots/dhelppage.png"], []);

    // ============================================================
    // LIFECYCLE: PWA INSTALLATION LOGIC
    // ============================================================
    useEffect(() => {
        // 1. Check Standalone Mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            setInstallStatus("active");
        }

        // 2. Check Installed Status via API
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then((apps) => {
                if (apps.length > 0) setInstallStatus("installed");
            }).catch(() => {});
        }

        // 3. Handle Install Prompt Event
        const handleBeforeInstall = (e) => {
            e.preventDefault(); 
            setDeferredPrompt(e);
            setInstallStatus("installable");
        };

        // 4. Handle Successful Installation
        const handleAppInstalled = () => {
            setInstallStatus("installed");
            setDeferredPrompt(null);
            toast.success("App installed successfully! 🚀");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleAppInstalled);

        // Fallback: Check if event fired before mount
        if (window.deferredPrompt) {
            setDeferredPrompt(window.deferredPrompt);
            setInstallStatus("installable");
        }

        // Data Loading
        let isMounted = true;
        const loadData = async () => {
            try {
                const res = await appwriteService.getRatings();
                if (isMounted && res) setReviews(res.documents);

                const totalUsers = await appwriteService.getUserCount();
                
                if (isMounted && totalUsers > 0) {
                    setDownloadCount(formatCount(totalUsers));
                }

                if (userData && appwriteService.getUserReview) {
                    const existing = await appwriteService.getUserReview(userData.$id);
                    if (isMounted && existing) {
                        setAlreadyReviewed(true);
                        setUserRating(existing.rating);
                    }
                }
            } catch (error) {
                console.error("Data Load Error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();

        return () => {
            isMounted = false;
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, [userData]);


    // ============================================================
    // HANDLERS
    // ============================================================
    const handleInstall = async () => {
        // Case A: Running in App
        if (installStatus === "active") {
            toast("You are already using the App!", { icon: "✅" });
            return;
        }

        // Case B: Installed 
        if (installStatus === "installed") {
            toast.success("Opening App...");
            window.location.href = "/"; 
            return;
        }

        // Case C: iOS Instructions
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            toast((t) => (
                <div className="flex flex-col gap-1">
                   <span>Tap <b>Share</b> <Share2 className="w-4 h-4 inline"/> then</span>
                   <span className="font-bold">Add to Home Screen ➕</span>
                </div>
            ), { duration: 5000 });
            return;
        }

        // Case D: Trigger Native Prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            toast.error("Installation option unavailable. Try Chrome menu.");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'MegaBlog App',
            text: 'Read, write and connect on MegaBlog!',
            url: window.location.href,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (error) {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
        }
    };

    const scrollContainerRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 300; 
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const handleReviewAction = useCallback(async (action) => {
        if (!userData) return toast.error("Please login first");
        
        try {
            if (action === "create") {
                if (userRating === 0) return toast.error("Please select a rating");
                
                const res = await appwriteService.addReview({
                    userId: userData.$id,
                    userName: userData.name,
                    userAvatar: userData.prefs?.avatarId || userData.avatarId || "", 
                    rating: userRating,
                    review: reviewText
                });
                setReviews(prev => [res, ...prev]);
                setAlreadyReviewed(true);
                toast.success("Review posted!");
            } 
            else if (action === "update") {
                await appwriteService.updateReview(editingId, { rating: userRating, review: reviewText });
                setReviews(prev => prev.map(r => r.$id === editingId ? { ...r, rating: userRating, review: reviewText } : r));
                toast.success("Review updated!");
                setEditingId(null);
            } 
            else if (action === "delete") {
                await appwriteService.deleteReview(reviewToDelete);
                setReviews(prev => prev.filter(r => r.$id !== reviewToDelete));
                setAlreadyReviewed(false);
                setUserRating(0);
                setReviewText("");
                setShowDeleteModal(false);
                toast.success("Review deleted");
            }
        } catch (error) {
            console.error(error);
            toast.error("Operation failed");
        }
    }, [userData, userRating, reviewText, editingId, reviewToDelete]);

    // Helpers
    const scrollToForm = () => reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const avgRating = useMemo(() => reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "New", [reviews]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-24 px-4 font-sans text-slate-900 dark:text-slate-50">
            <Helmet>
                <title>Download MegaBlog - Official App</title>
                <meta name="description" content="Download the official MegaBlog app for the best reading and writing experience." />
            </Helmet>

            <ScreenshotViewer 
                images={activeTab === "mobile" ? mobileScreens : desktopScreens}
                initialIndex={viewImageIndex}
                onClose={() => setViewImageIndex(null)}
            />

            <div className="max-w-5xl mx-auto">
                
                {/* --- HERO SECTION --- */}
                <div className="flex flex-col md:flex-row gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-6 flex-1 items-start">
                        <div className="relative group shrink-0">
                            <img 
                                src="/icons/pwa-192x192.png" 
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 object-cover group-hover:scale-105 transition-transform duration-300" 
                                alt="App Icon" 
                            />
                            <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
                        </div>
                        
                        <div className="flex flex-col justify-center pt-1">
                            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                                MegaBlog <ShieldCheck className="text-blue-500 fill-blue-500/20 w-7 h-7" />
                            </h1>
                            <p className="text-green-600 dark:text-green-400 font-semibold mb-4 text-base tracking-wide">
                                Official MegaBlog Team
                            </p>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 dark:text-white">{avgRating}</span>
                                    <Star className="w-3.5 h-3.5 fill-gray-900 dark:fill-white" />
                                </div>
                                <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                <span>{reviews.length > 0 ? `${reviews.length} reviews` : "No reviews"}</span>
                                <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                <div className="flex items-center gap-1">
                                    <Download className="w-3.5 h-3.5" /> <span>{downloadCount}</span>
                                </div>
                                <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border dark:border-gray-700">Everyone</span>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN ACTION BUTTONS --- */}
                    <div className="flex flex-row gap-3 mt-2 md:mt-0 md:items-start w-full md:w-auto">
                        <button 
                            onClick={handleInstall}
                            className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-95 whitespace-nowrap min-w-[160px] ${
                                installStatus === "active" || installStatus === "installed"
                                ? "bg-gray-100 text-green-700 border border-green-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-green-400 dark:border-green-900"
                                : "bg-[#01875f] hover:bg-[#017a56] text-white shadow-green-900/20"
                            }`}
                        >
                            {installStatus === "active" ? <ShieldCheck className="w-5 h-5" /> : 
                             installStatus === "installed" ? <Check className="w-5 h-5" /> : 
                             <Download className="w-5 h-5" />}
                            
                            {installStatus === "active" ? "Running App" : 
                             installStatus === "installed" ? "Open App" : 
                             "Install"}
                        </button>
                        <button 
                            onClick={handleShare} 
                            className="px-4 py-3.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                            aria-label="Share App"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* --- SCREENSHOTS --- */}
                <div className="mb-12">
                    {/* Tabs */}
                    <div className="flex gap-8 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b dark:border-gray-800">
                        {['mobile', 'desktop'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all whitespace-nowrap text-sm tracking-wide ${
                                    activeTab === tab 
                                    ? 'text-[#01875f] border-b-[3px] border-[#01875f]' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                            >
                                {tab === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                {tab === 'mobile' ? 'Phone' : 'Tablet & Desktop'}
                            </button>
                        ))}
                    </div>

                    {/* Carousel Container  */}
                    <div className="relative group">
                        
                        {/* Left Button */}
                        <button 
                            onClick={() => scrollCarousel('left')}
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/80 backdrop-blur shadow-lg rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -ml-4 hover:scale-110"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Right Button */}
                        <button 
                            onClick={() => scrollCarousel('right')}
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/80 backdrop-blur shadow-lg rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -mr-4 hover:scale-110"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Scrollable Area */}
                        <div 
                            ref={scrollContainerRef}
                            className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide snap-x cursor-zoom-in scroll-smooth"
                        >
                            {(activeTab === "mobile" ? mobileScreens : desktopScreens).map((src, idx) => (
                                <div key={idx} onClick={() => setViewImageIndex(idx)} className="relative group/img shrink-0 snap-start cursor-pointer">
                                     <img 
                                        src={src} 
                                        className={`rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 group-hover/img:scale-[1.02] ${
                                            activeTab === 'mobile' ? 'h-[420px] w-auto' : 'h-[320px] w-auto'
                                        }`} 
                                        alt={`Screenshot ${idx + 1}`} 
                                     />
                                     {/* Hover Overlay Icon */}
                                     <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors rounded-2xl flex items-center justify-center">
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- GRID LAYOUT --- */}
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                    <div className="md:col-span-2 space-y-10">
                        
                        {/* About Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    About this app <ChevronRight className="w-5 h-5 text-gray-400" />
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-7 mb-6">
                                MegaBlog isn't just a platform; it's a thriving community for storytellers and readers alike. 
                                Designed with speed and simplicity in mind, it offers a seamless experience whether you're 
                                drafting your next masterpiece or exploring trending topics.
                            </p>

                            <div className="bg-green-50/80 dark:bg-green-900/10 p-5 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-green-100 dark:border-green-900/30">
                                <h3 className="font-bold dark:text-white mb-3 text-sm uppercase tracking-wider opacity-80">What's New</h3>
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { t: "AI Features", d: "Smart writing assistant" },
                                        { t: "Offline Mode", d: "Read anywhere, anytime" },
                                        { t: "Real-time Chat", d: "Connect instantly" },
                                        { t: "Dark Mode", d: "Easy on the eyes" }
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-green-600 mt-0.5">✨</span>
                                            <span><b>{feat.t}:</b> {feat.d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <DataSafetyCard />

                        {/* --- RATINGS & REVIEWS --- */}
                        <section id="reviews">
                            <h2 className="text-xl font-bold dark:text-white mb-6">Ratings and reviews</h2>
                            <RatingStats reviews={reviews} />
                            
                            {/* Input Form */}
                            <div ref={reviewFormRef} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border dark:border-gray-800 mb-8 transition-colors">
                                {!userData ? (
                                    <div className="text-center py-6">
                                        <h3 className="font-bold dark:text-white mb-2">Join the conversation</h3>
                                        <p className="text-sm text-gray-500 mb-5">Login to share your thoughts with the community.</p>
                                        <button disabled className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-full text-sm font-medium cursor-not-allowed">
                                            Login to Review
                                        </button>
                                    </div>
                                ) : (alreadyReviewed && !editingId) ? (
                                    <div className="flex flex-col items-center py-6 animate-in zoom-in-95">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="font-bold dark:text-white text-lg">Thanks for sharing!</h3>
                                        <p className="text-sm text-gray-500">Your review helps others make better decisions.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold dark:text-white mb-1">{editingId ? 'Edit your review' : 'Rate this app'}</h3>
                                        <p className="text-xs text-gray-500 mb-5">Tell others what you think.</p>
                                        
                                        <div className="flex gap-3 mb-6">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setUserRating(star)} className="transition-transform hover:scale-110 active:scale-95 focus:outline-none">
                                                    <Star className={`w-9 h-9 ${star <= userRating ? "fill-[#01875f] text-[#01875f]" : "text-gray-300 dark:text-gray-700"}`} />
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <textarea 
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#01875f] outline-none dark:text-white resize-none shadow-sm transition-shadow"
                                            rows="4"
                                            placeholder="Describe your experience (optional)"
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                        />
                                        
                                        <div className="flex justify-end mt-4 gap-3">
                                            {editingId && (
                                                <button 
                                                    onClick={() => { setEditingId(null); setReviewText(""); setUserRating(0); }}
                                                    className="px-5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleReviewAction(editingId ? "update" : "create")}
                                                className="px-8 py-2 bg-[#01875f] text-white rounded-lg text-sm font-medium hover:bg-[#017a56] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                                                disabled={userRating === 0}
                                            >
                                                {editingId ? "Update" : "Post"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-8">
                                {reviews.map((rev) => {
                                    const avatarSrc = rev.userAvatar 
                                        ? appwriteService.getFilePreview(rev.userAvatar) 
                                        : null;

                                    return (
                                        <div key={rev.$id} className="flex gap-4 group">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 shadow border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                                                {avatarSrc ? (
                                                    <img 
                                                        src={avatarSrc} 
                                                        alt={rev.userName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display='none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-gray-500 font-bold text-sm uppercase">
                                                        {rev.userName ? rev.userName.charAt(0) : "U"}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold dark:text-white">{rev.userName || "Unknown User"}</p>
                                                    
                                                    {userData && rev.userId === userData.$id && (
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setShowMenuId(showMenuId === rev.$id ? null : rev.$id)}
                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                                                            >
                                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                            
                                                            {showMenuId === rev.$id && (
                                                                <div className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-lg overflow-hidden z-10 animate-in zoom-in-95 origin-top-right">
                                                                    <button onClick={() => { setEditingId(rev.$id); setUserRating(rev.rating); setReviewText(rev.review); setShowMenuId(null); scrollToForm(); }} className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                                        <Edit2 className="w-3 h-3" /> Edit
                                                                    </button>
                                                                    <button onClick={() => { setReviewToDelete(rev.$id); setShowDeleteModal(true); setShowMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                                        <Trash className="w-3 h-3" /> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-1 mb-2">
                                                    <div className="flex text-[#01875f]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-gray-300 dark:text-gray-700 fill-none"}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {rev.$createdAt ? new Date(rev.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent"}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                                                    {rev.review}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {reviews.length === 0 && (
                                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* --- SIDEBAR INFO --- */}
                <div className="space-y-8">
                    <div className="sticky top-24">
                        <h3 className="text-lg font-bold dark:text-white mb-5 flex items-center gap-2">
                            App Support
                        </h3>
                        
                        {/* Info List */}
                        <div className="space-y-4 text-sm mb-6">
                            {[
                                { l: "Version", v: `v${__APP_VERSION__} (Latest)` },
                                { l: "Updated on", v: "Feb 04, 2026" },
                                { l: "Downloads", v: downloadCount },
                                { l: "Required OS", v: "Android 8.0 / iOS 14.0" },
                                { l: "Offered by", v: "MegaBlog Team" },
                                { l: "Released on", v: "Jan 31, 2026" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between border-b dark:border-gray-800 pb-3 last:border-0">
                                    <span className="text-gray-500">{item.l}</span>
                                    <span className="font-medium dark:text-gray-200 text-right">{item.v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Links Section */}
                        <div className="space-y-3 mb-6">
                            <Link to="/help?tab=privacy" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Privacy Policy</span>
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                            </Link>

                            <Link to="/help?tab=terms" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Terms of Service</span>
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                            </Link>
                        </div>

                        {/* Permissions Card */}
                        <PermissionsCard />
                        
                    </div>
                </div>
                </div>
            </div>

            {/* --- FLOATING ACTION BUTTON --- */}
            <button
                onClick={scrollToForm}
                className="fixed bottom-24 right-6 p-4 bg-[#01875f] hover:bg-[#017a56] text-white rounded-2xl shadow-2xl shadow-green-900/30 transition-transform hover:scale-110 active:scale-95 z-40 md:hidden"
                title="Write a Review"
            >
                <MessageSquarePlus className="w-6 h-6" />
            </button>
    
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={`Delete Review`}
                actionLabel="Delete"
                onAction={() => handleReviewAction("delete")}
                isDanger={true}
                loading={loading}
                confirmationText={null} 
            >
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Are you sure you want to delete your review? 
                </p>
            </Modal>
        </div>
    );
};

export default DownloadApp;