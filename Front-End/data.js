// Import your assets
import banner1 from "./assets/banner1.png";
import banner2 from "./assets/banner2.png";
import banner3 from "./assets/banner3.png";
import banner4 from "./assets/banner4.png";
import banner5 from "./assets/banner5.png";
import banner6 from "./assets/banner6.png";

import thumbnail1 from "./assets/thumbnail1.png";
import thumbnail2 from "./assets/thumbnail2.png";
import thumbnail3 from "./assets/thumbnail3.png";
import thumbnail4 from "./assets/thumbnail4.png";
import thumbnail5 from "./assets/thumbnail5.png";



export const carouselData = [
  {
    id: 1,
    image: banner2,
    title: "Mag-imbak ng pagkain at tubig",
    description:
      "Siguraduhing may sapat na pagkain, tubig, at first aid kit bago ang bagyo.",
  },
  {
    id: 2,
    image: banner1,
    title: "Planuhin ang Evacuation Route",
    description:
      "Alamin ang ligtas na ruta palabas ng bahay at mga evacuation centers.",
  },
  {
    id: 3,
    image: banner4,
    title: "I-secure ang Bahay",
    description:
      "Takpan ang bintana, ayusin ang mga alitan, at alisin ang mga delikadong bagay.",
  },
  {
    id: 4,
    image: banner5,
    title: "Maghanda ng Emergency Kit",
    description:
      "Kasama dito ang flashlight, baterya, gamot, at importanteng dokumento.",
  },
  {
    id: 5,
    image: banner6,
    title: "Makipag-ugnayan sa Komunidad",
    description:
      "Alamin ang mga kapitbahay at mga volunteer para sa mabilisang tulong sa sakuna.",
  },
  {
    id: 6,
    image: banner3,
    title: "Linisin ang Canal",
    description:
      "Tanggalin ang basura sa kanal para maiwasan ang pagbaha sa panahon ng ulan o bagyo.",
  },
];

// Educational Videos Data
export const educationalVideos = [
  {
    id: 1,
    title: "Disaster Preparedness Guide",
    channel: "PH Disaster Resilience",
    duration: "15:30",
    views: "125K",
    uploadDate: "2 weeks ago",
    thumbnail: thumbnail5,
  },
  {
    id: 2,
    title: "Flood Safety Tips",
    channel: "Safety First PH",
    duration: "8:45",
    views: "89K",
    uploadDate: "1 month ago",
    thumbnail: thumbnail4,
  },
  {
    id: 3,
    title: "Emergency Evacuation Procedures",
    channel: "Red Cross Philippines",
    duration: "12:15",
    views: "156K",
    uploadDate: "3 weeks ago",
    thumbnail: thumbnail2,
  },
  {
    id: 4,
    title: "First Aid During Disasters",
    channel: "Health Emergency PH",
    duration: "20:10",
    views: "95K",
    uploadDate: "2 months ago",
    thumbnail: thumbnail1,
  },
  {
    id: 5,
    title: "Building Emergency Kits",
    channel: "Preparedness Channel",
    duration: "10:25",
    views: "67K",
    uploadDate: "1 week ago",
    thumbnail: banner5,
  },
  {
    id: 6,
    title: "Community Disaster Response",
    channel: "Community Safety",
    duration: "18:40",
    views: "112K",
    uploadDate: "3 months ago",
    thumbnail: thumbnail3,
  },
];

// Barangay Data for View Households
export const barangayData = [
  {
    id: 1,
    name: "Brgy. San Antonio",
    totalHouseholds: 245,
    evacuationCapacity: 300,
    currentEvacuation: 245,
  },
  {
    id: 2,
    name: "Brgy. San Isidro",
    totalHouseholds: 189,
    evacuationCapacity: 250,
    currentEvacuation: 189,
  },
  {
    id: 3,
    name: "Brgy. San Miguel",
    totalHouseholds: 312,
    evacuationCapacity: 400,
    currentEvacuation: 312,
  },
  {
    id: 4,
    name: "Brgy. San Roque",
    totalHouseholds: 156,
    evacuationCapacity: 200,
    currentEvacuation: 156,
  },
  {
    id: 5,
    name: "Brgy. San Jose",
    totalHouseholds: 348,
    evacuationCapacity: 450,
    currentEvacuation: 348,
  },
];

