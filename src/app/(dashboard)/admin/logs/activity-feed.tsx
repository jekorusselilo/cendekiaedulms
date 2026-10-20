"use client";

import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  FileText,
  ClipboardList,
  UserPlus,
  CalendarDays,
  Activity,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ActivityType =
  | "submission"
  | "material"
  | "assignment"
  | "user"
  | "meeting";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
};

const typeConfig: Record<
  ActivityType,
  {
    label: string;
    icon: typeof Activity;
    color: string;
    bgColor: string;
  }
> = {
  submission: {
    label: "Submission",
    icon: ClipboardCheck,
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  material: {
    label: "Materi",
    icon: FileText,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  assignment: {
    label: "Tugas",
    icon: ClipboardList,
    color: "text-violet-700",
    bgColor: "bg-violet-100",
  },
  user: {
    label: "User Baru",
    icon: UserPlus,
    color: "text-fuchsia-700",
    bgColor: "bg-fuchsia-100",
  },
  meeting: {
    label: "Pertemuan",
    icon: CalendarDays,
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
};

function timeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return past.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const [filter, setFilter] = useState<"ALL" | ActivityType>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === "ALL"
                ? "bg-purple-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({activities.length})
          </button>
          {(Object.keys(typeConfig) as ActivityType[]).map((t) => {
            const count = activities.filter((a) => a.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === t
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {typeConfig[t].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Belum ada aktivitas untuk filter ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => {
              const cfg = typeConfig[a.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bgColor}`}
                  >
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm">{a.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.bgColor} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {a.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(a.timestamp)}
                      </span>
                      <span>·</span>
                      <span>{a.actor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-500 text-center">
          Menampilkan {filtered.length} aktivitas terbaru
        </p>
      </CardContent>
    </Card>
  );
}