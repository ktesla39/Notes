import { useState, useEffect, useMemo } from "react";
import Editor from "./Editor";
import Loading from "./Loading";
import {
  Pin, Plus, PinOff,
  Trash2, Search, Copy,
  Moon, Sun, FileText,
  X, Eye, Github,
  GithubIcon
} from "lucide-react";

const COLORS = [
  { name: "Blue", bg: "bg-blue-100", border: "border-blue-300", dot: "bg-blue-500", text: "text-blue-600" },
  { name: "Red", bg: "bg-red-100", border: "border-red-300", dot: "bg-red-500", text: "text-red-600" },
  { name: "Green", bg: "bg-green-100", border: "border-green-300", dot: "bg-green-500", text: "text-green-600" },
  { name: "Purple", bg: "bg-purple-100", border: "border-purple-300", dot: "bg-purple-500", text: "text-purple-600" },
  { name: "Yellow", bg: "bg-yellow-100", border: "border-yellow-300", dot: "bg-yellow-500", text: "text-yellow-600" },
  { name: "Pink", bg: "bg-pink-100", border: "border-pink-300", dot: "bg-pink-500", text: "text-pink-600" },
];

const CATEGORIES = ["Personal", "Work", "Ideas", "Todo", "Archive"];

const data = localStorage.getItem("notesAppData")
  ? JSON.parse(localStorage.getItem("notesAppData"))
  : [];

