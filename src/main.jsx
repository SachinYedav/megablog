import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";

// Global State & Routing
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Styles
import "./index.css";

// Core Components
import App from "./App.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthGuard from "./components/auth/AuthGuard.jsx";
import AppLayoutSkeleton from "./layouts/AppLayoutSkeleton.jsx";
import OfflinePage from "./components/OfflinePage.jsx";
import NotFound from "./pages/NotFound";

// =================================================================
// LAZY LOADING 
// =================================================================
const Home = lazy(() => import("./pages/Home.jsx"));
const AllPosts = lazy(() => import("./pages/AllPosts.jsx"));
const AddPost = lazy(() => import("./pages/AddPost.jsx"));
const EditPost = lazy(() => import("./pages/EditPost.jsx"));
const Post = lazy(() => import("./pages/Post.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));
const Subscriptions = lazy(() => import("./pages/Subscriptions.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));

const DownloadApp = lazy(() => import("./pages/DownloadApp.jsx"));

// =================================================================
//  HELPER: SUSPENSE WRAPPER
// =================================================================
const LoadPage = ({ children }) => (
  <Suspense fallback={<AppLayoutSkeleton theme="content" />}>
    {children}
  </Suspense>
);

// =================================================================
// ROUTER CONFIGURATION
// =================================================================
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    errorElement: <OfflinePage />,
    children: [
      {
        element: <AppLayout />, 
        children: [
          // ------------------------------------
          //  PUBLIC ROUTES (Accessible to all)
          // ------------------------------------
          { path: "/", element: <LoadPage><Home /></LoadPage> },
          { path: "/all-posts", element: <LoadPage><AllPosts /></LoadPage> },
          { path: "/post/:slug", element: <LoadPage><Post /></LoadPage> },
          { path: "/user/:userId", element: <LoadPage><Profile /></LoadPage> },
          { path: "/download", element: <LoadPage><DownloadApp /></LoadPage> },
          
          // ------------------------------------
          //  PRIVATE ROUTES (Auth Required)
          // ------------------------------------
          {
            path: "/add-post",
            element: <AuthGuard authentication={true}><LoadPage><AddPost /></LoadPage></AuthGuard>,
          },
          {
            path: "/edit-post/:slug",
            element: <AuthGuard authentication={true}><LoadPage><EditPost /></LoadPage></AuthGuard>,
          },
          {
            path: "/profile",
            element: <AuthGuard authentication={true}><LoadPage><Profile /></LoadPage></AuthGuard>,
          },
          {
            path: "/settings",
            element: <AuthGuard authentication={true}><LoadPage><Settings /></LoadPage></AuthGuard>,
          },
          {
            path: "/subscriptions",
            element: <AuthGuard authentication={true}><LoadPage><Subscriptions /></LoadPage></AuthGuard>,
          },
          {
            path: "/help",
            element: <LoadPage><Help /></LoadPage>,
          },
        ],
      },
      // ------------------------------------
      //  ISOLATED ROUTES
      // ------------------------------------
      { 
        path: "/forgot-password", 
        element: <Suspense fallback={<AppLayoutSkeleton theme="full" />}><ForgotPassword /></Suspense> 
      },
      { 
        path: "*", 
        element: <NotFound /> 
    }
    ],
  },
]);

// =================================================================
// APP RENDER
// =================================================================
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);