// Household Data
export const householdData = {
  "Brgy. San Antonio": [
    {
      id: 1,
      householdHead: "Juan Dela Cruz",
      address: "123 Mabini Street",
      familyMembers: 5,
      contactNumber: "09123456789",
      status: "Registered",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      householdHead: "Maria Santos",
      address: "456 Rizal Avenue",
      familyMembers: 4,
      contactNumber: "09123456780",
      status: "Registered",
      registrationDate: "2024-01-10",
    },
    {
      id: 3,
      householdHead: "Pedro Reyes",
      address: "789 Bonifacio Street",
      familyMembers: 6,
      contactNumber: "09123456781",
      status: "Evacuated",
      registrationDate: "2024-01-08",
    },
    {
      id: 4,
      householdHead: "Ana Lopez",
      address: "101 Aguinaldo Street",
      familyMembers: 3,
      contactNumber: "09123456782",
      status: "Registered",
      registrationDate: "2024-01-12",
    },
    {
      id: 5,
      householdHead: "Roberto Garcia",
      address: "202 Burgos Street",
      familyMembers: 7,
      contactNumber: "09123456783",
      status: "Needs Assistance",
      registrationDate: "2024-01-05",
    },
  ],
  "Brgy. San Isidro": [
    {
      id: 1,
      householdHead: "Carlos Mendoza",
      address: "111 Quezon Boulevard",
      familyMembers: 4,
      contactNumber: "09123456784",
      status: "Registered",
      registrationDate: "2024-01-14",
    },
    {
      id: 2,
      householdHead: "Elena Torres",
      address: "222 Sampaguita Street",
      familyMembers: 5,
      contactNumber: "09123456785",
      status: "Evacuated",
      registrationDate: "2024-01-09",
    },
  ],
  "Brgy. San Miguel": [
    {
      id: 1,
      householdHead: "Antonio Cruz",
      address: "333 Aguinaldo Highway",
      familyMembers: 6,
      contactNumber: "09123456786",
      status: "Registered",
      registrationDate: "2024-01-13",
    },
    {
      id: 2,
      householdHead: "Lourdes Reyes",
      address: "444 Narra Street",
      familyMembers: 4,
      contactNumber: "09123456787",
      status: "Needs Assistance",
      registrationDate: "2024-01-07",
    },
    {
      id: 3,
      householdHead: "Jose Martinez",
      address: "555 Molave Street",
      familyMembers: 5,
      contactNumber: "09123456788",
      status: "Registered",
      registrationDate: "2024-01-11",
    },
  ],
  "Brgy. San Roque": [
    {
      id: 1,
      householdHead: "Ricardo Gonzales",
      address: "666 Marcos Avenue",
      familyMembers: 3,
      contactNumber: "09123456790",
      status: "Registered",
      registrationDate: "2024-01-16",
    },
    {
      id: 2,
      householdHead: "Teresa Villanueva",
      address: "777 Sampaguita Street",
      familyMembers: 4,
      contactNumber: "09123456791",
      status: "Evacuated",
      registrationDate: "2024-01-08",
    },
  ],
  "Brgy. San Jose": [
    {
      id: 1,
      householdHead: "Alberto Ramos",
      address: "888 Roxas Boulevard",
      familyMembers: 5,
      contactNumber: "09123456792",
      status: "Registered",
      registrationDate: "2024-01-12",
    },
    {
      id: 2,
      householdHead: "Carmen Delos Santos",
      address: "999 Kamagong Street",
      familyMembers: 6,
      contactNumber: "09123456793",
      status: "Needs Assistance",
      registrationDate: "2024-01-06",
    },
    {
      id: 3,
      householdHead: "Fernando Lim",
      address: "1010 Narra Street",
      familyMembers: 4,
      contactNumber: "09123456794",
      status: "Registered",
      registrationDate: "2024-01-14",
    },
    {
      id: 4,
      householdHead: "Gloria Chavez",
      address: "1111 Acacia Street",
      familyMembers: 3,
      contactNumber: "09123456795",
      status: "Registered",
      registrationDate: "2024-01-10",
    },
  ],
};

