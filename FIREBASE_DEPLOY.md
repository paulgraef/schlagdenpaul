# Firebase `web.app` Deploy

Dieses Projekt ist jetzt auf statischen Export für Firebase Hosting konfiguriert.

## Einmalig einrichten

```bash
npx firebase login
npx firebase use --add
```

Beim zweiten Befehl dein Firebase-Projekt auswählen.

## Build + Deploy

```bash
npm run build:firebase
npm run firebase:deploy
```

`npm run build:firebase` erzeugt die statischen Dateien in `out/`.
Firebase Hosting veröffentlicht dann genau diesen Ordner.

## Admin PIN (wichtig)

Der Admin-Login ist bei statischem Hosting clientseitig.
Setze die PIN deshalb als public Build-Variable:

```bash
NEXT_PUBLIC_ADMIN_PIN=1234 npm run build:firebase
```

Wenn `NEXT_PUBLIC_ADMIN_PIN` nicht gesetzt ist, ist der Fallback `1234`.

