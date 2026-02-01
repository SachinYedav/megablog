import conf from "../conf/conf.js";
import { Client, Account, ID, Functions } from "appwrite";

export class AuthService {
  client = new Client();
  account;
  functions;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
    this.functions = new Functions(this.client);
  }

  // ==========================================
  // INTERNAL HELPER 
  // ==========================================
  async callAuthFunction(data) {
    try {
      const functionId = conf.appwriteFunctionAuthId;
      const execution = await this.functions.createExecution(
        functionId,
        JSON.stringify(data),
        false 
      );

      let response;
      try {
        response = JSON.parse(execution.responseBody);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error(`AuthService :: ${data.action} :: error`, error);
      throw error;
    }
  }

  // ==========================================
  //  CORE AUTHENTICATION
  // ==========================================

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      if (userAccount) {
        return this.login({ email, password });
      } else {
        return userAccount;
      }
    } catch (error) {
      console.error("AuthService :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      // Safety: Clear stale sessions
      try { await this.account.deleteSessions(); } catch (e) {}
      
      const session = await this.account.createEmailPasswordSession(email, password);
      
      if (session) {
         this.triggerLoginAlert(email); 
      }

      return session;
    } catch (error) {
      console.error("AuthService :: login", error);
      throw error;
    }
  }

  async googleLogin() {
    try {
      return this.account.createOAuth2Session(
        "google",
        `${window.location.origin}/`, // Success URL
        `${window.location.origin}/login` // Fail URL
      );
    } catch (error) {
      console.error("AuthService :: googleLogin :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      return null;
    }
  }

  // LOGOUT 
  async logout() {
    try {
      await this.deleteCurrentPushTarget();
      await this.account.deleteSession("current");
    } catch (error) {
      console.error("AuthService :: logout :: error", error);
    }
  }

  // ==========================================
  //  PUSH NOTIFICATIONS 
  // ==========================================

  async createPushTarget(token) {
    try {
      if (!token) return false;
      const providerId = import.meta.env.VITE_APPWRITE_FCM_PROVIDER_ID;
      
      // 1. Check LocalStorage 
      const savedId = localStorage.getItem("push_target_id");
      const savedToken = localStorage.getItem("fcm_token_cache");

      if (savedId && savedToken === token) {
          return true; 
      }

      // 2. Optimistic Creation
      try {
          const target = await this.account.createPushTarget(
            ID.unique(),
            token,
            providerId
          );
          
          // Success: Save ID
          localStorage.setItem("push_target_id", target.$id);
          localStorage.setItem("fcm_token_cache", token);
          console.log("✅ Push Target Created:", target.$id);
          return true;

      } catch (serverError) {
          // 3. Handle Conflict 
          if (serverError.code === 409 || serverError.type === 'general_argument_invalid') {
              console.log("⚠️ Target exists on server. Fetching ID for sync...");
              
              try {
                  const list = await this.account.listTargets();
                  const existingTarget = list.targets.find(t => t.identifier === token && t.providerId === providerId);
                  
                  if (existingTarget) {
                      localStorage.setItem("push_target_id", existingTarget.$id);
                      localStorage.setItem("fcm_token_cache", token);
                      console.log("♻️ Synced ID from Server:", existingTarget.$id);
                      return true;
                  }
              } catch (e) {
                  console.warn("Sync warning:", e);
              }
              return true; 
          }
          throw serverError;
      }

    } catch (error) {
      console.error("❌ Push Setup Failed:", error);
      return false;
    }
  }

  // CLEANUP HELPER 
  async deleteCurrentPushTarget() {
    try {
        const targetId = localStorage.getItem("push_target_id");
        if (targetId) {
            await this.account.deletePushTarget(targetId);
            console.log("🗑️ Push Target Deleted from Server");
        }
    } catch (error) {
        if (error.code !== 404) {
            console.warn("⚠️ Delete Target Failed:", error);
        }
    } finally {
        localStorage.removeItem("push_target_id");
        localStorage.removeItem("fcm_token_cache");
    }
  }

  // ==========================================
  //  VERIFY PASSWORD & DELETE ACCOUNT 
  // ==========================================
  async verifyPassword(email, password) {
    try {
      const execution = await this.functions.createExecution(
        conf.appwriteFunctionAuthId,
        JSON.stringify({ 
            action: "verifyPassword", 
            email, 
            password 
        }),
        false 
      );

      const response = JSON.parse(execution.responseBody);
      
      if (response.success === false) {
        throw new Error(response.error || "Verification failed");
      }

      return response.valid; 
    } catch (error) {
      console.error("Verify Password Error:", error.message);
      return false; 
    }
  }

  async deleteAccount() {
    try {
      const execution = await this.functions.createExecution(
        conf.appwriteFunctionAuthId,
        JSON.stringify({ action: "deleteAccount" }),
        false 
      );

      const response = JSON.parse(execution.responseBody);

      if (response.success) {
        await this.deleteCurrentPushTarget();
        await this.account.deleteSessions('current');
        return true;
      } else {
        throw new Error(response.message || "Deletion failed");
      }
    } catch (error) {
      console.error("AuthService :: deleteAccount :: error", error);
      try { await this.account.deleteSessions('current'); } catch(e){}
      return true;
    }
  }

  // ==========================================
  //  OTHER HELPERS 
  // ==========================================
  async sendVerificationEmail() {
    try {
      return await this.account.createVerification(
        `${window.location.origin}/verify-email`
      );
    } catch (error) {
      console.log("AuthService :: sendVerificationEmail :: error", error);
      throw error;
    }
  }

  async sendPasswordResetOTP(email) {
    return await this.callAuthFunction({
      action: "sendOtp",
      email: email,
    });
  }

  async verifyOtpAndReset({ email, otp, newPassword }) {
    return await this.callAuthFunction({
      action: "resetPassword",
      email: email,
      otp: otp,
      newPassword: newPassword,
    });
  }

  async updateName(name) {
    try {
      return await this.account.updateName(name);
    } catch (error) {
      console.error("AuthService :: updateName :: error", error);
      throw error;
    }
  }

  async updateEmail({ email, password }) {
    try {
      return await this.account.updateEmail(email, password);
    } catch (error) {
      console.error("AuthService :: updateEmail :: error", error);
      throw error;
    }
  }

  async updatePassword({ newPassword, oldPassword }) {
    try {
      return await this.account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error("AuthService :: updatePassword :: error", error);
      throw error;
    }
  }

  async getUserLogs() {
    try {
      return await this.account.listLogs();
    } catch (error) {
      return [];
    }
  }

  async triggerWelcomeEmail(email, name) {
    this.callAuthFunction({
      action: "welcomeEmail",
      email: email,
      name: name,
    }).catch((err) => console.error("Welcome Email Failed:", err));
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    let device = "Desktop";

    if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Microsoft Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";

    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    if (os === "Android") {
        device = "Android Mobile";
        const match = ua.match(/Android.*;\s([a-zA-Z0-9\s\-\.]+)\sBuild/);
        if (match && match[1]) {
            device = match[1]; 
        }
    } else if (os === "iOS") {
        if (ua.indexOf("iPhone") > -1) device = "iPhone";
        else if (ua.indexOf("iPad") > -1) device = "iPad";
    }

    return `${device} (${os}) - ${browser}`;
  }

  async triggerLoginAlert(email) {
    const deviceInfo = this.getDeviceInfo(); 
    this.callAuthFunction({
      action: "loginAlert",
      email: email,
      deviceInfo: deviceInfo, 
      ipAddress: "Determined by Server", 
    }).catch(err => console.error("Login Alert Trigger Failed:", err));
  }
}

const authService = new AuthService();
export default authService;