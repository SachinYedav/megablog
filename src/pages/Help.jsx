import React, { useState } from "react";
import { Container, SEO, Button, Input } from "../components"; 
import {
  Search,
  BookOpen,
  Shield,
  FileText,
  Mail,
  Info,
  ChevronDown,
  ChevronUp,
  Github,
  Twitter,
  Linkedin,
  Globe,
  AlertTriangle,
  Server,
  Lock,
  MapPin,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import chatService from "../appwrite/chat";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";



// ==============================
// CONFIGURATION & DATA 
// ==============================

const APP_INFO = {
  name: "MegaBlog",
  version: "1.0.0",
  email: "support@megablog.com",
  copyright: `© ${new Date().getFullYear()} MegaBlog. Built with ❤️ `,
  disclaimer: "Note: This is a portfolio project. Please do not store sensitive financial or personal data.",
};

const SOCIAL_LINKS = [
  { id: "gh", icon: Github, link: "https://github.com/SachinYedav", color: "text-gray-700 dark:text-white", bg: "bg-gray-100 dark:bg-gray-800" },
  { id: "tw", icon: Twitter, link: "https://twitter.com/yourusername", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "li", icon: Linkedin, link: "https://linkedin.com/in/sachinyedav", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
];

const FAQ_DATA = [
  //  1. General Platform Questions
  { 
    id: "gen-1",
    category: "General",
    question: "What is MegaBlog exactly?",
    answer: "MegaBlog is a community-driven publishing platform built for modern writers and developers. It provides a distraction-free environment to read, write, and share stories with a global audience, powered by a high-performance React architecture.",
  },
  {
    id: "gen-2",
    category: "General",
    question: "Is MegaBlog free to use?",
    answer: "Yes, absolutely! MegaBlog is currently free for all users. You can create an account, read unlimited articles, and publish your own stories without any cost. This is an open-portfolio project demonstrating modern web capabilities.",
  },
  { 
    id: "gen-3", 
    category: "General", 
    question: "What makes MegaBlog unique?", 
    answer: "Unlike standard blogs, MegaBlog features real-time collaboration, an AI-powered editor, and instant community interactions, all built on a modern serverless architecture." 
  },

  // 2. Account & Security 
  {
    id: "acc-1",
    category: "Account",
    question: "I forgot my password. How do I recover it?",
    answer: "Don't worry! Go to the Login page and click 'Forgot Password'. We will send a secure OTP (One-Time Password) to your registered email address. Enter that code to reset your password instantly.",
  },
  {
    id: "acc-2",
    category: "Account",
    question: "How do you secure my personal data?",
    answer: "We take security seriously. Your data is stored in Appwrite's encrypted database. We strictly use your email for authentication and essential notifications (like security alerts). We never sell your data to third parties.",
  },
  {
    id: "acc-3",
    category: "Account",
    question: "Can I delete my account permanently?",
    answer: "Yes. We believe in data ownership. You can request account deletion from your Settings page. Please note that this action is irreversible and will remove all your posts and profile data from our servers.",
  },
  {
    id: "cont-1",
    category: "Writing",
    question: "How does the Post Editor work?",
    answer: "We use a highly customized TipTap editor. It offers a Notion-like block editing experience with custom extensions for code highlighting, image handling, and rich text formatting.",
  },
  {
    id: "ai-1",
    category: "AI Features",
    question: "How does the AI integration work?",
    answer: "MegaBlog integrates Google Gemini AI to assist creators. It can automatically generate engaging blog titles and SEO-friendly summaries based on your content, saving you time and boosting visibility.",
  },
  { 
    id: "coll-1", 
    category: "Collab", 
    question: "How does 'Collaborative Editing' work?", 
    answer: "You can invite other users to your draft posts via the 'Manage Access' panel. Once added, they get write permissions to edit content, upload images, and refine the article with you securely." 
  },
  { 
    id: "coll-2", 
    category: "Collab", 
    question: "Is the Chat / Discussion real-time?", 
    answer: "Yes! We use Appwrite Realtime (WebSockets) for our collaboration chats. Messages, alerts, and updates appear instantly on your screen without needing to refresh the page." 
  },
  {
    id: "cont-2",
    category: "Writing",
    question: "Can I upload images to my posts?",
    answer: "Yes! You can upload a featured image for your post. We support major formats like JPG, PNG, and GIF. Images are optimized and stored securely in our cloud buckets.",
  },
  {
    id: "cont-3",
    category: "Writing",
    question: "What happens if I save a post as 'Inactive'?",
    answer: "Inactive posts are saved as Drafts. They will be visible only to you in your dashboard. You can edit them anytime and switch the status to 'Active' when you are ready to publish them to the world.",
  },

  {
    id: "comm-1",
    category: "Community",
    question: "How do Subscriptions work?",
    answer: "If you like an author's work, you can 'Subscribe' to their profile. Their new posts will appear in your 'Fresh Reads' feed, and you'll get notifications when they publish something new.",
  },
  {
    id: "comm-2",
    category: "Safety",
    question: "I see inappropriate content. What should I do?",
    answer: "We maintain a safe community standards. You can report any post by clicking the 'Report' option on the post card. Our moderation team reviews these reports and takes action against violations.",
  },

  //  5. Technical 
  { 
    id: "tech-1", 
    category: "Technical", 
    question: "How do Push Notifications work?", 
    answer: "We use serverless Cloud Functions to handle notifications. When you publish a post, a backend function triggers, fetches your followers, and instantly sends Push Notifications to their devices." 
  },
  { 
    id: "-2", 
    category: "Technical", 
    question: "Do you use third-party email services?", 
    answer: "Our email system (for OTPs and Alerts) is powered by Appwrite Messaging. It runs asynchronously via Cloud Functions to ensure your user experience remains fast and lag-free." 
  },
  {
    id: "tech-3",
    category: "Technical",
    question: "Is this a real startup or a portfolio project?",
    answer: "MegaBlog is a comprehensive Full-Stack Portfolio Project created by Sachin Yedav. It demonstrates advanced skills in React, Redux Toolkit, Appwrite (Backend-as-a-Service), and Tailwind CSS. While fully functional, it is primarily for demonstration purposes.",
  },
  {
    id: "tech-4",
    category: "Technical",
    question: "Can I see the source code?",
    answer: "Yes! This project is open-source. You can find the link to the GitHub repository in the 'About' tab or the footer. Feel free to explore the code structure and contribute.",
  },
];

const LEGAL_CONTENT = {
  privacy: [
    { 
      title: "1. Information We Collect", 
      body: "We collect information you provide directly to us, such as your name, email address, and profile picture. We also automatically collect technical data like your IP address and device information strictly for security purposes (e.g., sending login alerts)." 
    },
    { 
      title: "2. How We Use Your Data", 
      body: "Your information is used to: create and manage your account, authenticate your identity, display your blog posts to the community, and communicate with you regarding security updates (like OTPs or password resets)." 
    },
    { 
      title: "3. Data Storage & Security", 
      body: "We use Appwrite (a secure backend-as-a-service) to store your data. While we implement industry-standard security measures (encryption, SSL), please remember that no method of transmission over the Internet is 100% secure." 
    },
    { 
      title: "4. Cookies & Local Storage", 
      body: "MegaBlog uses local storage and essential session cookies to keep you logged in and remember your preferences (like Light/Dark mode). We do not use third-party tracking cookies for advertising." 
    },
    { 
      title: "5. Content Visibility", 
      body: "Please be aware that any articles, comments, or profile information you post on MegaBlog are public and can be viewed by anyone visiting the site. Do not post sensitive personal information in your articles." 
    },
    { 
      title: "6. Your Rights", 
      body: "You have the right to access, update, or delete your personal information at any time. You can delete your account via the settings page, which will remove your personal data from our servers." 
    }
  ],

  terms: [
    { 
      title: "1. Acceptance of Terms", 
      body: "By accessing or using MegaBlog, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service." 
    },
    { 
      title: "2. User Accounts & Security", 
      body: "You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. MegaBlog cannot and will not be liable for any loss or damage arising from your failure to comply with this." 
    },
    { 
      title: "3. Content Ownership & License", 
      body: "You retain all rights to the content you create ('User Content'). By posting on MegaBlog, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content on the platform." 
    },
    { 
      title: "4. Prohibited Conduct", 
      body: "You agree not to post content that is: illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy. Spamming, phishing, or uploading malware is strictly prohibited." 
    },
    { 
      title: "5. Intellectual Property Rights", 
      body: "Respect the intellectual property of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please contact us immediately." 
    },
    { 
      title: "6. Disclaimer of Warranties", 
      body: "The service is provided on an 'AS-IS' and 'AS AVAILABLE' basis. As this is a portfolio project, we make no warranties regarding uptime, data integrity, or the specific results that may be obtained from the use of the service." 
    },
    { 
      title: "7. Termination", 
      body: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms." 
    },
    { 
      title: "8. Changes to Terms", 
      body: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms." 
    }
  ]
};

const TECH_STACK = [
  { name: "React 18", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { name: "Appwrite Cloud", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  { name: "Redux Toolkit", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { name: "Tailwind CSS", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  { name: "TipTap Editor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { name: "Gemini AI", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
];

// ==========================================
//  SUB-COMPONENTS
// ==========================================

// 1. FAQ Section (With Search)
const FAQSection = () => {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredFAQ = FAQ_DATA.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for answers..." 
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary-light outline-none transition-all shadow-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredFAQ.length > 0 ? filteredFAQ.map((faq) => (
          <div key={faq.id} className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden transition-all hover:border-gray-300 dark:hover:border-gray-700">
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div>
                <span className="text-xs font-bold text-primary-light uppercase tracking-wider mb-1 block">{faq.category}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{faq.question}</span>
              </div>
              {openId === faq.id ? <ChevronUp size={20} className="text-primary-light" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            <div className={`px-5 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed transition-all duration-300 ${openId === faq.id ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
              {faq.answer}
            </div>
          </div>
        )) : (
          <div className="text-center py-10 text-gray-500">No results found for "{search}"</div>
        )}
      </div>
    </div>
  );
};

// 2. Legal Section 
const LegalSection = ({ title, content }) => (
  <div className="max-w-4xl mx-auto animate-in fade-in">
    <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="space-y-10">
        {content.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{section.title}</h3>
            <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 text-justify">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 3. Contact Section (Updated)
// 3. Contact Section (Final Optimized)
const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.auth.userData); 

  //  Form State
  const [formData, setFormData] = useState({
    firstName: userData?.name?.split(" ")[0] || "",
    lastName: userData?.name?.split(" ")[1] || "",
    email: userData?.email || "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await chatService.sendSupportMessage({
          ...formData,
          userId: userData?.$id || null
      });

      if (response) {
        toast.success("Message sent! Check your email for confirmation.");
        // Sirf message clear karein agar user login hai
        setFormData(prev => ({ ...prev, message: "" })); 
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
      
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-100 dark:shadow-black/20 md:order-last"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder="John" 
                    className="bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed" 
                    required 
                    disabled={!!userData} // 🔒 Lock if logged in
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="Doe" 
                    className="bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed" 
                    disabled={!!userData} // 🔒 Lock if logged in
                />
             </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Email</label>
            <Input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="you@company.com" 
                className="bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed" 
                required 
                disabled={!!userData} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Message</label>
            <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                required 
                rows="4" 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-light outline-none transition-all resize-none text-sm" 
                placeholder="Tell us more..."
            ></textarea>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-3 mt-2 font-bold shadow-md">
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>

      <div className="space-y-8 md:order-first flex flex-col justify-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get in touch</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Have a question regarding our services or a technical issue? Fill out the form and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                    <Mail size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">{APP_INFO.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full">
                    <MapPin size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Location</p>
                    <p className="text-gray-900 dark:text-white font-medium">Remote / Worldwide</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
                    <Clock size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Response Time</p>
                    <p className="text-gray-900 dark:text-white font-medium">Within 24 Hours</p>
                </div>
            </div>
        </div>

        {/* Social Links Restored */}
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-4">Follow us</p>
            <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                    <a 
                        key={social.id} 
                        href={social.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-3 rounded-full transition-transform hover:-translate-y-1 ${social.bg} ${social.color}`}
                    >
                        <social.icon size={20} />
                    </a>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

// 4. About Section (Updated)
const AboutSection = () => (
  <div className="max-w-4xl mx-auto animate-in fade-in space-y-16">
    
    {/* 1. Hero / Mission */}
    <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-purple-600">Developers</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Writers</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            MegaBlog started as a vision to create a seamless, distraction-free publishing platform. 
            It combines the performance of modern web technologies with the simplicity of a classic blog. 
            Whether you are documenting your coding journey or sharing life stories, MegaBlog is your canvas.
        </p>
    </div>

    {/* 2. Key Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <AboutCard 
        icon={Server} 
        color="text-blue-500" 
        title="Modern Architecture" 
        desc="Built using a robust React frontend and Appwrite backend, ensuring high performance and scalability." 
      />
      <AboutCard 
        icon={Shield} 
        color="text-green-500" 
        title="Privacy First" 
        desc="We believe in data ownership. You own your content, and we ensure it's stored securely." 
      />
      <AboutCard 
        icon={Globe} 
        color="text-purple-500" 
        title="Open Community" 
        desc="A platform designed to faster connection, allowing readers to engage with content meaningful to them." 
      />
    </div>

    {/* 3. Tech Stack Showcase (Best for Portfolio) */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Powered by Modern Tech</h3>
        <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
                <span key={tech.name} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${tech.color}`}>
                    {tech.name}
                </span>
            ))}
        </div>
    </div>

    {/* 4. Developer Profile */}
    <div className="text-center border-t border-gray-200 dark:border-gray-800 pt-12">
        <p className="text-xs font-bold text-primary-light uppercase tracking-wider mb-2">The Developer</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Crafted with ❤️ by Sachin  Yadav</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            This project represents a deep dive into full-stack development, demonstrating mastery over authentication, database management, and real-time interactions.
        </p>
        
        {/* Social Links Row */}
        <div className="flex justify-center gap-4">
            {SOCIAL_LINKS.map((social) => (
                <a 
                    key={social.id} 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-3 rounded-full transition-transform hover:-translate-y-1 ${social.bg} ${social.color}`}
                >
                    <social.icon size={20} />
                </a>
            ))}
        </div>
    </div>

  </div>
);

const AboutCard = ({ icon: Icon, color, title, desc }) => (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <Icon className={`${color} mb-4`} size={32} />
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

// ==========================================
//  MAIN PAGE COMPONENT
// ==========================================

export default function Help() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userData = useSelector((state) => state.auth.userData);
  const activeTab = searchParams.get("tab") || "help";
  React.useEffect(() => {
    if (activeTab === "contact" && !userData) {
      toast.error("Please login to contact support", {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      setSearchParams({ tab: "help" }); 
    }
  }, [activeTab, userData, setSearchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === "contact" && !userData) {
      toast.error("Please login to contact support", {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return; 
    }

    setSearchParams({ tab: tabId });
  };
  const TABS = [
    { id: "help", label: "FAQ", icon: BookOpen },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "terms", label: "Terms", icon: FileText },
    { id: "about", label: "About", icon: Info },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  return (
    <div className="py-8 w-full min-h-screen">
      <SEO title="Help Center" />
      <Container>
        
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Help & Support</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)} 
              className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id 
                ? "border-primary-light text-primary-light" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.id === "contact" && !userData && <Lock size={14} className="mr-1" />} {/* Optional: Visual Hint */}
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[500px] mb-20 px-2 md:px-0">
          {activeTab === "help" && <FAQSection />}
          {activeTab === "privacy" && <LegalSection title="Privacy Policy" content={LEGAL_CONTENT.privacy} />}
          {activeTab === "terms" && <LegalSection title="Terms of Service" content={LEGAL_CONTENT.terms} />}
          {activeTab === "about" && <AboutSection />}
          {activeTab === "contact" && <ContactSection />}
        </div>

        {/*  Footer Disclaimer  */}
        <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100 transition-opacity">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
             {APP_INFO.disclaimer}
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-2 font-mono uppercase tracking-widest">
             {APP_INFO.copyright}
          </p>
        </div>

      </Container>
    </div>
  );
}