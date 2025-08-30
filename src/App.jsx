import React, { useState } from "react";

/**
 * App.jsx — React UI for your sourcing backend
 *
 * By default, this calls relative paths ("/search" and "/search-plain").
 * If you are NOT using a Vite proxy, set API_BASE = "http://localhost:4000".
 */

// const API_BASE = "http://localhost:4000";
const API_BASE = import.meta.env.DEV ? "http://localhost:4000" : import.meta.env.VITE_API_BASE;
// const API_BASE = "";
export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/search-plain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
      setCount(data.count ?? data.results?.length ?? 0);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 space-y-4"
      >
        <label className="block">
          <div className="text-sm font-medium text-neutral-700 mb-1">
            Describe who you want
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Looking for MERN devs in India with 2–8 years experience"
            rows={3}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <p className="text-neutral-600">
          {results.length
            ? `Showing ${results.length} of ${count}`
            : "No results yet. Try a search."}
        </p>
        {error && (
          <div className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-800">
            {error}
          </div>
        )}
      </div>

      <ResultsList results={results} loading={loading} />
    </main>
  );
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="inline-flex rounded-xl border border-neutral-200 overflow-hidden">
      {["structured", "plain"].map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`px-3 py-2 text-sm ${
            mode === m ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-100"
          }`}
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
    query,
    setQuery,
    minExp,
    setMinExp,
    maxExp,
    setMaxExp,
    limit,
    setLimit,
    text,
    setText,
    loading,
    onSubmit,
  } = props;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 space-y-4"
    >
      {mode === "structured" ? (
        <>
          <LabeledInput
            label="GitHub search query"
            value={query}
            onChange={setQuery}
            placeholder="type:user MERN location:India repos:>3 followers:>5"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput
              type="number"
              label="Min experience (years)"
              value={minExp}
              onChange={setMinExp}
              placeholder="e.g. 2"
            />
            <LabeledInput
              type="number"
              label="Max experience (years)"
              value={maxExp}
              onChange={setMaxExp}
              placeholder="e.g. 8"
            />
            <LabeledInput
              type="number"
              label="Limit (users)"
              value={limit}
              onChange={setLimit}
              placeholder="20"
            />
          </div>
        </>
      ) : (
        <LabeledTextarea
          label="Describe who you want"
          value={text}
          onChange={setText}
          placeholder="Looking for MERN devs in India with 2–8 years experience"
        />
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
          <div
            key={i}
            className="h-40 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse"
          />
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
        <ResultCard key={u.login} user={u} />
      ))}
    </div>
  );
}

// --- Color themes (Tailwind classes). Pick one per user by hashing login ---
const THEMES = [
  { name:"indigo",  bg:"from-indigo-50 to-indigo-100",  ring:"ring-indigo-200",  text:"text-indigo-700", chip:"bg-indigo-50 border-indigo-200 text-indigo-700" },
  { name:"emerald", bg:"from-emerald-50 to-emerald-100", ring:"ring-emerald-200", text:"text-emerald-700", chip:"bg-emerald-50 border-emerald-200 text-emerald-700" },
  { name:"rose",    bg:"from-rose-50 to-rose-100",       ring:"ring-rose-200",    text:"text-rose-700",    chip:"bg-rose-50 border-rose-200 text-rose-700" },
  { name:"violet",  bg:"from-violet-50 to-violet-100",   ring:"ring-violet-200",  text:"text-violet-700",  chip:"bg-violet-50 border-violet-200 text-violet-700" },
  { name:"amber",   bg:"from-amber-50 to-amber-100",     ring:"ring-amber-200",   text:"text-amber-700",   chip:"bg-amber-50 border-amber-200 text-amber-700" },
  { name:"sky",     bg:"from-sky-50 to-sky-100",         ring:"ring-sky-200",     text:"text-sky-700",     chip:"bg-sky-50 border-sky-200 text-sky-700" },
  { name:"fuchsia", bg:"from-fuchsia-50 to-fuchsia-100", ring:"ring-fuchsia-200", text:"text-fuchsia-700", chip:"bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700" },
  { name:"teal",    bg:"from-teal-50 to-teal-100",       ring:"ring-teal-200",    text:"text-teal-700",    chip:"bg-teal-50 border-teal-200 text-teal-700" },
];

function themeForUser(key = "") {
  const sum = [...String(key)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return THEMES[sum % THEMES.length];
}

// --- ResultCard (colorful card) ---
function ResultCard({ user }) {
  const t = themeForUser(user.login || user.name);

  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-sm ring-1 ${t.ring} transition hover:shadow-md`}
    >
      {/* Gradient header */}
      <div className={`h-20 bg-gradient-to-r ${t.bg}`} />

      {/* Body */}
      <div className="p-4 -mt-10">
        <div className="flex items-start gap-3">
          <img
            src={user.avatar}
            alt={user.login}
            className="w-16 h-16 rounded-xl object-cover ring-4 ring-white shadow-sm"
          />
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{user.name || user.login}</h3>
            <p className="text-sm text-neutral-600 truncate">
              @{user.login}{user.location ? ` · ${user.location}` : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <InfoPill label="Followers" value={user.followers ?? "-"} themeClass={t.text} />
          <InfoPill label="Repos" value={user.public_repos ?? "-"} themeClass={t.text} />
          <InfoPill label="Experience" value={fmtYears(user.years_experience)} themeClass={t.text} />
          <InfoPill label="Top %" value={user.top_percentage ?? "-"} themeClass={t.text} />
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 text-sm text-neutral-700 line-clamp-3">{user.bio}</p>
        )}

        {/* Languages */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.isArray(user.languages_used) &&
            user.languages_used.slice(0, 6).map((lang) => (
              <span
                key={lang}
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs border ${t.chip}`}
              >
                {lang}
              </span>
            ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <a
            href={user.profile_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50"
          >
            GitHub
          </a>
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50"
            >
              LinkedIn
            </a>
          )}
          {user.twitter && (
            <a
              href={`https://twitter.com/${user.twitter}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50"
            >
              Twitter
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// --- InfoPill (with theme accent) ---
function InfoPill({ label, value, themeClass = "" }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className={`text-[11px] ${themeClass}`}>{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}


// function InfoPill({ label, value }) {
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
//       <div className="text-[11px] text-neutral-500">{label}</div>
//       <div className="text-sm font-medium">{value}</div>
//     </div>
//   );
// }

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
