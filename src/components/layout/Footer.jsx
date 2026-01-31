import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { openAuthModal } from "../../store/authSlice"; 
import { Home, Compass, PlusCircle, Users, User } from "lucide-react";

export default function Footer() {
  const dispatch = useDispatch();
  const { status: authStatus } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={24} />, public: true },
    {
      name: "Explore",
      path: "/all-posts",
      icon: <Compass size={24} />,
      public: true,
    },

    {
      name: "Add",
      path: "/add-post",
      icon: <PlusCircle size={32} />,
      public: false,
      isSpecial: true,
    },
    {
      name: "Subs",
      path: "/subscriptions",
      icon: <Users size={24} />,
      public: false,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={24} />,
      public: false,
    },
  ];

  const handleNavClick = (e, item) => {
    if (!item.public && !authStatus) {
      e.preventDefault();
      dispatch(openAuthModal("login"));
    }
  };

  return (
    <footer className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={(e) => handleNavClick(e, item)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive
                  ? "text-primary-light"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.isSpecial ? (
                  <div
                    className={`
                    -mt-6 p-3 rounded-full shadow-lg border-4 border-gray-50 dark:border-gray-900 transform transition-transform active:scale-95
                    ${
                      isActive
                        ? "bg-primary-light text-white"
                        : "bg-primary-light text-white"
                    }
                  `}
                  >
                    {item.icon}
                  </div>
                ) : (
                  <>
                    <span
                      className={`transform transition-transform duration-200 ${
                        isActive ? "-translate-y-1" : ""
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-[10px] font-medium mt-1 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </footer>
  );
}
