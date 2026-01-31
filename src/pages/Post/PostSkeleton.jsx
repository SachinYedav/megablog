import React from "react";
import Skeleton from "../../components/Skeleton"; 

const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          
          {/* =========================================
              LEFT / MAIN CONTENT (8 Columns)
             ========================================= */}
          <div className="lg:col-span-8">
            
            {/* 1. Category / Date */}
            <div className="flex gap-3 mb-4">
               <Skeleton width="80px" height="14px" />
               <Skeleton width="120px" height="14px" />
            </div>

            {/* 2. Huge Title */}
            <div className="space-y-3 mb-6">
               <Skeleton width="90%" height="40px" />
               <Skeleton width="75%" height="40px" />
            </div>

            {/* 3. Author Block (Top Border) */}
            <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-gray-800 mb-8">
               <div className="flex items-center gap-4">
                  <Skeleton width="48px" height="48px" circle={true} />
                  <div className="space-y-2">
                     <Skeleton width="120px" height="18px" />
                     <Skeleton width="80px" height="14px" />
                  </div>
               </div>
               <Skeleton width="100px" height="36px" className="rounded-full" />
            </div>

            {/* 4. Featured Image */}
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-10">
               <Skeleton width="100%" height="100%" className="rounded-none" />
            </div>

            {/* 5. Ad Slot (Top) */}
            <div className="mb-10">
               <Skeleton width="100%" height="120px" />
            </div>

            {/* 6. Content Body (Simulating Paragraphs) */}
            <div className="space-y-4 mb-10">
               <Skeleton width="100%" height="16px" />
               <Skeleton width="95%" height="16px" />
               <Skeleton width="98%" height="16px" />
               <Skeleton width="60%" height="16px" />
               <br />
               <Skeleton width="100%" height="16px" />
               <Skeleton width="90%" height="16px" />
               <Skeleton width="95%" height="16px" />
            </div>

            {/* 7. Tags Row */}
            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
               <Skeleton width="80px" height="28px" className="rounded-lg" />
               <Skeleton width="80px" height="28px" className="rounded-lg" />
               <Skeleton width="80px" height="28px" className="rounded-lg" />
            </div>

            {/* 8. Action Bar (Desktop) */}
            <div className="hidden md:flex items-center justify-between mt-8 py-4 border-y border-gray-100 dark:border-gray-800">
               <div className="flex gap-4">
                  <Skeleton width="80px" height="32px" className="rounded-full" />
                  <Skeleton width="80px" height="32px" className="rounded-full" />
               </div>
               <div className="flex gap-2">
                  <Skeleton width="36px" height="36px" className="rounded-lg" />
                  <Skeleton width="36px" height="36px" className="rounded-lg" />
               </div>
            </div>

            {/* 9. Comments Section Skeleton */}
            <div className="mt-12 space-y-6">
               <Skeleton width="150px" height="24px" />
               {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                     <Skeleton width="40px" height="40px" circle={true} />
                     <div className="flex-1 space-y-2">
                        <Skeleton width="30%" height="14px" />
                        <Skeleton width="100%" height="40px" />
                     </div>
                  </div>
               ))}
            </div>
          </div>

          {/* =========================================
              RIGHT / SIDEBAR (4 Columns)
             ========================================= */}
          <div className="hidden lg:block lg:col-span-4">
             <div className="space-y-8 sticky top-24">
                
                {/* 1. Square Ad */}
                <Skeleton width="100%" height="300px" className="rounded-xl" />

                {/* 2. Recommended Posts Box */}
                <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                   <Skeleton width="150px" height="20px" className="mb-4" />
                   <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                         <div key={i} className="flex gap-3">
                            <Skeleton width="60px" height="60px" className="rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                               <Skeleton width="90%" height="14px" />
                               <Skeleton width="60%" height="12px" />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* 3. Newsletter Box */}
                <Skeleton width="100%" height="180px" className="rounded-2xl" />

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;