"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, X, MapPin, Mountain, Waves, TreePalm, Building, Ship, Bird, Landmark, ZoomIn, ZoomOut, RotateCcw, Compass, Info, ChevronLeft, ChevronRight, Droplets, Flame, Wheat } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { mauritiusDistricts } from "@/lib/mauritius-map-data"
import { mauritiusFeatures, featureTypeColors, featureTypeLabels } from "@/lib/mauritius-features-data"
import type { FeatureType, MauritiusFeature } from "@/lib/mauritius-features-data"

// Rodrigues data types for lazy loading
type RodriguesMapData = typeof import("@/lib/rodrigues-map-data")
type RodriguesLocData = typeof import("@/lib/rodrigues-locations-data")

interface MapLocation {
  id: string
  name: string
  lat: number
  lng: number
  x?: number
  y?: number
  category: "history" | "geography" | "both"
  icon: string
  color: string
  markerColor: string
  title: string
  description: string
  yearEstablished?: string
  image?: string
  region: string
  island: "mauritius" | "rodrigues"
}


const districts = [
  { name: "Port Louis", color: "#3b82f6", center: [-20.16, 57.50] },
  { name: "Pamplemousses", color: "#22c55e", center: [-20.10, 57.58] },
  { name: "Rivière du Rempart", color: "#f97316", center: [-20.08, 57.70] },
  { name: "Flacq", color: "#14b8a6", center: [-20.19, 57.71] },
  { name: "Grand Port", color: "#8b5cf6", center: [-20.40, 57.70] },
  { name: "Savanne", color: "#ec4899", center: [-20.45, 57.52] },
  { name: "Black River", color: "#6366f1", center: [-20.37, 57.37] },
  { name: "Plaines Wilhems", color: "#0ea5e9", center: [-20.30, 57.50] },
  { name: "Moka", color: "#84cc16", center: [-20.22, 57.55] }
]