// Analytical Reports Data
export const analyticalReportsData = {
  evacuationSummary: {
    totalEvacuated: 1250,
    barangays: [
      { name: "Brgy. San Antonio", evacuated: 245, capacity: 300 },
      { name: "Brgy. San Isidro", evacuated: 189, capacity: 250 },
      { name: "Brgy. San Miguel", evacuated: 312, capacity: 400 },
      { name: "Brgy. San Roque", evacuated: 156, capacity: 200 },
      { name: "Brgy. San Jose", evacuated: 348, capacity: 450 },
    ],
  },
  damageSummary: {
    totalHouses: 8500,
    fullyDamaged: 245,
    partiallyDamaged: 567,
    barangays: [
      {
        name: "Brgy. San Antonio",
        fullyDamaged: 45,
        partiallyDamaged: 89,
        totalHouses: 1200,
      },
      {
        name: "Brgy. San Isidro",
        fullyDamaged: 32,
        partiallyDamaged: 67,
        totalHouses: 950,
      },
      {
        name: "Brgy. San Miguel",
        fullyDamaged: 78,
        partiallyDamaged: 145,
        totalHouses: 1800,
      },
      {
        name: "Brgy. San Roque",
        fullyDamaged: 28,
        partiallyDamaged: 54,
        totalHouses: 800,
      },
      {
        name: "Brgy. San Jose",
        fullyDamaged: 62,
        partiallyDamaged: 212,
        totalHouses: 3750,
      },
    ],
  },
  roadPassability: {
    totalRoads: 89,
    passable: 67,
    notPassable: 22,
    barangays: [
      {
        name: "Brgy. San Antonio",
        passable: 15,
        notPassable: 3,
        totalRoads: 18,
        criticalRoads: [
          { name: "Mabini Street", status: "passable", type: "Main Road" },
          {
            name: "Rizal Avenue",
            status: "notPassable",
            type: "Main Road",
            reason: "Severe Flooding",
          },
          {
            name: "Bonifacio Street",
            status: "passable",
            type: "Secondary Road",
          },
        ],
      },
      {
        name: "Brgy. San Isidro",
        passable: 12,
        notPassable: 2,
        totalRoads: 14,
        criticalRoads: [
          { name: "Quezon Boulevard", status: "passable", type: "Main Road" },
          {
            name: "Sampaguita Street",
            status: "notPassable",
            type: "Secondary Road",
            reason: "Landslide",
          },
        ],
      },
      {
        name: "Brgy. San Miguel",
        passable: 18,
        notPassable: 7,
        totalRoads: 25,
        criticalRoads: [
          {
            name: "Aguinaldo Highway",
            status: "passable",
            type: "National Road",
          },
          {
            name: "Narra Street",
            status: "notPassable",
            type: "Secondary Road",
            reason: "Bridge Damage",
          },
          {
            name: "Molave Street",
            status: "notPassable",
            type: "Tertiary Road",
            reason: "Flooding",
          },
        ],
      },
      {
        name: "Brgy. San Roque",
        passable: 10,
        notPassable: 4,
        totalRoads: 14,
        criticalRoads: [
          { name: "Marcos Avenue", status: "passable", type: "Main Road" },
          {
            name: "Sampaguita Street",
            status: "notPassable",
            type: "Secondary Road",
            reason: "Fallen Trees",
          },
        ],
      },
      {
        name: "Brgy. San Jose",
        passable: 12,
        notPassable: 6,
        totalRoads: 18,
        criticalRoads: [
          { name: "Roxas Boulevard", status: "passable", type: "Main Road" },
          {
            name: "Kamagong Street",
            status: "notPassable",
            type: "Secondary Road",
            reason: "Severe Flooding",
          },
          { name: "Narra Street", status: "passable", type: "Tertiary Road" },
        ],
      },
    ],
  },
  reliefDistribution: {
    totalFamiliesServed: 2850,
    totalReliefPacks: 3420,
    remainingPacks: 580,
    distributionCenters: 8,
    barangays: [
      {
        name: "Brgy. San Antonio",
        familiesServed: 520,
        totalFamilies: 600,
        reliefPacks: 624,
        distributionStatus: "completed",
        lastDistribution: "2024-01-15",
        items: [
          { name: "Rice", quantity: 520, unit: "kg" },
          { name: "Canned Goods", quantity: 2080, unit: "pcs" },
          { name: "Water", quantity: 1560, unit: "liters" },
          { name: "Hygiene Kits", quantity: 520, unit: "kits" },
        ],
      },
      {
        name: "Brgy. San Isidro",
        familiesServed: 380,
        totalFamilies: 450,
        reliefPacks: 456,
        distributionStatus: "completed",
        lastDistribution: "2024-01-14",
        items: [
          { name: "Rice", quantity: 380, unit: "kg" },
          { name: "Canned Goods", quantity: 1520, unit: "pcs" },
          { name: "Water", quantity: 1140, unit: "liters" },
          { name: "Hygiene Kits", quantity: 380, unit: "kits" },
        ],
      },
      {
        name: "Brgy. San Miguel",
        familiesServed: 680,
        totalFamilies: 750,
        reliefPacks: 816,
        distributionStatus: "in-progress",
        lastDistribution: "2024-01-16",
        items: [
          { name: "Rice", quantity: 680, unit: "kg" },
          { name: "Canned Goods", quantity: 2720, unit: "pcs" },
          { name: "Water", quantity: 2040, unit: "liters" },
          { name: "Hygiene Kits", quantity: 680, unit: "kits" },
        ],
      },
      {
        name: "Brgy. San Roque",
        familiesServed: 290,
        totalFamilies: 350,
        reliefPacks: 348,
        distributionStatus: "in-progress",
        lastDistribution: "2024-01-16",
        items: [
          { name: "Rice", quantity: 290, unit: "kg" },
          { name: "Canned Goods", quantity: 1160, unit: "pcs" },
          { name: "Water", quantity: 870, unit: "liters" },
          { name: "Hygiene Kits", quantity: 290, unit: "kits" },
        ],
      },
      {
        name: "Brgy. San Jose",
        familiesServed: 980,
        totalFamilies: 1200,
        reliefPacks: 1176,
        distributionStatus: "pending",
        lastDistribution: "2024-01-13",
        items: [
          { name: "Rice", quantity: 980, unit: "kg" },
          { name: "Canned Goods", quantity: 3920, unit: "pcs" },
          { name: "Water", quantity: 2940, unit: "liters" },
          { name: "Hygiene Kits", quantity: 980, unit: "kits" },
        ],
      },
    ],
    reliefItems: [
      { name: "Rice", total: 2850, unit: "kg", distributed: 2850 },
      { name: "Canned Goods", total: 11400, unit: "pcs", distributed: 11400 },
      { name: "Water", total: 8550, unit: "liters", distributed: 8550 },
      { name: "Hygiene Kits", total: 2850, unit: "kits", distributed: 2850 },
      { name: "Noodles", total: 5700, unit: "packs", distributed: 5700 },
      { name: "Blankets", total: 2850, unit: "pcs", distributed: 2850 },
    ],
  },
};