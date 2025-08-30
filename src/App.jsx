import React, { useMemo, useState } from "react";

/**
 * App.jsx — React UI for your sourcing backend
 *
 * By default, this calls relative paths ("/search" and "/search-plain").
 * If you are NOT using a Vite proxy, set API_BASE = "http://localhost:4000".
 */

// If using a Vite dev proxy, keep this empty string "".
// Otherwise set to your backend origin (e.g., "http://localhost:4000").
const API_BASE = "http://localhost:4000";


export default function App() {
  const [mode, setMode] = useState("structured"); // "structured" | "plain"

  // structured form state
  const [query, setQuery] = useState("type:user MERN location:India repos:>3 followers:>5");
  const [minExp, setMinExp] = useState(2);
  const [maxExp, setMaxExp] = useState(8);
  const [limit, setLimit] = useState(20);

  // natural language form state
  const [text, setText] = useState("Looking for MERN stack devs in India with 2–8 years of experience");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [sortBy, setSortBy] = useState("followers"); // followers | repos | experience

  const endpoint = useMemo(() => (mode === "structured" ? "/search" : "/search-plain"), [mode]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = mode === "structured"
        ? { 
            query, 
            min_experience: numOrNull(minExp), 
            max_experience: numOrNull(maxExp), 
            limit: numOrNull(limit) 
          }
        : { text };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      const data = await res.json(); // { count, results }
      setResults(Array.isArray(data.results) ? data.results : []);
      setCount(Number.isFinite(data.count) ? data.count : (Array.isArray(data.results) ? data.results.length : 0));
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Derived, sorted view
  const view = useMemo(() => {
    const key = sortBy === "experience" ? "years_experience"
              : sortBy === "repos" ? "public_repos"
              : "followers";
    return [...results].sort((a, b) => (b?.[key] ?? 0) - (a?.[key] ?? 0));
  }, [results, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">GitHub Sourcing UI</h1>
          <div className="flex items-center gap-3">
            <SortControl sortBy={sortBy} setSortBy={setSortBy} />
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <FormCard
          mode={mode}
          query={query}
          setQuery={setQuery}
          minExp={minExp}
          setMinExp={setMinExp}
          maxExp={maxExp}
          setMaxExp={setMaxExp}
          limit={limit}
          setLimit={setLimit}
          text={text}
          setText={setText}
          loading={loading}
          onSubmit={onSubmit}
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-600">
            {results.length ? `Showing ${results.length} of ${count}` : "No results yet. Try a search."}
          </p>
          {error && (
            <div className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-800">{error}</div>
          )}
        </div>

        <ResultsList results={view} loading={loading} />
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-500">
        <p>
          Dev tip: If you see a CORS error, either enable CORS on the backend or use a Vite proxy and keep API_BASE="".
        </p>
      </footer>
    </div>
  );
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="inline-flex rounded-xl border border-neutral-200 overflow-hidden">
      {(["structured", "plain"]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`px-3 py-2 text-sm ${mode === m ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-100"}`}
        >
          {m === "structured" ? "Structured Search" : "Natural Language"}
        </button>
      ))}
    </div>
  );
}

function SortControl({ sortBy, setSortBy }) {
  return (
    <select
      aria-label="Sort candidates"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="border border-neutral-300 rounded-lg px-2 py-2 text-sm bg-white"
    >
      <option value="followers">Sort: Followers</option>
      <option value="repos">Sort: Repos</option>
      <option value="experience">Sort: Experience</option>
    </select>
  );
}

function FormCard(props) {
  const {
    mode,
    query, setQuery,
    minExp, setMinExp,
    maxExp, setMaxExp,
    limit, setLimit,
    text, setText,
    loading,
    onSubmit,
  } = props;

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 space-y-4">
      {mode === "structured" ? (
        <>
          <LabeledInput label="GitHub search query" value={query} onChange={setQuery} placeholder="type:user MERN location:India repos:>3 followers:>5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput type="number" label="Min experience (years)" value={minExp} onChange={setMinExp} placeholder="e.g. 2" />
            <LabeledInput type="number" label="Max experience (years)" value={maxExp} onChange={setMaxExp} placeholder="e.g. 8" />
            <LabeledInput type="number" label="Limit (users)" value={limit} onChange={setLimit} placeholder="20" />
          </div>
        </>
      ) : (
        <LabeledTextarea label="Describe who you want" value={text} onChange={setText} placeholder="Looking for MERN devs in India with 2–8 years experience" />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <small className="text-neutral-500">
          {mode === "structured" ? "POST /search" : "POST /search-plain"}
        </small>
      </div>
    </form>
  );
}

function LabeledInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-neutral-700 mb-1">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(safeNumber(type, e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />
    </label>
  );
}

function LabeledTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-neutral-700 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />
    </label>
  );
}