const categoryColors: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  history: { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700", hex: "#f59e0b" },
  geography: { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-700", hex: "#10b981" },
  both: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700", hex: "#8b5cf6" }
}

const categoryLabels: Record<string, string> = {
  history: "History",
  geography: "Geography",
  both: "History & Geography"
}

const ISLAND_LAYER_TRANSFORM = "translate(-217.11327,-744.32494)"

export default function ExploreMap() {
  const [activeMap, setActiveMap] = useState<"mauritius" | "rodrigues">("mauritius")
  const [selectedLocation, setSelectedLocation] = useState<MauritiusFeature | MapLocation | null>(null)
  const [filter, setFilter] = useState<FeatureType>("river")
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set())

  // Lazy-loaded Rodrigues data (only fetched when user switches to Rodrigues tab)
  const [rodMapData, setRodMapData] = useState<RodriguesMapData | null>(null)
  const [rodLocations, setRodLocations] = useState<MapLocation[]>([])
  const [rodLoading, setRodLoading] = useState(false)

  useEffect(() => {
    if (activeMap === "rodrigues" && !rodMapData) {
      setRodLoading(true)
      Promise.all([
        import("@/lib/rodrigues-map-data"),
        import("@/lib/rodrigues-locations-data"),
      ]).then(([mapMod, locMod]) => {
        setRodMapData(mapMod)
        setRodLocations(locMod.rodriguesLocations)
        setRodLoading(false)
      })
    }
  }, [activeMap, rodMapData])

  const [mauZoom, setMauZoom] = useState(1)
  const [mauPan, setMauPan] = useState({ x: 0, y: 0 })
  const [mauDragging, setMauDragging] = useState(false)
  const [mauDragStart, setMauDragStart] = useState({ x: 0, y: 0 })
  const [showDistricts, setShowDistricts] = useState(true)

  const [rodZoom, setRodZoom] = useState(1)
  const [rodPan, setRodPan] = useState({ x: 0, y: 0 })
  const [rodDragging, setRodDragging] = useState(false)
  const [rodDragStart, setRodDragStart] = useState({ x: 0, y: 0 })
  const [showZones, setShowZones] = useState(true)
  const [rodCategory, setRodCategory] = useState<"history" | "geography" | "both">("history")

  // ── Theme palettes per feature type ──
  const featureThemes: Record<FeatureType, {
    ocean: string
    island: [string, string, string]
    stroke: string
    accent: string
    label: string
  }> = {
    river: {
      ocean: "from-blue-700 via-cyan-700 to-blue-800",
      island: ["#34d399", "#10b981", "#059669"],
      stroke: "#047857",
      accent: "text-cyan-300/60",
      label: "Rivers & Waterways",
    },
    mountain: {
      ocean: "from-slate-700 via-slate-600 to-stone-700",
      island: ["#a3e635", "#65a30d", "#4d7c0f"],
      stroke: "#365314",
      accent: "text-amber-300/60",
      label: "Mountains & Peaks",
    },
    plain: {
      ocean: "from-sky-600 via-sky-500 to-blue-600",
      island: ["#86efac", "#4ade80", "#22c55e"],
      stroke: "#166534",
      accent: "text-lime-300/60",
      label: "Plains & Plateaus",
    },
    reservoir: {
      ocean: "from-indigo-700 via-blue-600 to-indigo-800",
      island: ["#6ee7b7", "#34d399", "#10b981"],
      stroke: "#065f46",
      accent: "text-teal-300/60",
      label: "Reservoirs & Lakes",
    },
    crater: {
      ocean: "from-gray-800 via-zinc-700 to-gray-900",
      island: ["#bef264", "#84cc16", "#65a30d"],
      stroke: "#3f6212",
      accent: "text-orange-300/60",
      label: "Volcanic Craters",
    },
  }

  const currentTheme = featureThemes[filter]

  const mapRef = useRef<HTMLDivElement>(null)

  const handleLocationClick = (location: MauritiusFeature | MapLocation) => {
    if (location.island !== activeMap) {
      setActiveMap(location.island)
    }
    setSelectedLocation(location)
    setVisitedLocations(prev => new Set([...prev, location.id]))
  }

  const filteredFeatures = mauritiusFeatures.filter(feat =>
    feat.type === filter
  )

  const latLngToXY = useCallback((lat: number, lng: number) => {
    const x = 1331.0 * lng + (-147.1) * lat + (-79102.2)
    const y = (-3.5) * lng + (-1385.4) * lat + (-27255.5)
    return { x, y }
  }, [])

  // Convert coordinate points to a smooth SVG cubic bezier path (Catmull-Rom interpolation)
  const pointsToSmoothPath = useCallback((coords: [number, number][]) => {
    if (coords.length < 2) return ""
    const pts = coords.map(([lat, lng]) => {
      const { x, y } = latLngToXY(lat, lng)
      return [x, y] as [number, number]
    })
    let d = `M ${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(i + 2, pts.length - 1)]
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
    }
    return d
  }, [latLngToXY])

  const zoom = activeMap === "mauritius" ? mauZoom : rodZoom
  const pan = activeMap === "mauritius" ? mauPan : rodPan

  const handleZoomIn = () => {
    if (activeMap === "mauritius") setMauZoom(z => Math.min(z + 0.25, 3))
    else setRodZoom(z => Math.min(z + 0.25, 3))
  }
  const handleZoomOut = () => {
    if (activeMap === "mauritius") setMauZoom(z => Math.max(z - 0.25, 0.5))
    else setRodZoom(z => Math.max(z - 0.25, 0.5))
  }
  const handleReset = () => {
    if (activeMap === "mauritius") { setMauZoom(1); setMauPan({ x: 0, y: 0 }) }
    else { setRodZoom(1); setRodPan({ x: 0, y: 0 }) }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      if (activeMap === "mauritius") {
        setMauDragging(true)
        setMauDragStart({ x: e.clientX - mauPan.x, y: e.clientY - mauPan.y })
      } else {
        setRodDragging(true)
        setRodDragStart({ x: e.clientX - rodPan.x, y: e.clientY - rodPan.y })
      }
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeMap === "mauritius" && mauDragging) {
      setMauPan({ x: e.clientX - mauDragStart.x, y: e.clientY - mauDragStart.y })
    } else if (activeMap === "rodrigues" && rodDragging) {
      setRodPan({ x: e.clientX - rodDragStart.x, y: e.clientY - rodDragStart.y })
    }
  }
  const handleMouseUp = () => {
    setMauDragging(false)
    setRodDragging(false)
  }

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (activeMap === "mauritius") {
        setMauDragging(true)
        setMauDragStart({ x: touch.clientX - mauPan.x, y: touch.clientY - mauPan.y })
      } else {
        setRodDragging(true)
        setRodDragStart({ x: touch.clientX - rodPan.x, y: touch.clientY - rodPan.y })
      }
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (activeMap === "mauritius" && mauDragging) {
        setMauPan({ x: touch.clientX - mauDragStart.x, y: touch.clientY - mauDragStart.y })
      } else if (activeMap === "rodrigues" && rodDragging) {
        setRodPan({ x: touch.clientX - rodDragStart.x, y: touch.clientY - rodDragStart.y })
      }
    }
  }
  const handleTouchEnd = () => {
    setMauDragging(false)
    setRodDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) handleZoomIn()
    else handleZoomOut()
  }

  const labelOffsets: Record<string, { dx: number; dy: number; anchor?: string }> = {
    "plaine-wilhems": { dx: -30, dy: -10 },
    "trou-aux-cerfs": { dx: 30, dy: 0, anchor: "start" },
    "plaine-champagne": { dx: -30, dy: -5, anchor: "end" },
    "bassin-blanc": { dx: -30, dy: 12, anchor: "end" },
    "mont-cocotte": { dx: 25, dy: 10, anchor: "start" },
    "grand-bassin-crater": { dx: 30, dy: -5, anchor: "start" },
    "mare-longue": { dx: 20, dy: 0, anchor: "start" },
    "mare-aux-vacoas": { dx: -20, dy: 5, anchor: "end" },
    "piton-du-milieu": { dx: 20, dy: 5, anchor: "start" },
    "caverne-patate": { dx: -25, dy: 0, anchor: "end" },
    "plaine-corail": { dx: -25, dy: 8, anchor: "end" },
    "anse-mourouk": { dx: -20, dy: 0, anchor: "end" },
    "trou-dargent": { dx: 20, dy: 5, anchor: "start" },
    "mont-limon": { dx: 0, dy: -10 },
    // New feature offsets to avoid overlap
    "montagne-du-rempart": { dx: -25, dy: 5, anchor: "end" },
    "piton-riviere-noire": { dx: -25, dy: 0, anchor: "end" },
    "tourelle-du-tamarin": { dx: 25, dy: -5, anchor: "start" },
    "trois-mamelles": { dx: -25, dy: 0, anchor: "end" },
    "corps-de-garde": { dx: 25, dy: 0, anchor: "start" },
    "plaine-sophie": { dx: -25, dy: 5, anchor: "end" },
    "bois-cheri-crater": { dx: 25, dy: 0, anchor: "start" },
    "kanaka-crater": { dx: -25, dy: 0, anchor: "end" },
    "curepipe-point": { dx: 25, dy: 5, anchor: "start" },
    "mare-aux-joncs": { dx: -20, dy: 5, anchor: "end" },
    "bagatelle-dam": { dx: 20, dy: 5, anchor: "start" },
    "mont-ory": { dx: 20, dy: 0, anchor: "start" },
    "midlands-dam": { dx: -20, dy: 0, anchor: "end" },
    "la-ferme": { dx: -20, dy: 5, anchor: "end" },
    "eau-bleue": { dx: 20, dy: 0, anchor: "start" },
    "plaine-st-pierre": { dx: -20, dy: 0, anchor: "end" },
  }

  // Per-river label positioning to avoid overlap & clustering
  const riverLabelConfig: Record<string, { startOffset: string; dy: number; fontSize: number }> = {
    "riviere-noire":              { startOffset: "50%", dy: -7,  fontSize: 10 },
    "grande-riviere-nord-ouest":  { startOffset: "55%", dy: -8,  fontSize: 9.5 },
    "grande-riviere-sud-est":     { startOffset: "50%", dy: 9,   fontSize: 9.5 },
    "riviere-du-rempart":         { startOffset: "70%", dy: -8,  fontSize: 10 },
    "riviere-des-creoles":        { startOffset: "55%", dy: 9,   fontSize: 10 },
    "riviere-tamarin":            { startOffset: "35%", dy: -8,  fontSize: 10 },
    "riviere-du-tombeau":         { startOffset: "30%", dy: -8,  fontSize: 10 },
    "riviere-terre-rouge":        { startOffset: "65%", dy: 9,   fontSize: 10 },
    "riviere-du-poste":           { startOffset: "60%", dy: -8,  fontSize: 10 },
    "riviere-savanne":            { startOffset: "40%", dy: 9,   fontSize: 10 },
    "riviere-des-anguilles":      { startOffset: "55%", dy: -8,  fontSize: 10 },
    "riviere-seche":              { startOffset: "35%", dy: 9,   fontSize: 10 },
    "riviere-baie-du-cap":        { startOffset: "50%", dy: -7,  fontSize: 10 },
    "riviere-des-galets":         { startOffset: "55%", dy: 9,   fontSize: 10 },
    "riviere-cascade":            { startOffset: "40%", dy: 9,   fontSize: 10 },
    "riviere-citron":             { startOffset: "40%", dy: -7,  fontSize: 10 },
    "riviere-la-chaux":           { startOffset: "55%", dy: -7,  fontSize: 10 },
    "riviere-profonde":           { startOffset: "60%", dy: 9,   fontSize: 10 },
    "riviere-dragon":             { startOffset: "30%", dy: 9,   fontSize: 10 },
    "riviere-bambou":             { startOffset: "45%", dy: -8,  fontSize: 10 },
  }

  const getIconComponent = (iconName: string, size = "w-4 h-4") => {
    switch(iconName) {
      case "building": return <Building className={size} />
      case "mountain": return <Mountain className={size} />
      case "waves": return <Waves className={size} />
      case "tree": return <TreePalm className={size} />
      case "ship": return <Ship className={size} />
      case "bird": return <Bird className={size} />
      case "landmark": return <Landmark className={size} />
      case "droplets": return <Droplets className={size} />
      case "flame": return <Flame className={size} />
      case "wheat": return <Wheat className={size} />
      default: return <MapPin className={size} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 overflow-x-hidden">


      <div className="relative z-10 p-2 md:p-3 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="kid-btn bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                🏠 Back Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="kid-heading text-2xl md:text-3xl font-bold text-white">🗺️ Interactive Map</h1>
              </div>
            </div>
          </div>


        </div>

        {/* MAP KEY */}
        <div className="mt-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm px-4 py-3">
          {/* Key heading */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 select-none">▬</span>
            <span className="text-sm font-extrabold uppercase tracking-widest text-white select-none">MAP KEY</span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 select-none">▬</span>
            <span className="ml-auto text-[11px] text-white/40 italic select-none">click to filter</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeMap === "mauritius" ? (
              <>
                {[
                  { key: "river",     label: "Rivers",     icon: Waves,    swatch: "bg-blue-500"  },
                  { key: "mountain",  label: "Mountains",  icon: Mountain,  swatch: "bg-amber-700" },
                  { key: "plain",     label: "Plains",     icon: Wheat,    swatch: "bg-lime-500"  },
                  { key: "reservoir", label: "Reservoirs", icon: Droplets, swatch: "bg-cyan-500"  },
                  { key: "crater",    label: "Craters",    icon: Flame,    swatch: "bg-red-500"   },
                ].map(({ key, label, icon: Icon, swatch }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key as typeof filter)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                      ${filter === key
                        ? "bg-white text-slate-800 border-white shadow-lg shadow-white/20"
                        : "bg-white/5 text-white/80 border-white/20 hover:bg-white/15 hover:border-white/40"
                      }`}
                  >
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 ${swatch}`} />
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { key: "history",   label: "History",   icon: Landmark, swatch: "bg-amber-500"  },
                  { key: "geography", label: "Geography", icon: Mountain,  swatch: "bg-green-500"  },
                  { key: "both",      label: "Both",      icon: Compass,   swatch: "bg-purple-500" },
                ].map(({ key, label, icon: Icon, swatch }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRodCategory(key as typeof rodCategory)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                      ${rodCategory === key
                        ? "bg-white text-slate-800 border-white shadow-lg shadow-white/20"
                        : "bg-white/5 text-white/80 border-white/20 hover:bg-white/15 hover:border-white/40"
                      }`}
                  >
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 ${swatch}`} />
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </>
            )}

            {/* Visited — purely informational */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/5 text-white/80 select-none">
              <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-emerald-400 text-white flex-shrink-0">
                <svg viewBox="0 0 10 10" className="w-1.5 h-1.5" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>
              </span>
              Visited
            </span>

            {/* District / Zone toggles moved into key bar */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={() => setShowDistricts(!showDistricts)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                  ${showDistricts ? "bg-white text-slate-800 border-white" : "bg-white/5 text-white/60 border-white/20 hover:bg-white/10"}`}>
                Districts
              </button>
              <button type="button" onClick={() => setShowZones(!showZones)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                  ${showZones ? "bg-white text-slate-800 border-white" : "bg-white/5 text-white/60 border-white/20 hover:bg-white/10"}`}>
                Zones
              </button>
            </div>
          </div>
        </div>


        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* === SINGLE MAP CARD === */}
            <Card className={`relative overflow-hidden border-2 shadow-2xl transition-all duration-700 ease-in-out ${
              activeMap === "mauritius"
                ? "bg-gradient-to-br from-blue-950 to-cyan-950 border-cyan-500/30 shadow-cyan-500/20"
                : "bg-gradient-to-br from-teal-950 to-cyan-950 border-teal-500/30 shadow-teal-500/20"
            }`}>
              {/* Animated border glow */}
              <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-700 ${
                activeMap === "mauritius" ? "opacity-100 animate-map-glow-cyan" : "opacity-0"
              }`} />
              <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-700 ${
                activeMap === "rodrigues" ? "opacity-100 animate-map-glow-teal" : "opacity-0"
              }`} />
              {/* Island toggle tabs */}
              <div className="absolute top-4 left-4 z-20 flex rounded-lg overflow-hidden border border-white/20 bg-black/40 backdrop-blur-sm shadow-lg">
                <button
                  onClick={() => setActiveMap("mauritius")}
                  className={`px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                    activeMap === "mauritius" ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/40 shadow-md" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >Mauritius</button>
                <button
                  onClick={() => setActiveMap("rodrigues")}
                  className={`px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                    activeMap === "rodrigues" ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/40 shadow-md" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >Rodrigues</button>
              </div>

              {/* Zoom controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <Button size="icon" variant="secondary" onClick={handleZoomIn} className="bg-white/90 hover:bg-white shadow-lg"><ZoomIn className="w-4 h-4" /></Button>
                <Button size="icon" variant="secondary" onClick={handleZoomOut} className="bg-white/90 hover:bg-white shadow-lg"><ZoomOut className="w-4 h-4" /></Button>
                <Button size="icon" variant="secondary" onClick={handleReset} className="bg-white/90 hover:bg-white shadow-lg"><RotateCcw className="w-4 h-4" /></Button>
              </div>

              {/* Zoom indicator */}
              <div className="absolute top-14 left-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm font-mono">
                Zoom: {(zoom * 100).toFixed(0)}%
              </div>

              {/* Slide arrows */}
              {activeMap === "mauritius" && (
                <button onClick={() => setActiveMap("rodrigues")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-teal-500/70 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 border border-white/20 hover:border-teal-400/50 hover:scale-110 animate-pulse-grow"
                  title="Slide to Rodrigues">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {activeMap === "rodrigues" && (
                <button onClick={() => setActiveMap("mauritius")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-cyan-500/70 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 border border-white/20 hover:border-cyan-400/50 hover:scale-110 animate-pulse-grow"
                  title="Slide to Mauritius">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Interactive map area */}
              <div
                ref={mapRef}
                className="relative aspect-[4/3] md:aspect-[16/10] cursor-grab active:cursor-grabbing overflow-hidden touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                {/* Ocean background */}
                <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-700 ${currentTheme.ocean}`} />

                {/* Sliding container */}
                <div
                  className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(${activeMap === "mauritius" ? "0%" : "-100%"})` }}
                >
                  {/* MAURITIUS */}
                  <div className="relative w-full h-full flex-shrink-0">
                    <div className="absolute inset-0 transition-transform duration-100 animate-island-breathe"
                      style={{ transform: `scale(${mauZoom}) translate(${mauPan.x / mauZoom}px, ${mauPan.y / mauZoom}px)` }}>
                      <svg viewBox="140 190 680 800" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" overflow="visible">
                        <defs>
                          <linearGradient id="islandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={currentTheme.island[0]} />
                            <stop offset="50%" stopColor={currentTheme.island[1]} />
                            <stop offset="100%" stopColor={currentTheme.island[2]} />
                          </linearGradient>
                          {/* Mountain gradient — warm earth tones with snow suggestion */}
                          <linearGradient id="mountainGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="40%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#78350f" />
                          </linearGradient>
                          {/* Crater gradient — fiery rim */}
                          <radialGradient id="craterGrad" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" stopColor="#dc2626" />
                            <stop offset="60%" stopColor="#991b1b" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                          </radialGradient>
                          {/* Reservoir gradient — calm water */}
                          <radialGradient id="reservoirGrad" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" stopColor="#67e8f9" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#0e7490" />
                          </radialGradient>
                          {/* Plain gradient — lush grass */}
                          <radialGradient id="plainGrad" cx="50%" cy="40%" r="60%">
                            <stop offset="0%" stopColor="#a3e635" />
                            <stop offset="60%" stopColor="#65a30d" />
                            <stop offset="100%" stopColor="#3f6212" />
                          </radialGradient>
                          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.4"/>
                          </filter>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          <filter id="featureGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur"/>
                            <feMerge>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Island fill — each district as its own path so borders can be toggled */}
                        <g>
                          {mauritiusDistricts.map(district => (
                            <path key={district.id} d={district.d} fill="url(#islandGradient)" stroke={showDistricts ? currentTheme.stroke : "none"} strokeWidth={showDistricts ? "1.5" : "0"} strokeLinejoin="round" className="transition-all duration-500" />
                          ))}
                        </g>
                        {/* Outer coastline border */}
                        <path d={mauritiusDistricts.map(d => d.d).join(' ')} fill="none" stroke={currentTheme.stroke} strokeWidth="3" strokeLinejoin="round" className="transition-all duration-500" filter="url(#shadow)" style={{ paintOrder: 'stroke' }} />
                        {/* District name labels */}
                        {showDistricts && districts.map(district => {
                          const { x, y } = latLngToXY(district.center[0], district.center[1])
                          return (
                            <text key={district.name} x={x} y={y} textAnchor="middle" className="pointer-events-none select-none" style={{ fontSize: '8px', fontWeight: 700, fill: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)', letterSpacing: '0.5px' }}>
                              {district.name}
                            </text>
                          )
                        })}
                        {/* ══════ RIVERS — smooth bezier with animated flow ══════ */}
                        {filteredFeatures.filter(f => f.type === "river" && f.path).map((river) => {
                          const d = pointsToSmoothPath(river.path!)
                          const isSelected = selectedLocation?.id === river.id
                          return (
                            <g key={river.id} className="cursor-pointer animate-feature-appear" onClick={(e) => { e.stopPropagation(); handleLocationClick(river) }}>
                              <defs>
                                <path id={`river-path-${river.id}`} d={d} fill="none" />
                              </defs>
                              {/* Selection halo */}
                              {isSelected && (
                                <path d={d} fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" className="animate-pulse" />
                              )}
                              {/* Main river body */}
                              <path d={d} fill="none" stroke="#60a5fa" strokeWidth={isSelected ? "3.5" : "2.5"} strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision" />
                              {/* Animated flow */}
                              <path d={d} fill="none" stroke="#bae6fd" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" className="animate-river-flow" shapeRendering="geometricPrecision" />
                            </g>
                          )
                        })}
                        {/* River labels — follow river curve */}
                        {filteredFeatures.filter(f => f.type === "river" && f.path).map((river) => {
                          const cfg = riverLabelConfig[river.id] || { startOffset: "45%", dy: 0, fontSize: 10 }
                          return (
                            <text key={`label-${river.id}`} textAnchor="middle" className="text-halo-river pointer-events-none select-none" style={{ fontSize: `${cfg.fontSize}px`, letterSpacing: '0.5px', fontStyle: 'italic' }}>
                              <textPath href={`#river-path-${river.id}`} startOffset={cfg.startOffset} dy={cfg.dy} fill="#ffffff" fontWeight="600">
                                {river.name}
                              </textPath>
                            </text>
                          )
                        })}

                        {/* ══════ POINT FEATURES — beautiful icons with animations ══════ */}
                        {filteredFeatures.filter(f => f.type !== "river").map((feature) => {
                          const { x, y } = latLngToXY(feature.lat, feature.lng)
                          const isSelected = selectedLocation?.id === feature.id
                          const isVisited = visitedLocations.has(feature.id)
                          return (
                            <g key={feature.id} className="cursor-pointer animate-feature-appear" onClick={(e) => { e.stopPropagation(); handleLocationClick(feature) }}>
                              {/* Selection ring */}
                              {isSelected && <circle cx={x} cy={y} r="28" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 3" className="animate-pulse" />}

                              {/* ── MOUNTAIN ── */}
                              {feature.type === "mountain" && (
                                <g className="animate-mountain-bob">
                                  {/* Shadow */}
                                  <ellipse cx={x} cy={y + 12} rx="14" ry="4" fill="black" opacity="0.15" />
                                  {/* Main peak */}
                                  <polygon points={`${x},${y - 20} ${x - 18},${y + 10} ${x + 18},${y + 10}`} fill="url(#mountainGrad)" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
                                  {/* Snow cap */}
                                  <polygon points={`${x},${y - 20} ${x - 6},${y - 8} ${x + 6},${y - 8}`} fill="white" opacity="0.85" strokeLinejoin="round" />
                                  {/* Ridge line */}
                                  <line x1={x - 3} y1={y - 5} x2={x + 10} y2={y + 4} stroke="#92400e" strokeWidth="0.8" opacity="0.4" />
                                </g>
                              )}

                              {/* ── CRATER ── */}
                              {feature.type === "crater" && (
                                <g>
                                  {/* Outer rim */}
                                  <ellipse cx={x} cy={y} rx="16" ry="12" fill="url(#craterGrad)" stroke="#7f1d1d" strokeWidth="1.2" />
                                  {/* Inner pit */}
                                  <ellipse cx={x} cy={y + 1} rx="9" ry="6" fill="#450a0a" opacity="0.7" />
                                  {/* Lava glow */}
                                  <ellipse cx={x} cy={y + 1} rx="5" ry="3" fill="#f97316" opacity="0.5" className="animate-crater-glow" />
                                  {/* Rim highlight */}
                                  <path d={`M${x - 12},${y - 4} Q${x},${y - 11} ${x + 12},${y - 4}`} fill="none" stroke="white" strokeWidth="0.8" opacity="0.35" />
                                </g>
                              )}

                              {/* ── RESERVOIR ── */}
                              {feature.type === "reservoir" && (
                                <g>
                                  {/* Animated ripple ring */}
                                  <circle cx={x} cy={y} r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.5" className="animate-reservoir-ripple" />
                                  {/* Water body */}
                                  <ellipse cx={x} cy={y} rx="14" ry="10" fill="url(#reservoirGrad)" stroke="#0e7490" strokeWidth="1.2" />
                                  {/* Wave lines */}
                                  <path d={`M${x - 8},${y - 2} Q${x - 4},${y - 5} ${x},${y - 2} Q${x + 4},${y + 1} ${x + 8},${y - 2}`} fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
                                  <path d={`M${x - 6},${y + 2} Q${x - 2},${y - 1} ${x + 2},${y + 2} Q${x + 5},${y + 5} ${x + 6},${y + 2}`} fill="none" stroke="white" strokeWidth="0.8" opacity="0.4" />
                                  {/* Sparkle */}
                                  <circle cx={x - 5} cy={y - 4} r="1.5" fill="white" opacity="0.7" className="animate-sparkle" />
                                </g>
                              )}

                              {/* ── PLAIN ── */}
                              {feature.type === "plain" && (
                                <g className="animate-plain-sway">
                                  {/* Ground */}
                                  <ellipse cx={x} cy={y + 6} rx="16" ry="6" fill="url(#plainGrad)" stroke="#3f6212" strokeWidth="1" />
                                  {/* Grass blades */}
                                  <line x1={x - 8} y1={y + 4} x2={x - 10} y2={y - 6} stroke="#65a30d" strokeWidth="1.8" strokeLinecap="round" />
                                  <line x1={x - 3} y1={y + 3} x2={x - 4} y2={y - 9} stroke="#84cc16" strokeWidth="2" strokeLinecap="round" />
                                  <line x1={x + 3} y1={y + 3} x2={x + 2} y2={y - 8} stroke="#65a30d" strokeWidth="1.8" strokeLinecap="round" />
                                  <line x1={x + 8} y1={y + 4} x2={x + 9} y2={y - 5} stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round" />
                                  {/* Tiny flower accent */}
                                  <circle cx={x - 4} cy={y - 9} r="2" fill="#fbbf24" opacity="0.8" />
                                  <circle cx={x + 2} cy={y - 8} r="1.8" fill="#f472b6" opacity="0.7" />
                                </g>
                              )}

                              {/* Visited badge */}
                              {isVisited && (
                                <g>
                                  <circle cx={x + 14} cy={y - 14} r="6" fill="#22c55e" stroke="white" strokeWidth="1.5" />
                                  <path d={`M${x + 11},${y - 14} l2,2 l4,-4`} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                              )}
                            </g>
                          )
                        })}
                        {/* Labels for point features */}
                        {filteredFeatures.filter(f => f.type !== "river").map((feature) => {
                          const { x, y } = latLngToXY(feature.lat, feature.lng)
                          const baseY = feature.type === "mountain" ? y - 28 : y - 20
                          const offset = labelOffsets[feature.id]
                          const lx = x + (offset?.dx ?? 0)
                          const ly = baseY + (offset?.dy ?? 0)
                          const anchor = (offset?.anchor ?? "middle") as "start" | "middle" | "end"
                          return (
                            <g key={`label-${feature.id}`}>
                              {offset && (
                                <line x1={x} y1={baseY + 4} x2={lx} y2={ly + 4} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                              )}
                              <text x={lx} y={ly} textAnchor={anchor} className="text-halo fill-white pointer-events-none select-none" style={{ fontSize: '9px', fontWeight: 600 }}>
                                {feature.name}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* RODRIGUES */}
                  <div className="relative w-full h-full flex-shrink-0">
                    {rodLoading || !rodMapData ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="text-5xl animate-bounce-gentle">🏝️</div>
                        <p className="text-white/80 font-semibold animate-pulse">Loading Rodrigues Island...</p>
                      </div>
                    ) : (
                    <div className="absolute inset-0 transition-transform duration-100 animate-island-breathe"
                      style={{ transform: `scale(${rodZoom}) translate(${rodPan.x / rodZoom}px, ${rodPan.y / rodZoom}px)` }}>
                      <svg viewBox="5 10 660 420" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="rodIslandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="50%" stopColor="#16a34a" />
                            <stop offset="100%" stopColor="#15803d" />
                          </linearGradient>
                          <linearGradient id="rodSmallIslandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4ade80" />
                            <stop offset="50%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#16a34a" />
                          </linearGradient>
                          <filter id="rodShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="2" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.4"/>
                          </filter>
                          <filter id="rodGlow">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          <clipPath id="rodClip">
                            <path d={rodMapData.rodriguesCoastline.d} transform={rodMapData.rodriguesCoastline.transform} />
                          </clipPath>
                        </defs>
                        {/* Base island fill */}
                        <g transform={rodMapData.rodriguesCoastline.transform}>
                          <path d={rodMapData.rodriguesCoastline.d} fill="#e8d5a3" stroke="#b8860b" strokeWidth="2" filter="url(#rodShadow)" className="transition-all duration-300" />
                        </g>
                        {/* Zone color patches clipped to island boundary */}
                        <g clipPath="url(#rodClip)">
                          {rodMapData.rodriguesZones.map((zone, i) => {
                            const zoneColors = [
                              "#81c784", "#a5d6a7", "#66bb6a", "#4db6ac", "#80cbc4",
                              "#aed581", "#c5e1a5", "#dce775", "#fff176", "#ffcc80",
                              "#ef9a9a", "#ce93d8", "#90caf9", "#80deea"
                            ]
                            return (
                              <ellipse
                                key={zone.id}
                                cx={zone.x}
                                cy={zone.y}
                                rx={38}
                                ry={30}
                                fill={zoneColors[i % zoneColors.length]}
                                opacity={0.55}
                              />
                            )
                          })}
                        </g>
                        <g transform={ISLAND_LAYER_TRANSFORM}>
                          {rodMapData.rodriguesSmallIslands.map((island) => (
                            <path key={island.id} d={island.d} fill="#f7d96e" stroke="#b8860b" strokeWidth="1" opacity="1" className="transition-all duration-300" />
                          ))}
                        </g>
                        <g transform={rodMapData.rodriguesRunway.transform}>
                          <path d={rodMapData.rodriguesRunway.d} fill="#6b7280" stroke="#4b5563" strokeWidth="0.6" />
                        </g>
                        {showZones && (
                          <g transform={rodMapData.rodriguesZoneBorders.transform}>
                            <path d={rodMapData.rodriguesZoneBorders.d} fill="none" stroke="#5d4037" strokeWidth="0.8" strokeDasharray="6,4" opacity="0.7" />
                          </g>
                        )}
                        {showZones && rodMapData.rodriguesZones.map((zone) => (
                          <text key={zone.id} x={zone.x} y={zone.y} textAnchor="middle" className="fill-white/70 font-semibold pointer-events-none select-none" style={{ fontSize: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                            {zone.name}
                          </text>
                        ))}
                        {rodMapData.rodriguesNamedIslands.map((island, i) => (
                          <text key={i} x={island.x} y={island.y} textAnchor="middle" className="fill-cyan-100/70 italic pointer-events-none select-none" style={{ fontSize: '7px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {island.name}
                          </text>
                        ))}
                        {rodLocations
                          .filter(loc => loc.category === rodCategory)
                          .map((location) => {
                          const isSelected = selectedLocation?.id === location.id
                          const isVisited = visitedLocations.has(location.id)
                          const catColor = location.category === "history" ? "#f59e0b"
                            : location.category === "geography" ? "#22c55e" : "#a855f7"
                          const labelOff = labelOffsets[location.id]
                          const labelX = (location.x ?? 0) + (labelOff?.dx ?? 0)
                          const labelY = (location.y ?? 0) - 16 + (labelOff?.dy ?? 0)
                          const labelAnchor = (labelOff?.anchor ?? "middle") as "start" | "middle" | "end"
                          return (
                            <g key={location.id} className="cursor-pointer animate-feature-appear" onClick={(e) => { e.stopPropagation(); handleLocationClick(location) }}>
                              {/* Selection ring */}
                              {isSelected && <circle cx={location.x} cy={location.y} r="18" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />}
                              {/* Subtle glow */}
                              <circle cx={location.x} cy={location.y} r="12" fill={catColor} opacity="0.15" className="animate-pulse" />
                              {/* Main marker */}
                              <circle cx={location.x} cy={location.y} r="10" fill={location.markerColor} stroke="white" strokeWidth="2" filter="url(#rodShadow)" />
                              {/* Category dot indicator */}
                              <circle cx={(location.x ?? 0) - 8} cy={(location.y ?? 0) - 8} r="3.5" fill={catColor} stroke="white" strokeWidth="1" />
                              {/* Visited checkmark */}
                              {isVisited && (
                                <g>
                                  <circle cx={(location.x ?? 0) + 8} cy={(location.y ?? 0) - 8} r="5" fill="#22c55e" stroke="white" strokeWidth="1" />
                                  <path d={`M${(location.x ?? 0) + 6},${(location.y ?? 0) - 8} l1.5,1.5 l3,-3`} fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                              )}
                              {/* Label */}
                              <text x={labelX} y={labelY} textAnchor={labelAnchor} className="text-halo-sm fill-white pointer-events-none select-none" style={{ fontSize: '7px', fontWeight: 600 }}>
                                {location.name}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                    )}
                  </div>
                </div>

                {/* Compass */}
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs font-bold text-blue-600">N</div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-red-500 -translate-x-1/2 -translate-y-1/2 rotate-0 origin-center" />
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-blue-500 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Scale bar */}
                <div className="absolute bottom-4 left-20 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <div className="w-16 h-1 bg-white rounded" />
                    <span>{activeMap === "mauritius" ? "~20 km" : "~5 km"}</span>
                  </div>
                </div>

                {/* Slide indicator dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <button onClick={() => setActiveMap("mauritius")} className={`w-3 h-3 rounded-full transition-all duration-500 ${activeMap === "mauritius" ? "bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50" : "bg-white/40 hover:bg-white/60"}`} />
                  <button onClick={() => setActiveMap("rodrigues")} className={`w-3 h-3 rounded-full transition-all duration-500 ${activeMap === "rodrigues" ? "bg-teal-400 scale-125 shadow-lg shadow-teal-400/50" : "bg-white/40 hover:bg-white/60"}`} />
                </div>

                {/* Ocean label */}
                <div className={`absolute top-14 left-1/2 -translate-x-1/2 text-sm font-medium italic transition-colors duration-700 ${
                  activeMap === "mauritius" ? currentTheme.accent : "text-teal-300/60"
                }`}>
                  Indian Ocean
                </div>
              </div>
            </Card>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {(activeMap === "mauritius"
                ? [
                    { color: "bg-blue-500", label: "Rivers" },
                    { color: "bg-amber-700", label: "Mountains" },
                    { color: "bg-lime-600", label: "Plains" },
                    { color: "bg-cyan-600", label: "Reservoirs" },
                    { color: "bg-red-600", label: "Craters" },
                    { icon: "check", label: "Visited" }
                  ]
                : [
                    { color: "bg-amber-500", label: "History" },
                    { color: "bg-green-500", label: "Geography" },
                    { color: "bg-purple-500", label: "Both" },
                    { icon: "check", label: "Visited" }
                  ]
              ).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  {item.icon === "check" ? (
                    <span className="text-green-400 text-sm font-bold">✓</span>
                  ) : (
                    <div className={`w-3 h-3 ${item.color} rounded-full`} />
                  )}
                  <span className="text-sm text-white">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Quick location lists */}
            <div className="grid xl:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-semibold text-cyan-300 mb-2">Mauritius</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredFeatures.map((location) => (
                    <button key={location.id} onClick={() => handleLocationClick(location)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-xs ${
                        selectedLocation?.id === location.id
                          ? 'bg-cyan-500/30 border-cyan-400 border'
                          : 'bg-white/5 border-white/10 border hover:bg-white/10'
                      }`}>
                      <div className={`w-5 h-5 rounded-full ${location.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {getIconComponent(location.icon, "w-2.5 h-2.5")}
                      </div>
                      <span className="text-white/90 truncate">{location.name}</span>
                      {visitedLocations.has(location.id) && <span className="ml-auto text-green-400 text-[10px]">âœ“</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-300 mb-2">Rodrigues</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {rodLocations
                    .filter(loc => loc.category === rodCategory)
                    .map((location) => (
                    <button key={location.id} onClick={() => handleLocationClick(location)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-xs ${
                        selectedLocation?.id === location.id
                          ? 'bg-teal-500/30 border-teal-400 border'
                          : 'bg-white/5 border-white/10 border hover:bg-white/10'
                      }`}>
                      <div className={`w-5 h-5 rounded-full ${location.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {getIconComponent(location.icon, "w-2.5 h-2.5")}
                      </div>
                      <span className="text-white/90 truncate">{location.name}</span>
                      {visitedLocations.has(location.id) && <span className="ml-auto text-green-400 text-[10px]">âœ“</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-1">
            {selectedLocation ? (() => {
              const isFeature = 'type' in selectedLocation
              const itemColors = isFeature
                ? featureTypeColors[(selectedLocation as MauritiusFeature).type]
                : categoryColors[(selectedLocation as MapLocation).category]
              const itemLabel = isFeature
                ? featureTypeLabels[(selectedLocation as MauritiusFeature).type]
                : categoryLabels[(selectedLocation as MapLocation).category]
              return (
              <Card className={`overflow-hidden border-2 ${itemColors.border} bg-white shadow-xl`}>
                {selectedLocation.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image src={selectedLocation.image} alt={selectedLocation.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${itemColors.bg} ${itemColors.text}`}>
                        {itemLabel}
                      </span>
                    </div>
                    <button onClick={() => setSelectedLocation(null)}
                      className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${selectedLocation.color} flex items-center justify-center text-white shadow-lg`}>
                      {getIconComponent(selectedLocation.icon, "w-6 h-6")}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">{selectedLocation.title}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedLocation.island === "mauritius" ? "bg-cyan-100 text-cyan-700" : "bg-teal-100 text-teal-700"
                        }`}>
                          {selectedLocation.island === "mauritius" ? "Mauritius" : "Rodrigues"}
                        </span>
                        {!selectedLocation.image && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${itemColors.bg} ${itemColors.text}`}>
                            {itemLabel}
                          </span>
                        )}
                        {isFeature && (selectedLocation as MauritiusFeature).elevation && (
                          <span className="text-sm text-gray-500">{(selectedLocation as MauritiusFeature).elevation}</span>
                        )}
                        {!isFeature && (selectedLocation as MapLocation).yearEstablished && (
                          <span className="text-sm text-gray-500">{(selectedLocation as MapLocation).yearEstablished}</span>
                        )}
                      </div>
                    </div>
                    {!selectedLocation.image && (
                      <button onClick={() => setSelectedLocation(null)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{isFeature ? itemLabel : (selectedLocation as MapLocation).region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>Lat: {selectedLocation.lat.toFixed(4)}</span>
                      <span>|</span>
                      <span>Lng: {selectedLocation.lng.toFixed(4)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{selectedLocation.description}</p>
                </div>
              </Card>
              )
            })() : (
              <Card className="p-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Select a Feature</h3>
                <p className="text-cyan-200 mb-6">
                  Click on any feature on the map or select from the lists below to learn about Mauritius and Rodrigues!
                </p>
                <div className="text-sm text-cyan-300">
                  <p className="mb-2">Use mouse wheel to zoom</p>
                  <p className="mb-2">Click and drag to pan</p>
                  <p>Use the tabs or arrows to switch islands</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
