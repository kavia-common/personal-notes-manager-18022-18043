import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * Personal Notes Manager Frontend
 * - Minimalistic light theme
 * - Pure React state (no backend)
 * - Features: Create, edit, delete, list, search
 * - Layout: Top nav bar, notes list, floating action button, modal for view/edit
 */

// Helpers
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const nowISO = () => new Date().toISOString();
const formatDate = (iso) =>
  new Date(iso).toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * PUBLIC_INTERFACE
 * NoteCard component - displays a note snippet with title, content preview and actions
 */
function NoteCard({ note, onOpen, onDelete }) {
  /** This is a public component for displaying individual notes. */
  return (
    <article className="note-card" role="button" tabIndex={0} onClick={() => onOpen(note)} onKeyDown={(e) => e.key === "Enter" && onOpen(note)}>
      <div className="note-card-header">
        <h3 className="note-title">{note.title || "Untitled note"}</h3>
        <time className="note-date" title={note.updatedAt}>{formatDate(note.updatedAt)}</time>
      </div>
      <p className="note-excerpt">{note.content ? note.content : "No content yet..."}</p>
      <div className="note-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn-text danger" onClick={() => onDelete(note.id)} aria-label={`Delete ${note.title || "note"}`}>Delete</button>
        <button className="btn-text primary" onClick={() => onOpen(note)} aria-label={`Open ${note.title || "note"}`}>Open</button>
      </div>
    </article>
  );
}

/**
 * PUBLIC_INTERFACE
 * Modal component - lightweight accessible modal
 */
function Modal({ open, title, children, onClose }) {
  /** This is a public component to present modal content. */
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * App - main entry point of the Notes Manager.
 */
function App() {
  /** This is the main application component. */

  // Theme is fixed to light per requirements, but we keep the infra for extensibility
  const [theme] = useState("light");

  // Notes state with localStorage persistence
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("pnm__notes");
      if (saved) return JSON.parse(saved);
    } catch (_) {
      // ignore parse errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("pnm__notes", JSON.stringify(notes));
    } catch (_) {
      // ignore set errors
    }
  }, [notes]);

  // UI state
  const [query, setQuery] = useState("");
  const [activeNote, setActiveNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived list with search
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return notes
      .filter((n) => (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, query]);

  // Actions
  // PUBLIC_INTERFACE
  const createNote = () => {
    /** Create a new note and open it in the modal for editing. */
    const newNote = {
      id: uid(),
      title: "",
      content: "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNote(newNote);
    setIsModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const openNote = (note) => {
    /** Open a note in the modal for viewing/editing. */
    setActiveNote(note);
    setIsModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const updateActiveNote = (fields) => {
    /** Update the active note in state. */
    setActiveNote((prev) => {
      if (!prev) return prev;
      return { ...prev, ...fields, updatedAt: nowISO() };
    });
  };

  // PUBLIC_INTERFACE
  const saveActiveNote = () => {
    /** Persist currently open note into the notes list. */
    if (!activeNote) return;
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? { ...activeNote } : n)));
    setIsModalOpen(false);
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    /** Delete a note by id. */
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) {
      setIsModalOpen(false);
      setActiveNote(null);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-root">
      {/* Top Navigation Bar */}
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>🗒️</span>
          <span className="brand-name">Personal Notes</span>
        </div>
        <div className="search-wrap">
          <input
            type="search"
            className="search-input"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <h2>No notes yet</h2>
            {query ? (
              <p>No results for “{query}”. Try a different search or create a new note.</p>
            ) : (
              <p>Click the + button to create your first note.</p>
            )}
            <button className="btn primary" onClick={createNote}>Create a note</button>
          </div>
        ) : (
          <section className="notes-grid" aria-live="polite">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onOpen={openNote} onDelete={deleteNote} />
            ))}
          </section>
        )}
      </main>

      {/* Floating Action Button */}
      <button className="fab" onClick={createNote} aria-label="Add new note" title="Add note">+</button>

      {/* Modal for View/Edit */}
      <Modal open={isModalOpen} title="Note" onClose={() => setIsModalOpen(false)}>
        {activeNote && (
          <div className="note-editor">
            <input
              className="input title-input"
              placeholder="Title"
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
            />
            <textarea
              className="input content-input"
              placeholder="Write your note here..."
              value={activeNote.content}
              onChange={(e) => updateActiveNote({ content: e.target.value })}
              rows={10}
            />
            <div className="editor-meta">
              <span>Last edited: {formatDate(activeNote.updatedAt)}</span>
            </div>
            <div className="editor-actions">
              <button className="btn subtle" onClick={() => setIsModalOpen(false)}>Close</button>
              <div className="spacer" />
              <button className="btn danger" onClick={() => deleteNote(activeNote.id)}>Delete</button>
              <button className="btn primary" onClick={saveActiveNote}>Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
