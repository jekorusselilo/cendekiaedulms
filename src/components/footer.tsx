import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white w-full h-full flex items-center">
      <div className="w-full px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-xs">CendekiaEdu</p>
              <p className="text-[10px] text-slate-500">
                Platform Pembelajaran Digital
              </p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] text-slate-500">
              Dibuat oleh Dimas Hadiwijaya, dan Davena Jacko.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}