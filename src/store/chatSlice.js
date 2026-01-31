import { createSlice } from "@reduxjs/toolkit";

// =================================================================
//  HELPER: LOAD FROM STORAGE
// =================================================================

const loadUserFromStorage = () => {
  try {
    const savedUserData = localStorage.getItem("userData");
    return savedUserData ? JSON.parse(savedUserData) : null;
  } catch (e) {
    console.warn("Failed to load user from storage", e);
    return null;
  }
};

// Initialize immediately
const savedUser = loadUserFromStorage();

const initialState = {
  status: !!savedUser,      
  userData: savedUser,      
  isAuthModalOpen: false,   
  authMode: "login",        
  isHydrated: !!savedUser,  
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // -------------------------------------------------------------
    // 1. LOGIN ACTION
    // -------------------------------------------------------------
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData; 
      state.isAuthModalOpen = false;
      state.isHydrated = true;
      
      localStorage.setItem("userData", JSON.stringify(action.payload.userData));
    },

    // -------------------------------------------------------------
    // 2. LOGOUT ACTION
    // -------------------------------------------------------------
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.isHydrated = true;
      
      localStorage.removeItem("userData");
    },

    // -------------------------------------------------------------
    // 3. UPDATE PROFILE 
    // -------------------------------------------------------------
    updateUserProfile: (state, action) => {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
          prefs: {
            ...state.userData.prefs,
            ...action.payload
          }
        };
        
        localStorage.setItem("userData", JSON.stringify(state.userData));
      }
    },

    // -------------------------------------------------------------
    // 4. UI HELPERS
    // -------------------------------------------------------------
    finishHydration: (state) => {
      state.isHydrated = true;
    },

    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authMode = action.payload || "login";
    },
    
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    
    toggleAuthMode: (state) => {
      state.authMode = state.authMode === "login" ? "signup" : "login";
    },
  },
});

export const { 
  login, 
  logout, 
  updateUserProfile, 
  finishHydration,
  openAuthModal, 
  closeAuthModal, 
  toggleAuthMode 
} = authSlice.actions;

export default authSlice.reducer;