export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-teal-600 grid place-items-center text-white font-bold text-2xl mb-3 shadow-lg">
            F
          </div>
          <span className="text-xl font-semibold text-stone-900">FitCoach</span>
          <span className="text-xs text-stone-500 mt-1">Coaching platform for trainers</span>
        </div>
        {children}
      </div>
    </div>
  );
}
