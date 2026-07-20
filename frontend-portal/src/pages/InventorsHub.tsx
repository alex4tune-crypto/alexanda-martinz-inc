import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, Send, Sparkles } from "lucide-react";
import { api } from "../lib/realtime";

type Invention = {
  id: string;
  author_name: string;
  idea_title: string;
  idea_body: string;
  feasibility_markdown: string | null;
  reviewed_by: string | null;
};

export default function InventorsHub() {
  const [ideas, setIdeas] = useState<Invention[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("Anonymous");
  const [busy, setBusy] = useState(false);

  const load = () => api<Invention[]>("/api/inventions").then(setIdeas).catch(() => setIdeas([]));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      await api("/api/inventions", {
        method: "POST",
        body: JSON.stringify({ author_name: author, idea_title: title, idea_body: body }),
      });
      setTitle(""); setBody(""); load();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Inventors Hub — Research Lab</h1>
      <div className="card p-5">
        <div className="text-xs font-mono uppercase text-slate-500 mb-3">Submit a patent / idea</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <input placeholder="Idea title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <textarea className="w-full mt-3 h-24" placeholder="Describe your invention…" value={body} onChange={(e) => setBody(e.target.value)} />
        <button onClick={submit} disabled={busy} className="btn-emerald mt-3 py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-50">
          <Send className="w-3.5 h-3.5" /> {busy ? "Reviewing with Qwen…" : "Submit for Qwen Review"}
        </button>
      </div>

      <div className="space-y-4">
        {ideas.map((inv) => (
          <div key={inv.id} className="card p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">{inv.idea_title}</h3>
              <span className="text-[10px] font-mono text-slate-500 ml-auto">by {inv.author_name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{inv.idea_body}</p>
            {inv.feasibility_markdown ? (
              <div className="mt-3 bg-ink border border-edge rounded-lg p-3 text-xs text-slate-300 prose-invert max-w-none">
                <div className="flex items-center gap-1 text-emerald-400 mb-1 text-[10px] font-mono uppercase">
                  <Sparkles className="w-3 h-3" /> Feasibility by {inv.reviewed_by || "Qwen"}
                </div>
                <ReactMarkdown>{inv.feasibility_markdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="mt-3 text-[11px] text-slate-500">Pending Qwen review…</div>
            )}
          </div>
        ))}
        {ideas.length === 0 && <div className="text-xs text-slate-500">No inventions yet — submit one above.</div>}
      </div>
    </div>
  );
}
