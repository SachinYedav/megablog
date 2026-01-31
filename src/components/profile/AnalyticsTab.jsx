import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  ThumbsUp,
  Zap,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import AnalyticsSkeleton from "./skeletons/AnalyticsSkeleton";

export default function AnalyticsTab({ posts, loading }) {
  // Toggle State for "View All" posts in table
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) return <AnalyticsSkeleton />;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 animate-in fade-in zoom-in">
        <Activity size={40} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
          No Analytics Yet
        </h3>
        <p className="text-gray-500 mt-2">
          Publish your first post to see insights.
        </p>
      </div>
    );
  }

  // ==========================================
  //  DATA CALCULATIONS
  // ==========================================

  const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0);
  const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);

  // Engagement Rate Calculation
  const engagementRate = totalViews > 0 
    ? ((totalLikes / totalViews) * 100).toFixed(1) 
    : 0;

  // Prepare Chart Data (Reversed for Chronological Order)
  const chartData = [...posts].reverse().map((post) => ({
    title: post.title.length > 15 ? post.title.substring(0, 15) + "..." : post.title,
    views: post.views || 0,
    likes: post.likes?.length || 0,
    date: new Date(post.$createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Determine Table Data 
  const tableData = isExpanded ? posts : posts.slice(0, 5);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl">
          <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-indigo-500 font-semibold flex items-center gap-2">
              <Eye size={14} /> {payload[0].value} Views
            </p>
            {payload[1] && (
              <p className="text-sm text-pink-500 font-semibold flex items-center gap-2">
                <ThumbsUp size={14} /> {payload[1].value} Likes
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // ==========================================
  //  RENDER UI
  // ==========================================
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- 1. KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Total Views */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Eye size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 text-indigo-100">
              <Eye size={18} /> Total Views
            </div>
            <h3 className="text-4xl font-extrabold">{totalViews.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card: Total Likes */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-pink-500/20 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ThumbsUp size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 text-pink-100">
              <ThumbsUp size={18} /> Total Likes
            </div>
            <h3 className="text-4xl font-extrabold">{totalLikes.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card: Engagement Rate */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
              <Zap size={24} />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${Number(engagementRate) > 5 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {Number(engagementRate) > 5 ? "High" : "Avg"}
            </span>
          </div>
          <div>
            <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Engagement Rate</h4>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{engagementRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. GROWTH CHART --- */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-primary-light" /> Growth Overview
        </h3>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] h-[260px] sm:h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- 3. POST PERFORMANCE TABLE --- */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Post Performance Report</h3>
          
          {/* View All Toggle */}
          {posts.length > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary-light font-bold hover:underline flex items-center gap-1"
            >
              {isExpanded ? <>Show Less <ChevronUp size={16} /></> : <>View All ({posts.length}) <ChevronDown size={16} /></>}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500">
                <th className="px-6 py-4 font-semibold">Post Title</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-center">Views</th>
                <th className="px-6 py-4 font-semibold text-center">Likes</th>
                <th className="px-6 py-4 font-semibold text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((post) => (
                <tr key={post.$id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{post.title}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(post.$createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md text-xs font-bold">
                      <Eye size={12} /> {post.views}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 rounded-md text-xs font-bold">
                      <ThumbsUp size={12} /> {post.likes.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
                          style={{
                            width: `${Math.min((post.views / (Math.max(...posts.map((p) => p.views)) || 1)) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Toggle */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <button onClick={() => setIsExpanded(false)} className="text-sm text-gray-500 hover:text-primary-light transition-colors font-medium">
              Collapse List
            </button>
          </div>
        )}
      </div>
    </div>
  );
}