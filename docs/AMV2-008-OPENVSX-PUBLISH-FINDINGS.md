# AMV2-008 OpenVSX Publish Findings (Central Time)

Captured:
- UTC: 2026-02-27T17:53:44Z
- Central: 2026-02-27 11:53:44 CST

## Primary answers

### 1) First publish date/time (exact)

Yes, OpenVSX records this even for earlier browser-based uploads.

- First published version: `1.28.1`
- First publish timestamp (UTC): `2026-02-24T19:10:25.959112Z`
- First publish timestamp (Central): `2026-02-24 13:10:25.959112 CST`

### 2) Additional data available beyond typical browser UI

Yes. OpenVSX API exposes additional metadata, including:

- `downloadCount` (current aggregate): `1008`
- `allVersions` index with API links for each published version
- `publishedBy` details (publisher identity/provider)
- `verified`, `namespaceAccess`, `reviewCount`, `averageRating`
- direct file artifact URLs (`download`, `signature`, `manifest`, `changelog`, `sha256`, etc.)

## Current release snapshot

- Latest version: `1.50.6`
- Latest publish timestamp (UTC): `2026-02-27T01:18:51.014620Z`
- Latest publish timestamp (Central): `2026-02-26 19:18:51.014620 CST`

## Important limitations

- OpenVSX metadata does **not** indicate whether a version was published via browser upload or CLI.
- `downloadCount` appears to be a **global extension-level aggregate**, not per-version download analytics.

## Version timeline from OpenVSX API (UTC)

- `1.28.1` -> `2026-02-24T19:10:25.959112Z`
- `1.28.2` -> `2026-02-24T21:22:31.810954Z`
- `1.28.5` -> `2026-02-24T23:48:04.439688Z`
- `1.28.6` -> `2026-02-25T00:04:23.057738Z`
- `1.28.7` -> `2026-02-25T00:16:23.736125Z`
- `1.50.0` -> `2026-02-26T04:44:43.128785Z`
- `1.50.1` -> `2026-02-26T08:18:59.338192Z`
- `1.50.2` -> `2026-02-26T22:50:45.180618Z`
- `1.50.3` -> `2026-02-26T23:26:44.503114Z`
- `1.50.6` -> `2026-02-27T01:18:51.014620Z`

## Source endpoints

- `https://open-vsx.org/api/active-twist/amphion-agent`
- `https://open-vsx.org/api/active-twist/amphion-agent/latest`
- `https://open-vsx.org/api/active-twist/amphion-agent/1.28.1`
