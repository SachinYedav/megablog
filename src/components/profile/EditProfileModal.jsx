import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Input } from "../index"; 
import { Link as LinkIcon, Twitter, Code, Loader2 } from "lucide-react";
import useDebounce from "../../hooks/useDebounce"; 
import appwriteService from "../../appwrite/config";

export default function EditProfileModal({
  isOpen,
  onClose,
  userProfile,
  onUpdate,
  loading,
}) {
  const { register, handleSubmit, reset, watch } = useForm();
  
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile) {
      let extraDetails = {};
      try {
        extraDetails = userProfile.prefs ? JSON.parse(userProfile.prefs) : {};
      } catch (e) {
        extraDetails = {};
      }

      reset({
        name: userProfile.name || "",
        username: userProfile.username || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: extraDetails.website || "",
        twitter: extraDetails.twitter || "",
        skills: extraDetails.skills || "",
      });
      setUsernameAvailable(true);
      setCheckingUsername(false);
    }
  }, [isOpen, userProfile, reset]);

  const usernameValue = watch("username");
  const debouncedUsername = useDebounce(usernameValue, 500);

  useEffect(() => {
    const checkAvailability = async () => {
       if (!debouncedUsername || debouncedUsername === userProfile?.username) {
           setUsernameAvailable(true);
           return;
       }

       const isValid = /^[a-zA-Z0-9_.]+$/.test(debouncedUsername);
       if (!isValid) { 
           setUsernameAvailable(false); 
           return; 
       }

       setCheckingUsername(true);
       const isFree = await appwriteService.checkUsernameAvailability(debouncedUsername);
       setUsernameAvailable(isFree);
       setCheckingUsername(false);
    };

    if (isOpen && debouncedUsername) checkAvailability();
  }, [debouncedUsername, userProfile, isOpen]);


  const onSubmit = (data) => {
    if (!usernameAvailable || checkingUsername) return;

    const { website, twitter, skills, ...mainFields } = data;
    const finalData = {
        ...mainFields, 
        website,      
        twitter,       
        skills         
    };
    onUpdate(finalData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      actionLabel="Save Changes"
      onAction={handleSubmit(onSubmit)}
      loading={loading}
      disabled={!usernameAvailable || checkingUsername}
    >
      <div className="space-y-5">
        <Input
          label="Full Name"
          placeholder="Enter your name"
          {...register("name", { required: true })}
        />

        {/* Username Edit Field */}
        <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
             </label>
             <div className="relative">
                 <input
                    {...register("username", { 
                        required: true, 
                        minLength: 4, 
                        pattern: /^[a-zA-Z0-9_.]+$/
                    })}
                   className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border outline-none text-sm transition-all ${
                      usernameValue?.length > 3
                      ? usernameAvailable
                          ? "border-green-500 focus:border-green-500"
                          : "border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-primary-light"
                      }`}

                    placeholder="unique_username"
                 />
                 <div className="absolute right-3 top-2.5 flex items-center">
                    {checkingUsername && <Loader2 size={16} className="animate-spin text-gray-400"/>}
                    
                    {!checkingUsername && usernameValue !== userProfile?.username && usernameValue?.length > 3 && (
                        usernameAvailable 
                       ? <span className="text-green-500 text-xs font-bold">✓</span>
                      : <span className="text-red-500 text-xs font-bold">✕</span>
                    )}
                 </div>
             </div>
             {!usernameAvailable && !checkingUsername && (
                 <p className="text-[10px] text-red-500">Username is invalid or already taken.</p>
             )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <textarea {...register("bio")} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary-light resize-none text-sm" rows="3" placeholder="Tell us about yourself..."></textarea>
        </div>

        <Input label="Location" placeholder="e.g. Jaipur, India" {...register("location")} />

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Socials & Skills</h4>
          <div className="space-y-3">
            <div className="relative"><LinkIcon size={16} className="absolute left-3 top-3 text-gray-400" /><input {...register("website")} placeholder="Website URL" className="w-full pl-10 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary-light text-sm" /></div>
            <div className="relative"><Twitter size={16} className="absolute left-3 top-3 text-gray-400" /><input {...register("twitter")} placeholder="Twitter Handle (no @)" className="w-full pl-10 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary-light text-sm" /></div>
            <div className="relative"><Code size={16} className="absolute left-3 top-3 text-gray-400" /><input {...register("skills")} placeholder="Skills (React, Node.js, Design...)" className="w-full pl-10 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary-light text-sm" /></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}