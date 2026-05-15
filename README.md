# rurutala.net portfolio site

Environment:
React + Vite

## Like Count Storage

The heart count API stores totals in Cloud Firestore when Firebase Admin credentials are set.
Set either:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

or:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

The API writes documents to the `like_counts` collection. If Firebase environment variables are not set, the API falls back to temporary in-memory counts for local development.

## Credits

- Icons by [Icons8](https://icons8.com)
