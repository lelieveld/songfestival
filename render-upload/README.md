# Ted & Tio's songfestival - speelkopie

Dit is een losse speelkopie. Wijzigingen in deze map raken de originele app niet.

Deze app kan lokaal als bestand draaien, maar is nu ook geschikt als online app met gedeelde link.

## Gebruik

1. Vul per deelnemer de voorspelde top 5 en laatste plaats in.
2. Gebruik `Export` om tussendoor een back-up te bewaren.
3. Vul na de finale de echte einduitslag in bij `Einduitslag`.
4. Bekijk de winnaar bij `Ranglijst`.

Als je `index.html` direct opent, bewaart de app gegevens lokaal in dezelfde browser.

Als je de app online draait met `npm start`, bewaart de server alle gegevens centraal in `data.json`. Iedereen met de link ziet dan dezelfde deelnemers en ranglijst.

## Online draaien

1. Installeer Node.js 18 of nieuwer.
2. Open deze map in een terminal.
3. Start de app met:

```bash
npm start
```

Lokaal staat de app dan op `http://localhost:3000`.

## Binnen hetzelfde wifi-netwerk

Start de app op de laptop die op hetzelfde wifi-netwerk zit als de telefoons:

```bash
npm run wifi
```

In het terminalvenster verschijnen een of meer `Wifi-link` adressen, bijvoorbeeld:

```text
Wifi-link: http://192.168.1.23:3000
```

Open die link op de telefoons. De laptop moet aan blijven en het terminalvenster moet open blijven zolang mensen de app gebruiken.

Als telefoons de link niet openen, controleer dan:

- laptop en telefoons zitten op hetzelfde wifi-netwerk
- Windows Firewall staat Node.js toe op prive-netwerken
- je gebruikt de `Wifi-link`, niet `localhost`

Voor een echte gedeelde link kun je deze map hosten bij een Node-host zoals Render, Railway, Fly.io of een eigen server. Zet daar ook een omgevingsvariabele:

```bash
ADMIN_PIN=een-eigen-geheime-code
```

Zonder instelling is de beheer-PIN lokaal `1234`.

## Railway

Deze speelkopie is klaar voor Railway Hobby met Postgres. Gebruik Railway niet zonder database, want dan is opslag in de online container niet bedoeld als betrouwbare blijvende opslag.

Korte route:

1. Zet deze map in een GitHub repository.
2. Maak in Railway een nieuw project via `Deploy from GitHub repo`.
3. Voeg in hetzelfde project een `Postgres` database toe.
4. Zet bij de app-service onder `Variables`:

```text
ADMIN_PIN=jouw-geheime-pin
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

5. Deploy.
6. Ga bij de app-service naar `Settings` > `Networking` en klik `Generate Domain`.

Zie ook `RAILWAY.md` voor een korte checklist.

## Render

Render is de makkelijkste route voor een publieke link. Deze app bevat `render.yaml`, zodat Render automatisch een webservice en een Postgres database kan aanmaken.

Belangrijk bij gratis Render:

- de webservice kan na 15 minuten zonder bezoek slapen
- de eerste bezoeker moet daarna ongeveer een minuut wachten
- Free Postgres verloopt na 30 dagen

Stappen:

1. Zet deze map in een GitHub repository.
2. Ga naar `https://dashboard.render.com`.
3. Kies `New` > `Blueprint`.
4. Koppel je GitHub repository.
5. Render leest `render.yaml`.
6. Vul bij `ADMIN_PIN` je eigen geheime beheer-PIN in.
7. Klik op deploy.

Na de deploy krijg je een `onrender.com` link. Die link kun je delen met iedereen.

## Google Cloud Run

Op Google Cloud Run gebruikt de app automatisch Firestore voor blijvende opslag. Lokaal blijft `data.json` gebruikt worden.

Eenmalig voorbereiden in Google Cloud:

1. Open je Google Cloud project.
2. Zet facturering aan als dat nog niet gedaan is.
3. Activeer Cloud Shell.
4. Activeer de nodige APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com
```

5. Maak Firestore aan als dat nog niet bestaat. Kies bij voorkeur `eur3` of `europe-west` als locatie.

Deploy vanuit deze map:

```bash
gcloud run deploy ted-tio-songfestival-speelkopie \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_PIN=maak-hier-je-eigen-pin
```

Na de deploy toont Google een `Service URL`. Dat is de link die iedereen op zijn telefoon kan openen.

Als je later wijzigingen maakt, voer je hetzelfde deploy-commando opnieuw uit.

## Beheer

Bezoekers mogen voorspellingen toevoegen. Voor bewerken, verwijderen, uitslag invullen, landen aanpassen, importeren en resetten klik je op `Beheer` en vul je de beheer-PIN in.

## Puntentelling

Er zijn 26 punten mogelijk:

- 1 punt voor elk land dat exact op de voorspelde plek in de top 5 eindigt.
- 1 punt voor de juist voorspelde laatste plaats.
- 1 punt voor elk juist voorspeld land dat doorgaat uit de eerste halve finale.
- 1 punt voor elk juist voorspeld land dat doorgaat uit de tweede halve finale.

De ranglijst toont daarnaast hoeveel landen wel in de top 5 zaten maar op een andere plek.
