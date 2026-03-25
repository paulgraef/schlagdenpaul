export interface SortierenRound {
  id: string;
  category: string;
  upperLabel: string;
  lowerLabel: string;
  items: string[];
  correctOrder: string[];
}

export const SORTIEREN_ROUNDS: SortierenRound[] = [
  { id: "r1", category: "Tiere (Größe)", upperLabel: "groß", lowerLabel: "klein", items: ["Elefant", "Giraffe", "Elch", "Fuchs", "Schaf", "Igel", "Hummel", "Ameise"], correctOrder: ["Elefant", "Giraffe", "Elch", "Fuchs", "Schaf", "Igel", "Hummel", "Ameise"] },
  { id: "r2", category: "Planeten (Durchmesser)", upperLabel: "groß", lowerLabel: "klein", items: ["Jupiter", "Saturn", "Uranus", "Neptun", "Erde", "Venus", "Mars", "Merkur"], correctOrder: ["Jupiter", "Saturn", "Uranus", "Neptun", "Erde", "Venus", "Mars", "Merkur"] },
  { id: "r3", category: "Berge (Höhe)", upperLabel: "hoch", lowerLabel: "niedrig", items: ["Mount Everest", "K2", "Kangchendzönga", "Lhotse", "Makalu", "Cho Oyu", "Dhaulagiri I", "Manaslu"], correctOrder: ["Mount Everest", "K2", "Kangchendzönga", "Lhotse", "Makalu", "Cho Oyu", "Dhaulagiri I", "Manaslu"] },
  { id: "r4", category: "Flüsse (Länge)", upperLabel: "lang", lowerLabel: "kurz", items: ["Nil", "Amazonas", "Jangtse", "Mississippi", "Jenissei", "Gelber Fluss", "Ob", "Kongo"], correctOrder: ["Nil", "Amazonas", "Jangtse", "Mississippi", "Jenissei", "Gelber Fluss", "Ob", "Kongo"] },
  { id: "r5", category: "Metalle (Dichte)", upperLabel: "schwer", lowerLabel: "leicht", items: ["Osmium", "Gold", "Wolfram", "Blei", "Silber", "Kupfer", "Titan", "Aluminium"], correctOrder: ["Osmium", "Gold", "Wolfram", "Blei", "Silber", "Kupfer", "Titan", "Aluminium"] },
  { id: "r6", category: "Säugetiere (Tragzeit)", upperLabel: "lang", lowerLabel: "kurz", items: ["Elefant", "Nashorn", "Pferd", "Mensch", "Hund", "Katze", "Hase", "Maus"], correctOrder: ["Elefant", "Nashorn", "Pferd", "Mensch", "Hund", "Katze", "Hase", "Maus"] },
  { id: "r7", category: "Städte (Einwohner)", upperLabel: "viele", lowerLabel: "wenige", items: ["Tokio", "Delhi", "Shanghai", "São Paulo", "Mexiko-Stadt", "Kairo", "Paris", "Berlin"], correctOrder: ["Tokio", "Delhi", "Shanghai", "São Paulo", "Mexiko-Stadt", "Kairo", "Paris", "Berlin"] },
  { id: "r8", category: "Länder (Fläche)", upperLabel: "groß", lowerLabel: "klein", items: ["Russland", "Kanada", "China", "USA", "Brasilien", "Australien", "Indien", "Argentinien"], correctOrder: ["Russland", "Kanada", "China", "USA", "Brasilien", "Australien", "Indien", "Argentinien"] },
  { id: "r9", category: "Inseln (Fläche)", upperLabel: "groß", lowerLabel: "klein", items: ["Grönland", "Neuguinea", "Borneo", "Madagaskar", "Baffininsel", "Sumatra", "Honshu", "Großbritannien"], correctOrder: ["Grönland", "Neuguinea", "Borneo", "Madagaskar", "Baffininsel", "Sumatra", "Honshu", "Großbritannien"] },
  { id: "r10", category: "Bäume (Wuchshöhe)", upperLabel: "hoch", lowerLabel: "niedrig", items: ["Küstenmammutbaum", "Eukalyptus regnans", "Douglasie", "Tanne", "Buche", "Birke", "Apfelbaum", "Bonsai"], correctOrder: ["Küstenmammutbaum", "Eukalyptus regnans", "Douglasie", "Tanne", "Buche", "Birke", "Apfelbaum", "Bonsai"] },
  { id: "r11", category: "Rekorde 100m Sprint", upperLabel: "schnell", lowerLabel: "langsam", items: ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Asafa Powell", "Justin Gatlin", "Christian Coleman", "Fred Kerley", "Akani Simbine"], correctOrder: ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Asafa Powell", "Justin Gatlin", "Christian Coleman", "Fred Kerley", "Akani Simbine"] },
  { id: "r12", category: "Tiere (Lebenserwartung)", upperLabel: "alt", lowerLabel: "jung", items: ["Grönlandhai", "Galapagos-Riesenschildkröte", "Wal", "Elefant", "Pferd", "Hund", "Maus", "Eintagsfliege"], correctOrder: ["Grönlandhai", "Galapagos-Riesenschildkröte", "Wal", "Elefant", "Pferd", "Hund", "Maus", "Eintagsfliege"] },
  { id: "r13", category: "Musikinstrumente (Frequenzbereich tief->hoch)", upperLabel: "hoch", lowerLabel: "tief", items: ["Piccoloflöte", "Violine", "Klarinette", "Gitarre", "Cello", "Posaune", "Tuba", "Kontrabass"], correctOrder: ["Piccoloflöte", "Violine", "Klarinette", "Gitarre", "Cello", "Posaune", "Tuba", "Kontrabass"] },
  { id: "r14", category: "Programmiersprachen (Erstveröffentlichung)", upperLabel: "neu", lowerLabel: "alt", items: ["Rust", "Go", "Python", "C++", "C", "Cobol", "Fortran", "Lisp"], correctOrder: ["Rust", "Go", "Python", "C++", "C", "Cobol", "Fortran", "Lisp"] },
  { id: "r15", category: "Gebirge (Länge)", upperLabel: "lang", lowerLabel: "kurz", items: ["Anden", "Rocky Mountains", "Transantarktisches Gebirge", "Himalaya", "Great Dividing Range", "Ural", "Atlas", "Alpen"], correctOrder: ["Anden", "Rocky Mountains", "Transantarktisches Gebirge", "Himalaya", "Great Dividing Range", "Ural", "Atlas", "Alpen"] }
];
