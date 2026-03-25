export interface SortierenRound {
  id: string;
  category: string;
  upperLabel: string;
  lowerLabel: string;
  fixedItem: string;
  items: string[];
  correctOrder: string[];
}

export const SORTIEREN_ROUNDS: SortierenRound[] = [
  {
    id: "r1",
    category: "Unternehmensgründung",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "Coca-Cola",
    items: ["Coca-Cola", "Ford", "Disney", "McDonald's", "Adidas", "Starbucks", "Apple e Bay", "Facebook"],
    correctOrder: ["Coca-Cola", "Ford", "Disney", "McDonald's", "Adidas", "Starbucks", "Apple e Bay", "Facebook"]
  },
  {
    id: "r2",
    category: "Familiennamen",
    upperLabel: "viel",
    lowerLabel: "wenig",
    fixedItem: "Müller",
    items: ["Müller", "Fischer", "Schäfer", "Schwarz", "Krause", "Kaiser", "Otto", "Pfeiffer", "Merkel"],
    correctOrder: ["Müller", "Fischer", "Schäfer", "Schwarz", "Krause", "Kaiser", "Otto", "Pfeiffer", "Merkel"]
  },
  {
    id: "r3",
    category: "Sehenswürdigkeiten",
    upperLabel: "hoch",
    lowerLabel: "niedrig",
    fixedItem: "Empire State Building",
    items: ["Empire State Building", "Eiffelturm", "Kölner Dom", "Petersdom", "Big Ben", "Freiheitsstatue", "Schiefer Turm von Pisa", "Brandenburger Tor", "Kaaba"],
    correctOrder: ["Empire State Building", "Eiffelturm", "Kölner Dom", "Petersdom", "Big Ben", "Freiheitsstatue", "Schiefer Turm von Pisa", "Brandenburger Tor", "Kaaba"]
  },
  {
    id: "r4",
    category: "US-Präsidenten",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "Dwight D. Eisenhower",
    items: ["Dwight D. Eisenhower", "John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon", "Gerald Ford", "Jimmy Carter", "Ronald Reagan", "George Bush sen.", "Bill Clinton"],
    correctOrder: ["Dwight D. Eisenhower", "John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon", "Gerald Ford", "Jimmy Carter", "Ronald Reagan", "George Bush sen.", "Bill Clinton"]
  },
  {
    id: "r5",
    category: "James-Bond",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "James Bond jagt Dr. No",
    items: ["James Bond jagt Dr. No", "Goldfinger", "Octopussy", "Der Hauch des Todes", "Goldeneye", "Stirb an einem anderen Tag", "Casino Royale", "Skyfall", "Keine Zeit zu sterben"],
    correctOrder: ["James Bond jagt Dr. No", "Goldfinger", "Octopussy", "Der Hauch des Todes", "Goldeneye", "Stirb an einem anderen Tag", "Casino Royale", "Skyfall", "Keine Zeit zu sterben"]
  },
  {
    id: "r6",
    category: "Geschichte",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "Entdeckung Amerikas",
    items: ["Entdeckung Amerikas", "Luthers 95 Thesen", "Unabhängigkeit der USA", "Französische Revolution", "Gründung der DDR", "Kubakrise zwischen USA und UdSSR", "Fall der Berliner Mauer", "Nelson Mandela wird Präsident", "Terroranschlag 9/11"],
    correctOrder: ["Entdeckung Amerikas", "Luthers 95 Thesen", "Unabhängigkeit der USA", "Französische Revolution", "Gründung der DDR", "Kubakrise zwischen USA und UdSSR", "Fall der Berliner Mauer", "Nelson Mandela wird Präsident", "Terroranschlag 9/11"]
  },
  {
    id: "r7",
    category: "Einwohner",
    upperLabel: "viel",
    lowerLabel: "wenig",
    fixedItem: "Sankt Petersburg",
    items: ["Sankt Petersburg", "Hamburg", "Mailand", "Birmingham", "Marseille", "Rotterdam", "Göteborg", "Graz", "Porto"],
    correctOrder: ["Sankt Petersburg", "Hamburg", "Mailand", "Birmingham", "Marseille", "Rotterdam", "Göteborg", "Graz", "Porto"]
  },
  {
    id: "r8",
    category: "Erfindungen",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "Buchdruck",
    items: ["Buchdruck", "Fernrohr", "Dampfmaschine", "Telefon", "Auto", "Fernsehen", "Mikrowelle", "Internet", "iPhone"],
    correctOrder: ["Buchdruck", "Fernrohr", "Dampfmaschine", "Telefon", "Auto", "Fernsehen", "Mikrowelle", "Internet", "iPhone"]
  },
  {
    id: "r9",
    category: "Bundespräsidenten von Deutschland",
    upperLabel: "früh",
    lowerLabel: "spät",
    fixedItem: "Theodor Heuss",
    items: [
      "Theodor Heuss",
      "Heinrich Lübke",
      "Gustav Heinemann",
      "Walter Scheel",
      "Karl Carstens",
      "Richard von Weizsäcker",
      "Roman Herzog",
      "Johannes Rau",
      "Horst Köhler",
      "Christian Wulff",
      "Joachim Gauck",
      "Frank-Walter Steinmeier"
    ],
    correctOrder: [
      "Theodor Heuss",
      "Heinrich Lübke",
      "Gustav Heinemann",
      "Walter Scheel",
      "Karl Carstens",
      "Richard von Weizsäcker",
      "Roman Herzog",
      "Johannes Rau",
      "Horst Köhler",
      "Christian Wulff",
      "Joachim Gauck",
      "Frank-Walter Steinmeier"
    ]
  },
  {
    id: "r10",
    category: "Berge",
    upperLabel: "hoch",
    lowerLabel: "niedrig",
    fixedItem: "Mount Everest",
    items: ["Mount Everest", "K2", "Mont Blanc", "Zugspitze", "Teide", "Watzmann", "Brocken", "Feldberg", "Kreuzeck"],
    correctOrder: ["Mount Everest", "K2", "Mont Blanc", "Teide", "Zugspitze", "Watzmann", "Kreuzeck", "Feldberg", "Brocken"]
  },
  {
    id: "r11",
    category: "Fußballvereine",
    upperLabel: "früh gegründet",
    lowerLabel: "spät",
    fixedItem: "TSV 1860 München",
    items: ["TSV 1860 München", "Notts County", "FC Barcelona", "Borussia Dortmund", "Real Madrid", "FC Bayern München", "AS Rom", "FC St. Pauli", "RB Leipzig"],
    correctOrder: ["TSV 1860 München", "Notts County", "FC Barcelona", "FC Bayern München", "Real Madrid", "Borussia Dortmund", "FC St. Pauli", "AS Rom", "RB Leipzig"]
  },
  {
    id: "r12",
    category: "Unternehmen nach Marktkapitalisierung (Stand: März 2026)",
    upperLabel: "viel",
    lowerLabel: "wenig",
    fixedItem: "NVIDIA",
    items: ["NVIDIA", "Apple", "Alphabet (Google)", "Amazon", "Tesla", "SAP", "Siemens", "Disney"],
    correctOrder: ["NVIDIA", "Apple", "Alphabet (Google)", "Amazon", "Tesla", "SAP", "Siemens", "Disney"]
  },
  {
    id: "r13",
    category: "Tiere",
    upperLabel: "schnell",
    lowerLabel: "langsam",
    fixedItem: "Wanderfalke",
    items: ["Wanderfalke", "Gepard", "Springbock", "Pferd", "Windhund", "Mensch", "Elefant", "Nilpferd", "Schildkröte"],
    correctOrder: ["Wanderfalke", "Gepard", "Springbock", "Pferd", "Windhund", "Mensch", "Elefant", "Nilpferd", "Schildkröte"]
  },
  {
    id: "r14",
    category: "Berühmte Persönlichkeiten",
    upperLabel: "früh geboren",
    lowerLabel: "spät geboren",
    fixedItem: "Johann Wolfgang von Goethe",
    items: ["Johann Wolfgang von Goethe", "Napoleon Bonaparte", "Abraham Lincoln", "Albert Einstein", "Walt Disney", "Elvis Presley", "Michael Jackson", "Angela Merkel", "Taylor Swift"],
    correctOrder: ["Johann Wolfgang von Goethe", "Napoleon Bonaparte", "Abraham Lincoln", "Albert Einstein", "Walt Disney", "Elvis Presley", "Michael Jackson", "Angela Merkel", "Taylor Swift"]
  },
  {
    id: "r15",
    category: "Länder nach Fläche",
    upperLabel: "groß",
    lowerLabel: "klein",
    fixedItem: "Russland",
    items: ["Russland", "Kanada", "China", "Brasilien", "Australien", "Indien", "Argentinien", "Kasachstan", "Deutschland"],
    correctOrder: ["Russland", "Kanada", "China", "Brasilien", "Australien", "Indien", "Argentinien", "Kasachstan", "Deutschland"]
  }
];
