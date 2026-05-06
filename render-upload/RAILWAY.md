# Railway deploy

Deze app is klaar voor Railway Hobby met Postgres.

## Wat Railway nodig heeft

- Node app: Railway detecteert `package.json`.
- Start command: `npm start`.
- Public networking: de app gebruikt automatisch `process.env.PORT` en luistert op `0.0.0.0`.
- Database: voeg een Railway Postgres service toe en koppel `DATABASE_URL`.
- Beheer: zet `ADMIN_PIN` als environment variable.

## Stappen

1. Zet deze map in een GitHub repository.
2. Ga naar Railway en maak een nieuw project.
3. Kies `Deploy from GitHub repo`.
4. Selecteer de repository van deze app.
5. Voeg in hetzelfde Railway project een `Postgres` database toe.
6. Open de webservice van de app en ga naar `Variables`.
7. Voeg toe:

```text
ADMIN_PIN=jouw-geheime-pin
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

8. Deploy de wijzigingen.
9. Open de app-service, ga naar `Settings` > `Networking`, en klik `Generate Domain`.
10. Open de publieke link en test:

- stem opslaan met een testnaam
- `Mijn stemmen`
- beheer openen met je `ADMIN_PIN`
- halve-finale uitslag opslaan
- pagina verversen en controleren dat data blijft staan
- open `/api/health` achter je Railway-link en controleer dat `storage` op `postgres` staat

## Als opslaan niet werkt

Open:

```text
https://jouw-railway-link.up.railway.app/api/health
```

De gezonde Railway setup toont ongeveer:

```json
{
  "ok": true,
  "storage": "postgres",
  "postgresSsl": false,
  "hasDatabaseUrl": true
}
```

Als `storage` op `file` staat, is `DATABASE_URL` niet gekoppeld aan de app-service. Zet dan bij `Variables` alsnog:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## Belangrijk

Gebruik Railway Hobby met Postgres. Zonder Postgres gebruikt de app alleen `data.json` in de container, en dat is niet bedoeld als betrouwbare online opslag.