const App = () => {
  const [notes, setNotes] = useState(data);
  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("notesAppDarkMode") === "true");
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show loading for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // URL routing
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith("edit=")) {
      const id = parseInt(hash.split("=")[1]);
      setEditingId(id);
      setShowEditor(true);
      setViewingId(null);
    } else if (hash.startsWith("view=")) {
      const id = parseInt(hash.split("=")[1]);
      setViewingId(id);
      setShowEditor(false);
    } else if (hash === "new") {
      setEditingId(null);
      setShowEditor(true);
      setViewingId(null);
    } else {
      setShowEditor(false);
      setViewingId(null);
    }
  }, []);

  const updateURL = (state) => {
    if (state === "home") {
      window.location.hash = "";
    } else if (state.type === "edit") {
      window.location.hash = `edit=${state.id}`;
    } else if (state.type === "view") {
      window.location.hash = `view=${state.id}`;
    } else if (state.type === "new") {
      window.location.hash = "new";
    }
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [notes, searchQuery, selectedCategory, sortBy]);

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  const saveNote = (newNote) => {
    if (editingId !== null) {
      const updated = notes.map((n, i) => i === editingId ? { ...n, ...newNote } : n);
      setNotes(updated);
      localStorage.setItem("notesAppData", JSON.stringify(updated));
    } else {
      const updated = [...notes, { ...newNote, pinned: false, color: 0, category: "Personal" }];
      setNotes(updated);
      localStorage.setItem("notesAppData", JSON.stringify(updated));
    }
    setEditingId(null);
    setShowEditor(false);
    setViewingId(null);
    updateURL("home");
  };

  const togglePin = (index) => {
    const updated = notes.map((n, i) => i === index ? { ...n, pinned: !n.pinned } : n);
    setNotes(updated);
    localStorage.setItem("notesAppData", JSON.stringify(updated));
  };

  const deleteNote = (index) => {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
    localStorage.setItem("notesAppData", JSON.stringify(updated));
    setEditingId(null);
    setShowEditor(false);
    setViewingId(null);
    updateURL("home");
  };

  const duplicateNote = (index) => {
    const noteToDupe = notes[index];
    const duplicated = {
      ...noteToDupe,
      title: `${noteToDupe.title} (Copy)`,
    };
    const updated = [...notes, duplicated];
    setNotes(updated);
    localStorage.setItem("notesAppData", JSON.stringify(updated));
  };

  const openEditor = (index) => {
    setEditingId(index);
    setShowEditor(true);
    setViewingId(null);
    updateURL({ type: "edit", id: index });
  };

  const openNew = () => {
    setEditingId(null);
    setShowEditor(true);
    setViewingId(null);
    updateURL({ type: "new" });
  };

  const closeEditor = () => {
    setEditingId(null);
    setShowEditor(false);
    setViewingId(null);
    updateURL("home");
  };

  const openView = (index) => {
    setViewingId(index);
    setShowEditor(false);
    setEditingId(null);
    updateURL({ type: "view", id: index });
  };

  const closeView = () => {
    setViewingId(null);
    updateURL("home");
  };

  const statsByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = notes.filter(n => n.category === cat).length;
      return acc;
    }, {});
  }, [notes]);

  const bgClass = darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50";
  const textClass = darkMode ? "text-gray-100" : "text-gray-800";

  // Show loading screen initially
  if (isLoading) {
    return <Loading darkMode={darkMode} />;
  }

  // If viewing a note, show the view modal
  if (viewingId !== null && notes[viewingId]) {
    const note = notes[viewingId];
    const color = COLORS[note.color || 0];

    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300 p-4 animate-fade-in`}>
        <div className="max-w-4xl mx-auto">
          <div className={`animate-scale-in relative p-8 rounded-lg shadow-2xl border-2 ${color.bg} ${color.border} ${darkMode ? "bg-gray-800" : ""}`}>
            <button
              onClick={closeView}
              className={`absolute top-4 right-4 p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              title="Close"
            >
              <X size={24} />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${color.dot} mt-1`}></div>
              <span className={`text-sm font-semibold ${color.text}`}>{note.category}</span>
            </div>

            <h1 className={`text-5xl font-bold mb-4 ${textClass}`}>{note.title}</h1>
            
            <div className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {new Date(note.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div className={`prose prose-lg max-w-none mb-6 ${darkMode ? "text-gray-300" : ""}`}>
              <div 
                dangerouslySetInnerHTML={{ __html: note.body }}
                className={`leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              />
            </div>

            <div className="flex gap-2 mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={() => openEditor(notes.indexOf(note))}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Edit Note
              </button>
              <button
                onClick={() => {
                  duplicateNote(notes.indexOf(note));
                  closeView();
                }}
                className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"}`}
              >
                <Copy size={16} /> Duplicate
              </button>
              <button
                onClick={() => {
                  deleteNote(notes.indexOf(note));
                  closeView();
                }}
                className={`px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 ${darkMode ? "border-red-600 hover:bg-red-900/20" : ""}`}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="animate-fade-in flex justify-between items-center mb-8 sticky top-0 z-20 bg-opacity-80 backdrop-blur-md py-4 rounded-lg px-4">
          <div>
            <h1 className={`text-4xl font-bold ${textClass}`}>📝 Notes</h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{notes.length} total • {filteredNotes.length} displayed</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {setDarkMode(!darkMode); localStorage.setItem("notesAppDarkMode", !darkMode);}}
              className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-200 text-gray-600"}`}
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>


            <button
              onClick={() => window.open("https://github.com/ktesla39/Notes/", "_blank")}
              className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}
              title="View on GitHub"
            >
              <Github size={20} />
            </button>



            <button
              onClick={openNew}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              
              <Plus size={20} /> Create
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {!showEditor && (
          <div className={`animate-fade-in mb-6 p-4 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-md`}>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={20} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 border rounded-lg transition-all ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
              >
                <option value="recent">Recent</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 rounded-full transition-all font-medium ${selectedCategory === "All" ? "bg-blue-600 text-white shadow-lg scale-105" : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                All ({notes.length})
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full transition-all font-medium ${selectedCategory === cat ? "bg-blue-600 text-white shadow-lg scale-105" : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  {cat} ({statsByCategory[cat]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && (
          <div className={`animate-fade-in-up mb-8 p-6 rounded-lg shadow-2xl border-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-200"}`}>
            <Editor 
              onSave={saveNote} 
              onCancel={closeEditor}
              initialData={editingId !== null ? notes[editingId] : null}
              colors={COLORS}
              categories={CATEGORIES}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Notes Display */}
        {!showEditor && (
          <div className="space-y-6">
            {filteredNotes.length === 0 ? (
              <div className={`w-full text-center py-20 ${textClass}`}>
                <Search size={64} className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {searchQuery || selectedCategory !== "All" ? "No notes match your search" : "No notes yet"}
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {searchQuery || selectedCategory !== "All" ? "Try a different search" : "Create one to get started!"}
                </p>
              </div>
            ) : (
              <>
                {filteredNotes.filter(n => n.pinned).length > 0 && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                      <Pin size={24} /> Pinned
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredNotes.filter(n => n.pinned).map((note) => {
                        const realIndex = notes.indexOf(note);
                        return (
                          <NoteCard
                            key={realIndex}
                            note={note}
                            onPin={() => togglePin(realIndex)}
                            onDelete={() => deleteNote(realIndex)}
                            onEdit={() => openEditor(realIndex)}
                            onView={() => openView(realIndex)}
                            onDuplicate={() => duplicateNote(realIndex)}
                            darkMode={darkMode}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredNotes.filter(n => !n.pinned).length > 0 && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                      <FileText size={24} /> Notes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredNotes.filter(n => !n.pinned).map((note) => {
                        const realIndex = notes.indexOf(note);
                        return (
                          <NoteCard
                            key={realIndex}
                            note={note}
                            onPin={() => togglePin(realIndex)}
                            onDelete={() => deleteNote(realIndex)}
                            onEdit={() => openEditor(realIndex)}
                            onView={() => openView(realIndex)}
                            onDuplicate={() => duplicateNote(realIndex)}
                            darkMode={darkMode}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const NoteCard = ({ note, onPin, onDelete, onEdit, onView, onDuplicate, darkMode }) => {
  const [hovered, setHovered] = useState(false);
  const color = COLORS[note.color || 0];
  
  return (
    <div
      className={`note-card p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-2 flex flex-col group cursor-pointer relative overflow-hidden ${color.bg} ${color.border} ${hovered ? "ring-2 ring-blue-400" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background accent */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 ${color.bg}`}></div>

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
            <span className={`text-xs font-bold ${color.text}`}>{note.category}</span>
          </div>
          <h3 
            onClick={onEdit}
            className={`text-lg font-bold line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors ${darkMode ? "text-gray-100" : "text-gray-800"}`}
          >
            {note.title}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className={`p-2 rounded-lg transition-all ${note.pinned ? "text-blue-600 bg-blue-100" : darkMode ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700" : "text-gray-400 hover:text-blue-600 hover:bg-gray-100"}`}
          title={note.pinned ? "Unpin" : "Pin"}
        >
          {note.pinned ? <Pin size={18} /> : <PinOff size={18} />}
        </button>
      </div>

      <p 
        onClick={onView}
        className={`text-sm flex-1 overflow-hidden line-clamp-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity relative z-10 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {note.body?.replace(/<[^>]*>/g, '') || "No description"}
      </p>

      <div className="flex justify-between items-center relative z-10">
        <span className={`text-xs font-medium ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
          {new Date(note.date).toLocaleDateString()}
        </span>
        {hovered && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onView}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${darkMode ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700" : "text-gray-400 hover:text-blue-600 hover:bg-gray-100"}`}
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={onDuplicate}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${darkMode ? "text-gray-400 hover:text-green-400 hover:bg-gray-700" : "text-gray-400 hover:text-green-600 hover:bg-gray-100"}`}
              title="Duplicate"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={onDelete}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${darkMode ? "text-gray-400 hover:text-red-400 hover:bg-gray-700" : "text-gray-400 hover:text-red-600 hover:bg-gray-100"}`}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
