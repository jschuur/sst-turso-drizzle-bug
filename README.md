# SST Turso Drizzle Bug repro

This is a minimal repro of a bug I'm seeing when using [SST](https://sst.dev/) with [@libsql/client](https://www.npmjs.com/package/@libsql/client) and [Drizzle](https://orm.drizzle.team/).

During SST deployment (or the local dev Live Lambda), it produces an `Error: Cannot find module '@libsql/darwin-arm64` error.

## Notes

- A `@libsql/client` bug reported [in this Turso GitHubn issue](https://github.com/tursodatabase/libsql-client-ts/issues/112).
- Works if you downgrade to @libsql/client 0.3.3, however now there is a Next.js/libsql error and it won't build on Vercel with the latest Next.js without triggering [this error](https://github.com/tursodatabase/libsql-client-ts/issues/142) which was [fixed](https://github.com/tursodatabase/libsql-client-ts/pull/160) in a more recent version of @libsql/client (which triggers the SST error).
- Using just Next.js 14.1.3 wit @libsql/client 0.5.6 works fine, so it's something to do with the combination of SST and @libsql/client.
- Another user ran into this issue and posted about it on the [SST Discord recently](https://discord.com/channels/933071162680958986/1210131565271580732), but I wasn't able to replicate the proposed solution of exxplicitly listing dependencies in the `sst.config.ts`.
- When using NextjsSite, this [seems to be fixed](https://github.com/tursodatabase/libsql-client-ts/issues/186) by changign the lambda architecture to x86_64 and Node to 20.x, but I couldn't replicate that.

## Steps to Reproduce

- Clone this repo, install dependencies with `pnpm install`
- [Turso setup](https://orm.drizzle.team/learn/tutorials/drizzle-with-turso). Then run `pnpm run db:push` and `pnpm run db:seed`
- Run `pnpm run dev` (which runs `sst dev`) and hit the /users endpoint to see the error:

```
|  Invoked src/users.handler
|  Built src/users.handler
|  Error: Cannot find module '@libsql/darwin-arm64'
Require stack:
- /Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/.sst/artifacts/c835c9816ce102eef99ee8a9af9bd87b0d1665204f/src/users.mjs
   Error: Cannot find module '@libsql/darwin-arm64'
   Require stack:
   - /Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/.sst/artifacts/c835c9816ce102eef99ee8a9af9bd87b0d1665204f/src/users.mjs
       at Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)
       at Module._load (node:internal/modules/cjs/loader:985:27)
       at Module.require (node:internal/modules/cjs/loader:1235:19)
       at require (node:internal/modules/helpers:176:18)
       at node_modules/.pnpm/libsql@0.3.10/node_modules/libsql/index.js (/Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/node_modules/.pnpm/libsql@0.3.10/node_modules/libsql/index.js:42:5)
       at __require2 (file:///Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/.sst/artifacts/c835c9816ce102eef99ee8a9af9bd87b0d1665204f/src/users.mjs:21:50)
       at <anonymous> (/Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/node_modules/.pnpm/@libsql+client@0.5.6/node_modules/@libsql/client/lib-esm/sqlite3.js:1:22)
       at ModuleJob.run (node:internal/modules/esm/module_job:218:25)
       at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
       at async file:///Users/joostschuur/Code/Playmob/_Tests/sst-turso-drizzle-bug/node_modules/.pnpm/sst@2.41.2_@aws-sdk+credential-provider-node@3.535.0/node_modules/sst/support/nodejs-runtime/index.mjs:46:15
```

## Solutions (kind of)

Use [copyFiles](https://docs.sst.dev/constructs/Function#copyfiles) (via [this PR](https://github.com/sst/sst/pull/3590)) to make sure `@libsql/linux-x64-gnu` added to the production bundle:

```typescript
app.setDefaultFunctionProps({
  copyFiles: [{ from: 'node_modules/@libsql/linux-x64-gnu/index.node' }],
});
```

Assumes `pnpm install -D @libsql/darwin-arm64 @libsql/linux-x64-gnu`, so that local dev also has the darwin-arm64 version for an Apple Silicon dev machine.

Or better yet, just use `@libsql/client/web`, in which case you don't need to use the `copyFiles` workaround (or add platform specific dependencies to your package.json):

```typescript
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

const authToken = process.env.TURSO_AUTH_TOKEN;
const url = process.env.TURSO_CONNECTION_URL;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
```
