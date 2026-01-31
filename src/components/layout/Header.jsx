import React from "react";
import { Container, Logo } from "../index";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ThemeBtn } from "../index";
import NotificationBell from "../NotificationBell";
import { openAuthModal } from "../../store/authSlice";

import { Settings } from "lucide-react";

function Header() {
  const { status: authStatus, userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    // Sticky Top Bar
    <header className="py-3 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors border-b border-gray-100 dark:border-gray-800">
      <Container>
        <nav className="flex items-center justify-between">
          {/* --- LEFT: LOGO --- */}
          <div className="mr-4 flex-shrink-0">
            <Link to="/">
              <Logo width="45px" />
            </Link>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeBtn />

            {authStatus ? (
              <>
                {/* Notification Bell */}
                <div className="flex-shrink-0">
                  <NotificationBell />
                </div>

                {/* 1. Mobile Only: Settings Button */}
                <button
                  onClick={() => navigate("/settings")}
                  className="md:hidden p-2 rounded-full text-gray-500 hover:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title="Settings"
                >
                  <Settings size={22} />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-r from-primary-light to-purple-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 flex-shrink-0 cursor-pointer"
                  title="Go to Profile"
                >
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(openAuthModal("login"))}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-light transition-colors hidden xs:block"
                >
                  Log in
                </button>

                <button
                  onClick={() => dispatch(openAuthModal("signup"))}
                  className="px-4 py-1.5 text-sm font-bold bg-primary-light text-white rounded-full hover:bg-primary-dark hover:shadow-lg transition-all flex-shrink-0"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
