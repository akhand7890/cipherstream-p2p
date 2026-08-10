export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-extrabold text-indigo-400">404 — Page Not Found</h1>
      <p className="text-slate-400 text-sm">The requested page does not exist on CipherStream P2P.</p>
      <a href="/" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm">
        Back to Dashboard
      </a>
    </div>
  );
}
