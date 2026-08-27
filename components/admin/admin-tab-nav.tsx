"use client"

import { Button } from "@/components/ui/button"

interface Tab {
  id: string
  label: string
  icon: string
}

interface AdminTabNavProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function AdminTabNav({ tabs, activeTab, onTabChange }: AdminTabNavProps) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4 sm:mb-6 flex-wrap">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          variant="ghost"
          className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-[140px] gap-1.5 sm:gap-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 px-2 sm:px-4 py-2 ${
            activeTab === tab.id
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <span className="text-sm sm:text-base">{tab.icon}</span>
          <span className="truncate">{tab.label}</span>
        </Button>
      ))}
    </div>
  )
}
