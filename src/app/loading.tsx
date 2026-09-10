export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAFAF8] text-[#14140F]">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center shadow-xs">
          <div className="w-6 h-6 border-2 border-[#3A3564] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 bg-slate-200 rounded-md mx-auto" />
          <div className="h-3 w-48 bg-slate-100 rounded-md mx-auto" />
        </div>
      </div>
    </div>
  )
}
