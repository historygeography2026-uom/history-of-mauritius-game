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
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 flex-wrap">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          variant="ghost"
          className={`flex-1 min-w-[140px] gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