function ResultsList({ results, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <p className="text-neutral-600">No results yet. Try a search.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((u) => (
        <ResultCard key={u.login} user={u} />)
      )}
    </div>
  );
}

function ResultCard({ user }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img src={user.avatar} alt={user.login} className="w-14 h-14 rounded-xl object-cover" />
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{user.name || user.login}</h3>
          <p className="text-sm text-neutral-600 truncate">@{user.login}{user.location ? ` · ${user.location}` : ""}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <InfoPill label="Followers" value={user.followers ?? "-"} />
        <InfoPill label="Repos" value={user.public_repos ?? "-"} />
        <InfoPill label="Experience" value={fmtYears(user.years_experience)} />
        <InfoPill label="Top %" value={user.top_percentage ?? "-"} />
      </div>

      <div className="mt-3 text-sm text-neutral-700">
        {user.bio && <p className="line-clamp-3">{user.bio}</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {Array.isArray(user.languages_used) && user.languages_used.slice(0, 6).map((lang) => (
          <span key={lang} className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 border border-neutral-200">
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <a href={user.profile_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50">GitHub</a>
        {user.linkedin && (
          <a href={user.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50">LinkedIn</a>
        )}
        {user.twitter && (
          <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50">Twitter</a>
        )}
      </div>
    </article>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeNumber(type, val) {
  if (type !== "number") return val;
  if (val === "") return "";
  const n = Number(val);
  return Number.isFinite(n) ? n : "";
}

function fmtYears(y) {
  if (y === null || y === undefined) return "-";
  const n = Number(y);
  return Number.isFinite(n) ? `${n} yr${n === 1 ? "" : "s"}` : "-";
}

// Minimal utility-style CSS so you don't need Tailwind to start
const style = document.createElement("style");
style.innerHTML = `
  *{box-sizing:border-box} body{margin:0}
  .min-h-screen{min-height:100vh}
  .bg-neutral-50{background:#fafafa}
  .text-neutral-900{color:#111827}
  .bg-white{background:#fff}
  .border{border:1px solid}
  .border-neutral-200{border-color:#e5e7eb}
  .rounded-2xl{border-radius:1rem}
  .rounded-xl{border-radius:.75rem}
  .rounded-lg{border-radius:.5rem}
  .rounded-full{border-radius:9999px}
  .shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .px-4{padding-left:1rem;padding-right:1rem}
  .py-4{padding-top:1rem;padding-bottom:1rem}
  .py-6{padding-top:1.5rem;padding-bottom:1.5rem}
  .p-4{padding:1rem}
  .p-3{padding:.75rem}
  .px-3{padding-left:.75rem;padding-right:.75rem}
  .py-2{padding-top:.5rem;padding-bottom:.5rem}
  .py-1.5{padding-top:.375rem;padding-bottom:.375rem}
  .gap-3{gap:.75rem}
  .gap-2{gap:.5rem}
  .space-y-4>*+*{margin-top:1rem}
  .space-y-6>*+*{margin-top:1.5rem}
  .mx-auto{margin-left:auto;margin-right:auto}
  .max-w-5xl{max-width:64rem}
  .text-xl{font-size:1.25rem}
  .text-sm{font-size:.875rem}
  .text-[11px]{font-size:.6875rem}
  .font-semibold{font-weight:600}
  .font-medium{font-weight:500}
  .text-neutral-700{color:#374151}
  .text-neutral-600{color:#4b5563}
  .text-neutral-500{color:#6b7280}
  .text-red-800{color:#991b1b}
  .bg-red-50{background:#fef2f2}
  .bg-neutral-100{background:#f5f5f5}
  .hover:bg-neutral-50:hover{background:#fafafa}
  .hover:bg-neutral-100:hover{background:#f5f5f5}
  .hover:opacity-90:hover{opacity:.9}
  .disabled:opacity-60:disabled{opacity:.6}
  .focus:ring-2:focus{ outline:2px solid #d4d4d8; outline-offset:2px }
  .focus:outline-none:focus{outline:none}
  .w-full{width:100%}
  .h-40{height:10rem}
  .w-14{width:3.5rem}
  .h-14{height:3.5rem}
  .object-cover{object-fit:cover}
  .grid{display:grid}
  .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
  .sm:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .lg:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  @media (min-width:640px){.sm:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (min-width:1024px){.lg:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
  .items-center{align-items:center}
  .items-start{align-items:flex-start}
  .justify-between{justify-content:space-between}
  .flex{display:flex}
  .inline-flex{display:inline-flex}
  .min-w-0{min-width:0}
  .truncate{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sticky{position:sticky}
  .top-0{top:0}
  .z-10{z-index:10}
  .backdrop-blur{backdrop-filter:blur(8px)}
  .bg-white80{background:rgba(255,255,255,.8)}
  .animate-pulse{animation:pulse 1.5s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
`;
document.head.appendChild(style);
