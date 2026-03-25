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
  }
];
