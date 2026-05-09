import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Save, X, AlertCircle, Drama } from "lucide-react";
import { compressImage } from "./imageHandler";
import "./editor.css";

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
  "image",
  "color",
  "background",
  "size",
  "font",
  "align",
  "code-block",
];

function Editor({ onSave, onCancel, initialData, colors, categories, darkMode }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [selectedColor, setSelectedColor] = useState(initialData?.color || 0);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "Personal");
  const [imageError, setImageError] = useState(null);
  const quillRef = useRef(null);
  const [modules, setModules] = useState(null);

  // Setup image handler and modules
  useEffect(() => {
    const imageHandler = function () {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try {
          setImageError(null);

          const dataUrl = await compressImage(file);
          const quill = quillRef.current?.getEditor?.();
          
          if (quill) {
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, "image", dataUrl);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Failed to process image";
          setImageError(errorMsg);
          console.error("Image upload error:", error);
        }
      };

      input.click();
    };

    setModules({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ font: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["table"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    });
  }, []);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    onSave({
      title: title.trim(),
      body,
      date: new Date().toISOString(),
      color: selectedColor,
      category: selectedCategory,
    });
    setTitle("");
    setBody("");
    setImageError(null);
  };

  const bgClass = darkMode
  ? "bg-gray-800"
  : "bg-white";

const inputClass = darkMode
  ? "bg-gray-800 border-gray-600 text-white"
  : "bg-white border-gray-300";
  const textClass = darkMode ? "text-white" : "text-gray-800";

  return (
    <div className={`space-y-4 ${darkMode ? "dark" : ""}`}>
      {/* Image Error Alert */}
      {imageError && (
        <div className="animate-scale-in flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">Image upload failed</p>
            <p className="text-red-700 dark:text-red-400 text-sm">{imageError}</p>
          </div>
          <button
            onClick={() => setImageError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 ml-auto flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className={`text-sm font-semibold mb-2 block ${textClass}`}>Title</label>
          <input
            className={`w-full p-3 border rounded-lg text-lg ${textClass} ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <div>
          <label className={`text-sm font-semibold mb-2 block ${textClass}`}>Color</label>
          <div className="flex gap-2">
            {colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(idx)}
                className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-transform hover:scale-110 ${selectedColor === idx ? "border-gray-800 scale-125 ring-2 ring-blue-500" : "border-gray-300"}`}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={`text-sm font-semibold mb-2 block ${textClass}`}>Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`w-full p-3 border rounded-lg ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className={`${bgClass} p-3 rounded-lg transition-all ${darkMode ? "text-white" : "text-black"}`}>
        <label className={`text-sm font-semibold mb-2 block ${textClass}`}>Content</label>
        {modules ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={body}
            onChange={setBody}
            modules={modules}
            formats={formats}
            placeholder="Type your note here... You can add images using the toolbar!"
            className={`${bgClass} min-h-[350px] rounded-lg  ${darkMode ? "text-white" : "text-black"} transition-all`}
          />
        ) : (
          <div className={`${bgClass} min-h-[350px] rounded-lg flex items-center justify-center ${darkMode ? "text-white" : "text-gray-500"} animate-pulse`}>
            Loading editor...
          </div>
        )}
        <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          💡 Tip: Images are automatically optimized for your notes
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 active:scale-95 flex items-center gap-2 transition-all font-semibold hover:shadow-lg"
        >
          <X size={16} /> Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 flex items-center gap-2 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          <Save size={16} /> Save
        </button>
      </div>
    </div>
  );
}

export default Editor;
