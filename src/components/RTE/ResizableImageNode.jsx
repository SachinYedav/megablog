import { NodeViewWrapper } from "@tiptap/react";
import React, { useRef, useState } from "react"; // useEffect ki jarurat nahi hai yaha
import { AlignLeft, AlignCenter, AlignRight, Trash2, RotateCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResizableImageNode(props) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const [isResizing, setIsResizing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  const setAlign = (align) => updateAttributes({ textAlign: align });
  
  const handleRotate = () => {
    const currentRotation = node.attrs.rotation || 0;
    updateAttributes({ rotation: (currentRotation + 90) % 360 });
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      toast.error("Image failed to load");
    }
  };

  const handleResizeStart = (e) => {
    // Prevent default only for mouse to avoid selection issues, 
    // but be careful with touch (scrolling block na ho jaye)
    if (e.type === 'mousedown') e.preventDefault();
    
    setIsResizing(true);

    const startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const startWidth = containerRef.current ? containerRef.current.offsetWidth : 0;

    const onMove = (moveEvent) => {
      const currentX = moveEvent.type === 'touchmove' 
        ? moveEvent.touches[0].clientX 
        : moveEvent.clientX;
        
      const diffX = currentX - startX;
      const newWidth = Math.max(100, startWidth + diffX); 
      updateAttributes({ width: newWidth });
    };

    const onEnd = () => {
      setIsResizing(false);
      // Clean up Mouse
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      // Clean up Touch
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    // Attach Listeners
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove); 
    document.addEventListener("touchend", onEnd);   
  };

  return (
    <NodeViewWrapper
      className="resizable-image-node-view relative group block my-4"
      style={{ textAlign: node.attrs.textAlign || "center" }}
    >
      <div
        ref={containerRef}
        className={`relative inline-block transition-all duration-200 ${
          selected ? "ring-2 ring-primary-light rounded-lg shadow-lg" : ""
        }`}
        style={{
          width: node.attrs.width ? `${node.attrs.width}px` : "auto",
          maxWidth: "100%",
        }}
      >
        {hasError ? (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center text-red-500 p-4">
            <AlertCircle size={32} />
          </div>
        ) : (
          <img
            src={node.attrs.src}
            alt={node.attrs.alt}
            onError={handleImageError}
            className="rounded-lg shadow-sm w-full h-auto object-cover transition-transform duration-300"
            style={{
              transform: `rotate(${node.attrs.rotation || 0}deg)`, // Rotation Style applied here
            }}
          />
        )}

        {/* Controls Overlay (Same as before) */}
        <div className={`absolute -top-12 right-0 flex gap-1 bg-black/70 backdrop-blur-md rounded-lg p-1.5 transition-opacity duration-200 z-50 ${selected ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"}`}>
          <button onClick={() => setAlign("left")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignLeft size={16} /></button>
          <button onClick={() => setAlign("center")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignCenter size={16} /></button>
          <button onClick={() => setAlign("right")} className="p-1.5 rounded text-white hover:bg-white/20"><AlignRight size={16} /></button>
          <div className="w-[1px] bg-white/20 mx-1"></div>
          <button onClick={handleRotate} className="p-1.5 rounded text-white hover:bg-white/20"><RotateCw size={16} /></button>
          <button onClick={deleteNode} className="p-1.5 rounded text-red-400 hover:bg-red-500/20 hover:text-red-500"><Trash2 size={16} /></button>
        </div>

        {/* RESIZE HANDLE WITH TOUCH SUPPORT */}
        {!hasError && (
          <>
            <div
              className={`absolute bottom-2 -right-3 w-6 h-10 bg-white border border-gray-300 rounded-full cursor-ew-resize shadow-md z-20 flex items-center justify-center transition-opacity duration-200 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              onMouseDown={handleResizeStart}  
              onTouchStart={handleResizeStart} 
            >
              <div className="w-[2px] h-4 bg-gray-400"></div>
            </div>
            {isResizing && (
              <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded z-20">
                {Math.round(node.attrs.width || containerRef.current?.offsetWidth)}px
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}