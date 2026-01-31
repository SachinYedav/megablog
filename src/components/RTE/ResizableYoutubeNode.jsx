import { NodeViewWrapper } from "@tiptap/react";
import React, { useRef, useState, useMemo } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2, AlertTriangle } from "lucide-react";

export default function ResizableYoutubeNode(props) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const [isResizing, setIsResizing] = useState(false);
  const [isError, setIsError] = useState(false);
  const containerRef = useRef(null);

  const embedUrl = useMemo(() => {
    const src = node.attrs.src;
    if (!src) { setIsError(true); return ""; }
    if (src.includes("/embed/")) return src;
    const videoIdMatch = src.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : src;
  }, [node.attrs.src]);

  const setAlign = (align) => updateAttributes({ textAlign: align });

  const handleResizeStart = (e) => {
    if (e.type === 'mousedown') e.preventDefault();
    setIsResizing(true);

    const startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const startWidth = containerRef.current ? containerRef.current.offsetWidth : 0;

    const onMove = (moveEvent) => {
      const currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const diffX = currentX - startX;
      updateAttributes({ width: Math.max(320, startWidth + diffX) });
    };

    const onEnd = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  };

  return (
    <NodeViewWrapper className="resizable-youtube-node-view relative group block my-6" style={{ textAlign: node.attrs.textAlign || "center" }}>
      <div ref={containerRef} className={`relative inline-block transition-all duration-200 ${selected ? "ring-2 ring-primary-light rounded-lg shadow-lg" : ""}`} style={{ width: node.attrs.width ? `${node.attrs.width}px` : "100%", maxWidth: "100%" }}>
        
        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          {isError ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"><AlertTriangle size={40} className="mb-2 text-yellow-500"/><p className="text-sm font-semibold">Invalid Video URL</p></div>
          ) : (
              <>
                <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" title="YouTube" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                <div className={`absolute inset-0 bg-transparent ${selected ? "pointer-events-none" : "cursor-pointer"}`}></div>
              </>
          )}
        </div>

        {/* Controls Overlay */}
        <div className={`absolute -top-12 right-0 flex gap-1 bg-black/70 backdrop-blur-md rounded-lg p-1.5 transition-opacity duration-200 z-50 ${selected ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"}`}>
          <button onClick={() => setAlign("left")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignLeft size={16} /></button>
          <button onClick={() => setAlign("center")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignCenter size={16} /></button>
          <button onClick={() => setAlign("right")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignRight size={16} /></button>
          <div className="w-[1px] bg-white/20 mx-1"></div>
          <button onClick={deleteNode} className="p-1.5 rounded text-red-400 hover:bg-red-500/20 hover:text-red-500"><Trash2 size={16} /></button>
        </div>

        {/* RESIZE HANDLE WITH TOUCH */}
        <div
          className={`absolute bottom-2 -right-3 w-6 h-10 bg-white border border-gray-300 rounded-full cursor-ew-resize shadow-md z-20 flex items-center justify-center transition-opacity duration-200 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-[2px] h-4 bg-gray-400"></div>
        </div>

        {isResizing && <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded z-20">{Math.round(node.attrs.width)}px</div>}
      </div>
    </NodeViewWrapper>
  );
}