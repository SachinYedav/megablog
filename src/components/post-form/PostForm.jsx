import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

// Icons
import {
  Image as ImageIcon,
  UploadCloud,
  X,
  Save,
  Send,
  Tag,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  MessageSquare,
  Users,
} from "lucide-react";

// Components
import { Button, Input, PostPreviewModal } from "../index";
import RTE from "../RTE/RTE";
import appwriteService from "../../appwrite/config";
import aiService from "../../ai/gemini";
import CollabChat from "./CollabChat";
import ManageAccessModal from "./ManageAccessModal";

const SUGGESTED_TAGS = ["technology", "lifestyle", "coding", "health", "travel", "food", "business", "ai", "finance"];

const stripHTML = (html = "") => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "").trim();
};

export default function PostForm({ post, onPostSubmit, loading, progress, uploadStage }) {
  // --- STATES ---
  const [preview, setPreview] = useState(post ? appwriteService.getFilePreview(post.featuredImage) : null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTitleGenerated, setIsTitleGenerated] = useState(false);
  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false);
  const [isSummaryGenerated, setIsSummaryGenerated] = useState(false);

  // Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const userData = useSelector((state) => state.auth.userData);

  // --- FORM CONFIG ---
  const { register, handleSubmit, watch, setValue, control, getValues, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active",
      summary: post?.summary || "",
    },
  });

  const watchedValues = watch();

  // 1. Initialize Tags & Auto-Restore
  useEffect(() => {
    if (post && post.tags) {
      setTags(post.tags.split(",").map((t) => t.trim()).filter(Boolean));
    } else if (!post) {
      const savedDraft = localStorage.getItem("post-auto-save");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            reset({
              title: parsed.title || "",
              slug: parsed.slug || "",
              content: parsed.content || "",
              status: "active",
              summary: parsed.summary || "",
            });
            if (parsed.tags) setTags(parsed.tags);
            toast("Draft restored", { icon: "📂", position: "bottom-right" });
          }
        } catch (e) {
          localStorage.removeItem("post-auto-save");
        }
      }
    }
  }, [post, reset]);

  // 2. Auto-Save Logic
  useEffect(() => {
    if (!post) {
      const timeoutId = setTimeout(() => {
        const draftData = {
          title: watchedValues.title,
          slug: watchedValues.slug,
          content: watchedValues.content,
          summary: watchedValues.summary,
          tags: tags,
        };
        localStorage.setItem("post-auto-save", JSON.stringify(draftData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, tags, post]);

  // 3. Image Watcher
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "image" && value.image?.length > 0) {
        setPreview(URL.createObjectURL(value.image[0]));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 4. Slug Transform
  const slugTransform = useCallback((value) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36);
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // 5. Dirty Form Protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, loading]);

  // --- HANDLERS ---
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => setTags(tags.filter((tag) => tag !== tagToRemove));
  const addSuggestedTag = (tag) => {
    if (!tags.includes(tag)) setTags([...tags, tag]);
  };

  // --- AI HANDLERS ---
  const handleAITitle = async () => {
    if (isTitleGenerated) return;
    const plainText = stripHTML(getValues("content"));

    if (plainText.length < 50) return toast.error("Please write some content first (min 50 chars)!!");

    setIsGenerating(true);
    const toastId = toast.loading("🤖 AI is thinking...");
    try {
      const newTitle = await aiService.generateTitle(plainText);
      if (newTitle) {
        setValue("title", newTitle.trim(), { shouldValidate: true });
        setIsTitleGenerated(true);
        toast.success("Title Generated!", { id: toastId }); // Update to Success
      } else {
      throw new Error("Empty response");
      }
    } catch (error) {
     toast.error("AI Generation Failed. Try again.", { id: toastId }); // Update to Error
    } finally {
    setIsGenerating(false);
    }
  };

  const handleAISummary = async () => {
    if (isSummaryGenerated) return;
    const plainText = stripHTML(getValues("content"));

    if (plainText.length < 50) return toast.error("Content is too short for summary!");

    setIsSummaryGenerating(true);
    const toastId = toast.loading("✨ Optimizing for SEO...");

    try {
      const summary = await aiService.generateSummary(plainText);
      if (summary) {
        setValue("summary", summary.trim(), { shouldValidate: true });
        setIsSummaryGenerated(true);
        toast.success("SEO Summary Ready!", { id: toastId });
      } else {
      throw new Error("Empty response");
      }
    } catch (error) {
      toast.error("Summary generation failed.", { id: toastId });
    } finally {
      setIsSummaryGenerating(false);
    }
  };

  // =========================================================
  //  6. VALIDATION & SUBMIT 
  // =========================================================
  
  const validateForm = (data, explicitStatus) => {
      const errorList = [];
      const plainContent = stripHTML(data.content);
      const hasImage = (data.image && data.image.length > 0) || (post && post.featuredImage);

      // A. Common Checks (Required for DB Integrity)
      if (!data.title?.trim()) errorList.push("Title is required");
      if (!data.slug?.trim()) errorList.push("Slug is required");
      
      //  SEO Check: Must have summary even for Drafts
      if (!data.summary?.trim()) errorList.push("SEO Summary is required");
      if (data.summary?.length > 160) errorList.push("Summary too long (Max 160 chars)");

      // B. Publish Specific Checks
      if (explicitStatus === "active") {
          if (plainContent.length < 50) errorList.push("Content is too short (Min 50 chars)");
          if (!post && !hasImage) errorList.push("Cover image is required to publish");
      }

      return errorList;
  };

  const onSubmit = async (data, explicitStatus) => {
    // Step 1: Validate
    const validationErrors = validateForm(data, explicitStatus);
    if (validationErrors.length > 0) {
      return toast.error(validationErrors[0]);
  }

    
    const currentAuthorName = post?.authorName || userData?.name || "Anonymous";
    const tagString = tags.join(" "); 
    const searchString = `${data.title} ${data.summary} ${tagString} ${currentAuthorName}`;

    // Step 2: Prepare Final Data
      const finalData = {
      ...data,
      tags: tags.join(","), 
      authorName: currentAuthorName,
      searchIndex: searchString.trim() 
    };

    if (explicitStatus === 'inactive') {
    toast.loading("Saving Draft...", { duration: 2000 });
    } else {
    toast.loading("Publishing Post...", { duration: 2000 });
    }

    // Step 3: Submit to Parent
    await onPostSubmit({
      data: finalData,
      explicitStatus: explicitStatus,
    existingPost: post,
    });
  };

  // =========================================================
  //  RENDER
  // =========================================================

  return (
    <div className="relative w-full">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold dark:text-white">{post ? "Edit Post" : "Create Post"}</h2>
        <div className="flex gap-2">
          {post && userData && post.userId === userData.$id && (
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Users size={18} />
              <span className="hidden md:inline">Access</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsChatModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">Collab Chat</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative">
        
        {/* --- LEFT: EDITOR AREA --- */}
        <div className="w-full lg:flex-1 min-w-0 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            
            {/* Title & AI */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-500">Title <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={handleAITitle}
                  disabled={isGenerating || isTitleGenerated}
                  className={`text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm border
                    ${isTitleGenerated
                      ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                      : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:shadow-md active:scale-95"} 
                    disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : isTitleGenerated ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                  {isGenerating ? "Thinking..." : isTitleGenerated ? "Generated" : "AI Title"}
                </button>
              </div>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="Article Title..."
                className="text-2xl md:text-3xl font-extrabold border-none px-0 shadow-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 bg-transparent"
              />
            </div>

            {/* Slug */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg flex items-center text-xs text-gray-500 font-mono overflow-hidden">
              <span className="font-bold mr-2 shrink-0">slug:</span>
              <input {...register("slug", { required: true })} className="bg-transparent w-full outline-none text-gray-600 dark:text-gray-400" />
            </div>

            {/* RTE */}
            <div className="min-h-[500px]">
              <RTE name="content" control={control} defaultValue={getValues("content")} />
            </div>
          </div>
        </div>

        {/* --- RIGHT: SIDEBAR --- */}
        <div className="w-full lg:w-96 space-y-6 h-fit lg:sticky lg:top-24 pb-8">
          
          {/* 1. Image Upload */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <ImageIcon size={18} className="text-primary-light" /> Cover Image
            </h3>
            <div
              className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-light transition-colors group cursor-pointer"
              onClick={() => document.getElementById("hidden-file").click()}
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <UploadCloud size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-medium">Click to upload</span>
                </div>
              )}
              {preview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue("image", null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <input
              type="file"
              id="hidden-file"
              accept="image/*"
              className="hidden"
              {...register("image")}
              onChange={(e) => {
                register("image").onChange(e);
                if (e.target.files?.[0]) setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </div>

          {/* 2. Tags */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-200">
              <Tag size={16} className="inline mr-2" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-md flex items-center gap-1 font-medium animate-in zoom-in">
                  #{tag} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag + Enter"
              className="text-xs bg-gray-50 dark:bg-gray-800 border-none mb-3"
            />
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addSuggestedTag(tag)}
                    disabled={tags.includes(tag)}
                    className="text-[10px] px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SEO Summary (Mandatory) */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                SEO Summary <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={handleAISummary}
                disabled={isSummaryGenerating || isSummaryGenerated}
                className={`text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm border ${
                  isSummaryGenerated ? "bg-green-50 text-green-600 border-green-200 cursor-default" : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:shadow-md active:scale-95"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isSummaryGenerating ? <Loader2 size={12} className="animate-spin" /> : isSummaryGenerated ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                {isSummaryGenerating ? "Writing..." : isSummaryGenerated ? "Generated" : "Auto-Generate"}
              </button>
            </div>
            <textarea
              {...register("summary", { required: "Summary is required" })}
              className={`w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs outline-none focus:ring-1 resize-none h-24 border transition-all ${
                  watch("summary")?.length > 160 ? "border-red-500 focus:ring-red-500" : "border-transparent focus:border-primary-light focus:ring-primary-light"
              }`}
              placeholder="Required. Describe content for Google & Social Media (Max 160 chars)"
            />
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-red-500 font-bold h-4 block">{errors.summary?.message}</span>
                <span className={`text-[10px] ${watch("summary")?.length > 160 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                    {watch("summary")?.length || 0}/160
                </span>
            </div>
          </div>

          {/* 4. ACTIONS */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 lg:sticky lg:top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Send size={18} className="text-primary-light" /> Actions
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, "inactive"))}
                disabled={loading}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-0 justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Save size={16} className="mr-2" /> Save Draft
              </Button>

              <Button type="button" onClick={() => setIsPreviewOpen(true)} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-0 justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
                <Eye size={16} className="mr-2" /> Preview
              </Button>
            </div>

            <Button
              onClick={handleSubmit((data) => onSubmit(data, "active"))}
              disabled={loading}
              className="w-full justify-center relative overflow-hidden py-3 text-white shadow-lg shadow-primary-light/30 bg-gradient-to-r from-primary-light to-purple-600"
            >
              {loading && <div className="absolute left-0 top-0 h-full bg-black/20 transition-all duration-300" style={{ width: `${progress}%` }}></div>}
              <span className="relative flex items-center justify-center z-10 font-bold w-full ">
                {loading ? <>{Math.round(progress)}% {uploadStage}</> : <><Send size={18} className="mr-2" /> {post ? "Update & Publish" : "Publish Now"}</>}
              </span>
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 py-2 rounded-lg">
              <AlertCircle size={12} /> <span>Drafts are private until published</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative">
            {post ? (
              <CollabChat postId={post.$id} onClose={() => setIsChatModalOpen(false)} />
            ) : (
              <div className="p-8 text-center">
                <button onClick={() => setIsChatModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Save Draft First</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Collaboration features require this post to be saved securely in the cloud as a <span className="font-bold text-gray-700 dark:text-gray-300">Private Draft</span>.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    disabled={loading}
                    onClick={handleSubmit((data) => {
                      onSubmit(data, "inactive");
                    })}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {loading ? "Saving..." : "Save & Start Chat"}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setIsChatModalOpen(false)}
                    className="w-full py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isAccessModalOpen && post && (
        <ManageAccessModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          postId={post.$id}
          chatId={`draft_${post.$id.substring(0, 30)}`}
          ownerId={post.userId}
          currentParticipants={[]}
        />
      )}

      <PostPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={getValues()}
        imagePreview={preview}
        tags={tags}
        onPublish={handleSubmit((data) => onSubmit(data, "active"))}
      />
    </div>
  );
}