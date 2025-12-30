Screen Share Discovery Server

Usage:
1. npm install
2. npm start

Endpoints:
- POST /announce { id, name, ips[] }
- POST /remove { id }
- GET  /hosts -> list of current hosts
- GET  /status

Notes:
- This is an in-memory demo server. For production, use persistent store and authentication and HTTPS.
- TTL is 2 minutes; hosts must re-announce periodically (every ~30s).
