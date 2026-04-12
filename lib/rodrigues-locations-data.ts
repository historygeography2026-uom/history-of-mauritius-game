// Rodrigues island location markers for the explore map
// Extracted to separate file for code-splitting — loaded on demand when user switches to Rodrigues tab

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

export const rodriguesLocations: MapLocation[] = [
  {
    id: "port-mathurin",
    name: "Port Mathurin",
    x: 312, y: 178,
    lat: -19.6819, lng: 63.4169,
    category: "history",
    icon: "building",
    color: "bg-blue-500",
    markerColor: "#3b82f6",
    title: "Port Mathurin – Capital of Rodrigues",
    description: "Port Mathurin is the tiny capital of Rodrigues Island. It sits on the north coast and serves as the administrative, commercial, and social hub of the island. Saturday market day brings the whole island together.",
    yearEstablished: "1735",
    region: "Port Mathurin",
    island: "rodrigues"
  },
  {
    id: "caverne-patate",
    name: "Caverne Patate",
    x: 248, y: 272,
    lat: -19.7350, lng: 63.3550,
    category: "geography",
    icon: "mountain",
    color: "bg-amber-600",
    markerColor: "#d97706",
    title: "Caverne Patate – Limestone Caves",
    description: "Caverne Patate is a spectacular network of limestone caves with stalactites and stalagmites in southwestern Rodrigues. The caves feature beautiful natural formations sculpted over millions of years.",
    region: "Plaine Corail",
    island: "rodrigues"
  },
  {
    id: "francois-leguat",
    name: "François Leguat Reserve",
    x: 252, y: 260,
    lat: -19.7250, lng: 63.3600,
    category: "both",
    icon: "bird",
    color: "bg-green-600",
    markerColor: "#16a34a",
    title: "François Leguat Giant Tortoise & Cave Reserve",
    description: "Named after the French Huguenot explorer who arrived in 1691, this reserve is home to over 3,000 giant tortoises and features impressive limestone caverns. It commemorates the first settlers of Rodrigues.",
    yearEstablished: "2007",
    region: "Plaine Corail",
    island: "rodrigues"
  },
  {
    id: "grande-montagne",
    name: "Grande Montagne",
    x: 292, y: 260,
    lat: -19.7200, lng: 63.3900,
    category: "geography",
    icon: "tree",
    color: "bg-emerald-500",
    markerColor: "#10b981",
    title: "Grande Montagne Nature Reserve",
    description: "Grande Montagne Nature Reserve protects some of the last remaining native vegetation of Rodrigues, including rare endemic species found nowhere else on Earth. A crucial conservation area.",
    region: "Grande Montagne",
    island: "rodrigues"
  },
  {
    id: "trou-dargent",
    name: "Trou d'Argent",
    x: 330, y: 298,
    lat: -19.7600, lng: 63.4350,
    category: "geography",
    icon: "waves",
    color: "bg-cyan-500",
    markerColor: "#06b6d4",
    title: "Trou d'Argent – Hidden Beach",
    description: "Trou d'Argent is a secluded cove on the southeast coast, often described as one of the most beautiful beaches in the Indian Ocean. Accessible only by a steep path, this turquoise lagoon is a hidden gem.",
    region: "Port Sud-Est",
    island: "rodrigues"
  },
  {
    id: "saint-gabriel",
    name: "Saint Gabriel Church",
    x: 268, y: 240,
    lat: -19.7100, lng: 63.3750,
    category: "history",
    icon: "landmark",
    color: "bg-purple-500",
    markerColor: "#a855f7",
    title: "Saint Gabriel Church",
    description: "Saint Gabriel Church is the oldest church on Rodrigues and one of the largest in the Indian Ocean. Built by the Rodriguan community, it is a testament to the island's strong Catholic heritage.",
    yearEstablished: "1939",
    region: "Coromandel",
    island: "rodrigues"
  },
  {
    id: "ile-aux-cocos",
    name: "Île aux Cocos",
    x: 52, y: 215,
    lat: -19.7250, lng: 63.2800,
    category: "geography",
    icon: "bird",
    color: "bg-teal-500",
    markerColor: "#14b8a6",
    title: "Île aux Cocos – Bird Sanctuary",
    description: "Île aux Cocos is a small island nature reserve off the west coast of Rodrigues, famous as a sanctuary for seabirds including fairy terns, noddies, and tropical birds. A boat trip there crosses a stunning turquoise lagoon.",
    region: "Offshore Island",
    island: "rodrigues"
  },
  {
    id: "mont-limon",
    name: "Mont Limon",
    x: 284, y: 225,
    lat: -19.7000, lng: 63.3850,
    category: "geography",
    icon: "mountain",
    color: "bg-indigo-500",
    markerColor: "#6366f1",
    title: "Mont Limon – Highest Point",
    description: "At 398 metres, Mont Limon is the highest point on Rodrigues Island. From the summit, you can enjoy panoramic views of the entire island, the surrounding lagoon, and the vast Indian Ocean.",
    region: "Mont Lubin",
    island: "rodrigues"
  },
  {
    id: "anse-mourouk",
    name: "Anse Mourouk",
    x: 318, y: 295,
    lat: -19.7500, lng: 63.4200,
    category: "geography",
    icon: "waves",
    color: "bg-sky-500",
    markerColor: "#0ea5e9",
    title: "Anse Mourouk – Southern Beach",
    description: "Anse Mourouk is a popular beach on the south coast of Rodrigues, known for kitesurfing and windsurfing. Unlike the calmer lagoon in the north, the southern coast offers exciting wave conditions.",
    region: "Port Sud-Est",
    island: "rodrigues"
  },
  {
    id: "cotton-bay",
    name: "Cotton Bay",
    x: 355, y: 232,
    lat: -19.7050, lng: 63.4400,
    category: "geography",
    icon: "waves",
    color: "bg-rose-500",
    markerColor: "#f43f5e",
    title: "Cotton Bay",
    description: "Cotton Bay is a beautiful bay on the eastern coast of Rodrigues, home to a hotel and some of the clearest waters around the island. It offers excellent snorkelling and diving opportunities.",
    region: "Graviers",
    island: "rodrigues"
  },
  {
    id: "plaine-corail",
    name: "Plaine Corail",
    x: 245, y: 290,
    lat: -19.7575, lng: 63.3610,
    category: "both",
    icon: "landmark",
    color: "bg-orange-500",
    markerColor: "#f97316",
    title: "Plaine Corail – Airport & Coral Plains",
    description: "Plaine Corail is the site of the Sir Gaëtan Duval Airport, and the area is named for the coral limestone plains that characterise this part of the island. Historically, it was a key area for agriculture.",
    yearEstablished: "1972",
    region: "Plaine Corail",
    island: "rodrigues"
  }
]
