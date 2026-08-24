# Meter & Fuel Operator - React Native (Expo)

A mobile app for operators to:

- Login with username/password
- View meter readings recorded by the logged-in employee
- Add a new meter reading
- Auto-calculate usage = current reading - previous reading
- Use today's date as a locked reading date
- Use employeeCode from the login response as a locked `recordedBy` value
- View fuel delivery/received records assigned to the logged-in employee
- Mark a fuel entry as `RECEIVED`

## 1. Configure backend URL

Edit:

`src/api/config.ts`

Replace:

```ts
export const API_BASE_URL = 'http://YOUR_BACKEND_IP:8080';
```

Example for a physical phone on the same Wi-Fi:

```ts
export const API_BASE_URL = 'http://192.168.1.10:8080';
```

Do not use `localhost` from a physical phone, because localhost would mean the phone itself.

## 2. API endpoints used

### Login

`POST /api/login`

Request:

```json
{
  "username": "operator1",
  "password": "password"
}
```

Expected response must contain at least:

```json
{
  "employeeCode": "EMP001"
}
```

### Meter Reading

- `GET /api/meter_reading/{employeeCode}`
- `POST /api/meter_reading/`

POST body example:

```json
{
  "meterReadingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "assetCodeId": 1,
  "meterType": "Odometer - km",
  "readingDate": "2026-08-24",
  "readingValue": 12500,
  "previousReading": 12350,
  "usageValue": 150,
  "remarks": "Normal reading",
  "recordedBy": "EMP001"
}
```

The app generates a UUID v4-style value for `meterReadingId` before POSTing the reading.

### Fuel Received

The requirement did not specify the exact fuel API paths/payload. This project currently uses:

- `GET /api/fuel_received/{employeeCode}`
- `PUT /api/fuel_received/{fuelReceivedId}`

and updates:

```json
{
  "status": "RECEIVED",
  "receivedBy": "EMP001"
}
```

Change these paths in `src/api/config.ts` and the payload in `src/api/services.ts` if your backend is different.

## 3. Install and run

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go or launch an Android/iOS emulator.

## Project structure

```text
src/
  api/          API config and calls
  components/   Shared form/button components
  context/      Login/session state
  navigation/   React Navigation stack
  screens/      Login, home, meter, fuel screens
  types/        TypeScript models
  utils/        Date utility
```

## Expo SDK 54

This build is aligned with Expo Go SDK 54:
- Expo SDK 54
- React 19.1
- React Native 0.81.5
- React Navigation 7

Fresh setup on Windows PowerShell:

```powershell
npm install
npx expo-doctor@latest
npx expo start -c
```

Do not copy `node_modules` or `package-lock.json` from the older SDK 51 project into this folder.
