[[[browser] ./services/clerk/components/SignInStatus.tsx:2:1
Export SignedOut doesn't exist in target module
  1 | import { ReactNode, Suspense } from "react";
> 2 | import {
    | ^^^^^^^
> 3 |   SignedOut as ClerkSignedOut,
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 4 |   SignedIn as ClerkSignedIn,
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 5 | } from "@clerk/nextjs";
    | ^^^^^^^^^^^^^^^^^^^^^^^
  6 |
  7 | export function SignedOut({ children }: { children: ReactNode }) {
  8 |   return (

The export SignedOut was not found in module [project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-ssr] (ecmascript).
Did you mean to import SignOutButton?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Server Component:
    ./services/clerk/components/SignInStatus.tsx
    ./components/sidebar/AppSidebar.tsx
    ./app/(job-seeker)/layout.tsx

  Client Component Browser:
    ./services/clerk/components/SignInStatus.tsx [Client Component Browser]
    ./components/sidebar/SidebarNavMenuGroup.tsx [Client Component Browser]
    ./components/sidebar/SidebarNavMenuGroup.tsx [Server Component]
    ./app/(job-seeker)/layout.tsx [Server Component]

  Client Component SSR:
    ./services/clerk/components/SignInStatus.tsx [Client Component SSR]
    ./components/sidebar/SidebarNavMenuGroup.tsx [Client Component SSR]
    ./components/sidebar/SidebarNavMenuGroup.tsx [Server Component]
    ./app/(job-seeker)/layout.tsx [Server Component]
 PUT /api/inngest 500 in 33ms (next.js: 7ms, proxy.ts: 18ms, application-code: 8ms)
 PUT /api/inngest 500 in 20ms (next.js: 6ms, proxy.ts: 7ms, application-code: 7ms)
 PUT /api/inngest 500 in 27ms (next.js: 6ms, proxy.ts: 13ms, application-code: 8ms)
 PUT /api/inngest 500 in 30ms (next.js: 6ms, proxy.ts: 17ms, application-code: 7ms)](Attention: Clerk collects telemetry data from its SDKs when connected to development instances.
The data collected is used to inform Clerk's product roadmap.
To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry.

❌ Invalid environment variables: [
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'CLERK_WEBHOOK_SECRET' ],
    message: 'Invalid input: expected string, received undefined'
  }
]
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (services\uploadthing\router.ts:4:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:973:30)
    at <unknown> (services\uploadthing\components\UploadThingSSR.tsx:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1055:30)
    at <unknown> (app\layout.tsx:7:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1087:30)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1163:47)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 |
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (services\uploadthing\router.ts:4:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:973:30)
    at <unknown> (services\uploadthing\components\UploadThingSSR.tsx:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1055:30)
    at <unknown> (app\layout.tsx:7:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1087:30)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1163:47)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 | {
  page: '/'
}
Error: Invalid environment variables
    at module evaluation (data\env\server.ts:4:29)
    at <unknown> (drizzle\db.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:671:30)
    at <unknown> (services\clerk\lib\getCurrentAuth.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:786:30)
    at <unknown> (services\uploadthing\router.ts:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:973:30)
    at <unknown> (services\uploadthing\components\UploadThingSSR.tsx:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1055:30)
    at <unknown> (app\layout.tsx:7:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1087:30)
  2 | import { z } from "zod";
  3 |
> 4 | export const env = createEnv({
    |                             ^
  5 |   server: {
  6 |     DB_PASSWORD: z.string().min(1),
  7 |     DB_USER: z.string().min(1),
⨯ unhandledRejection: Error: Invalid environment variables
    at module evaluation (data\env\server.ts:4:29)
    at <unknown> (drizzle\db.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:671:30)
    at <unknown> (services\clerk\lib\getCurrentAuth.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:786:30)
    at <unknown> (services\uploadthing\router.ts:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:973:30)
    at <unknown> (services\uploadthing\components\UploadThingSSR.tsx:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1055:30)
    at <unknown> (app\layout.tsx:7:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1087:30)
  2 | import { z } from "zod";
  3 |
> 4 | export const env = createEnv({
    |                             ^
  5 |   server: {
  6 |     DB_PASSWORD: z.string().min(1),
  7 |     DB_USER: z.string().min(1),
⨯ unhandledRejection:  Error: Invalid environment variables
    at module evaluation (data\env\server.ts:4:29)
    at <unknown> (drizzle\db.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:671:30)
    at <unknown> (services\clerk\lib\getCurrentAuth.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:786:30)
    at <unknown> (services\uploadthing\router.ts:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:973:30)
    at <unknown> (services\uploadthing\components\UploadThingSSR.tsx:3:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1055:30)
    at <unknown> (app\layout.tsx:7:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\ssr\[root-of-the-server]__1putj1i._.js:1087:30)
  2 | import { z } from "zod";
  3 |
> 4 | export const env = createEnv({
    |                             ^
  5 |   server: {
  6 |     DB_PASSWORD: z.string().min(1),
  7 |     DB_USER: z.string().min(1),
 GET / 500 in 1987ms (next.js: 1578ms, proxy.ts: 240ms, application-code: 168ms)
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (app\api\inngest\route.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\[root-of-the-server]__0cl6tjt._.js:2582:30)
    at Object.<anonymous> (D:\Github\next-job-board\.next\dev\server\app\api\inngest\route.js:20:3)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 | {
  page: '/api/inngest'
}
 PUT /api/inngest 500 in 724ms (next.js: 433ms, proxy.ts: 277ms, application-code: 14ms)
[browser] Uncaught TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services/inngest/client.ts:73:12)
    at <unknown> (services/uploadthing/router.ts:4:1)
    at module evaluation (services/uploadthing/client.ts:4:69)
    at <unknown> (services/uploadthing/components/UploadThingSSR.tsx:3:1)
    at module evaluation (services/uploadthing/router.ts:67:1)
    at <unknown> (app/layout.tsx:7:1)
    at module evaluation (services/uploadthing/components/UploadThingSSR.tsx:9:1)
    at module evaluation (app/layout.tsx:46:1)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 |
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (app\api\inngest\route.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\[root-of-the-server]__0cl6tjt._.js:2582:30)
    at Object.<anonymous> (D:\Github\next-job-board\.next\dev\server\app\api\inngest\route.js:20:3)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 | {
  page: '/api/inngest'
}
 PUT /api/inngest 500 in 64ms (next.js: 33ms, proxy.ts: 22ms, application-code: 9ms)
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (app\api\inngest\route.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\[root-of-the-server]__0cl6tjt._.js:2582:30)
    at Object.<anonymous> (D:\Github\next-job-board\.next\dev\server\app\api\inngest\route.js:20:3)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 | {
  page: '/api/inngest'
}
 PUT /api/inngest 500 in 51ms (next.js: 30ms, proxy.ts: 12ms, application-code: 8ms)
⨯ TypeError: {imported module ./nodemodules/@inngest/ai/dist/index.js}.EventSchemas is not a constructor
    at module evaluation (services\inngest\client.ts:73:12)
    at <unknown> (app\api\inngest\route.ts:1:1)
    at module evaluation (D:\Github\next-job-board\.next\dev\server\chunks\[root-of-the-server]__0cl6tjt._.js:2582:30)
    at Object.<anonymous> (D:\Github\next-job-board\.next\dev\server\app\api\inngest\route.js:20:3)
  71 | export const inngest = new Inngest({
  72 |   id: "job-board",
> 73 |   schemas: new EventSchemas().fromRecord<Events>(),
     |            ^
  74 | });
  75 | {
  page: '/api/inngest'
}
 PUT /api/inngest 500 in 50ms (next.js: 24ms, proxy.ts: 18ms, application-code: 7ms)
⨯ TypeError: {imp)](Attention: Clerk collects telemetry data from its SDKs when connected to development instances.
The data collected is used to inform Clerk's product roadmap.
To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry.

○ Compiling / ...
 PUT /api/inngest 200 in 7.7s (next.js: 7.5s, proxy.ts: 18ms, application-code: 242ms)
about://React/Cache/D:%5CGithub%5Cnext-job-board%5C.next%5Cdev%5Cserver%5Cchunks%5Cssr%5C_056dz5z._.js?1: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
about://React/Cache/D:%5CGithub%5Cnext-job-board%5C.next%5Cdev%5Cserver%5Cchunks%5Cssr%5C_056dz5z._.js?0: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
⨯ Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at  getJobListings (about://React/Cache/D:%5CGithub%5Cnext-job-board%5C.next%5Cdev%5Cserver%5Cchunks%5Cssr%5C_056dz5z._.js?1:799:18) {
  environmentName: 'Cache',
  digest: '4111111362',
  [cause]: error: relation "job_listings" does not exist
      at getJobListings (about://React/Cache/D:%5CGithub%5Cnext-job-board%5C.next%5Cdev%5Cserver%5Cchunks%5Cssr%5C_056dz5z._.js?0:799:18) {
    environmentName: 'Cache'
  }
}
⨯ Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at async getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
  230 |   }
  231 |
> 232 |   const data = await db.query.JobListingTable.findMany({
      |                ^
  233 |     where: or(
  234 |       jobListingId
  235 |         ? and( {
  query: 'select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc',
  params: [ 1, 'published' ],
  digest: '4111111362',
  [cause]: error: relation "job_listings" does not exist
      at async getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
    230 |   }
    231 |
  > 232 |   const data = await db.query.JobListingTable.findMany({
        |                ^
    233 |     where: or(
    234 |       jobListingId
    235 |         ? and( {
    length: 112,
    severity: 'ERROR',
    code: '42P01',
    detail: undefined,
    hint: undefined,
    position: '570',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '1449',
    routine: 'parserOpenTable'
  }
}
Error: Route "/" used `Date.now()` before accessing either uncached data (e.g. `fetch()`) or Request data (e.g. `cookies()`, `headers()`, `connection()`, and `searchParams`). Accessing the current time in a Server Component requires reading one of these data sources first. Alternatively, consider moving this expression into a Client Component or Cache Component. See more info here: https://nextjs.org/docs/messages/next-prerender-current-time
    at UploadThingSSR (services\uploadthing\components\UploadThingSSR.tsx:7:53)
    at RootLayout (app\layout.tsx:41:11)
   5 | ...dThingSSR() {
   6 | ...
>  7 | ...uterConfig={extractRouterConfig(customFileRouter)} />
     |                                   ^
   8 | ...
   9 | ...
  10 | ...
 PUT /api/inngest 200 in 143ms (next.js: 26ms, proxy.ts: 63ms, application-code: 54ms)
 GET / 200 in 15.2s (next.js: 12.4s, proxy.ts: 345ms, application-code: 2.5s)
[browser] Error: Route "/" used `Date.now()` before accessing either uncached data (e.g. `fetch()`) or Request data (e.g. `cookies()`, `headers()`, `connection()`, and `searchParams`). Accessing the current time in a Server Component requires reading one of these data sources first. Alternatively, consider moving this expression into a Client Component or Cache Component. See more info here: https://nextjs.org/docs/messages/next-prerender-current-time
    at UploadThingSSR (services\uploadthing\components\UploadThingSSR.tsx:7:53)
    at RootLayout (app\layout.tsx:41:11)
   5 | ...dThingSSR() {
   6 | ...
>  7 | ...uterConfig={extractRouterConfig(customFileRouter)} />
     |                                   ^
   8 | ...
   9 | ...
  10 | ...
[browser] Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at  getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
  230 |   }
  231 |
> 232 |   const data = await db.query.JobListingTable.findMany({
      |                ^
  233 |     where: or(
  234 |       jobListingId
  235 |         ? and( (app/(job-seeker)
[browser] Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at  getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
  230 |   }
  231 |
> 232 |   const data = await db.query.JobListingTable.findMany({
      |                ^
  233 |     where: or(
  234 |       jobListingId
  235 |         ? and( (app/(job-seeker)
[browser] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (https://sharing-orca-44.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:12:6086)
 PUT /api/inngest 200 in 64ms (next.js: 6ms, proxy.ts: 15ms, application-code: 43ms)
 PUT /api/inngest 200 in 38ms (next.js: 5ms, proxy.ts: 9ms, application-code: 23ms)
 PUT /api/inngest 200 in 33ms (next.js: 4ms, proxy.ts: 9ms, application-code: 21ms)
 PUT /api/inngest 200 in 33ms (next.js: 3ms, proxy.ts: 10ms, application-code: 20ms)
 PUT /api/inngest 200 in 72ms (next.js: 6ms, proxy.ts: 27ms, application-code: 39ms)
 PUT /api/inngest 200 in 30ms (next.js: 4ms, proxy.ts: 9ms, application-code: 18ms)
 PUT /api/inngest 200 in 44ms (next.js: 3ms, proxy.ts: 14ms, application-code: 28ms)
 PUT /api/inngest 200 in 44ms (next.js: 4ms, proxy.ts: 17ms, application-code: 22ms)
[browser] Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at  getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
  230 |   }
  231 |
> 232 |   const data = await db.query.JobListingTable.findMany({
      |                ^
  233 |     where: or(
  234 |       jobListingId
  235 |         ? and( (app/(job-seeker)
[browser] Error: Failed query: select "JobListingTable"."id", "JobListingTable"."organizationId", "JobListingTable"."title", "JobListingTable"."description", "JobListingTable"."wage", "JobListingTable"."wageInterval", "JobListingTable"."stateAbbreviation", "JobListingTable"."city", "JobListingTable"."isFeatured", "JobListingTable"."locationRequirement", "JobListingTable"."experienceLevel", "JobListingTable"."status", "JobListingTable"."type", "JobListingTable"."postedAt", "JobListingTable"."createdAt", "JobListingTable"."updatedAt", "JobListingTable_organization"."data" as "organization" from "job_listings" "JobListingTable" left join lateral (select json_build_array("JobListingTable_organization"."id", "JobListingTable_organization"."name", "JobListingTable_organization"."imageUrl") as "data" from (select * from "organizations" "JobListingTable_organization" where "JobListingTable_organization"."id" = "JobListingTable"."organizationId" limit $1) "JobListingTable_organization") "JobListingTable_organization" on true where "JobListingTable"."status" = $2 order by "JobListingTable"."isFeatured" desc, "JobListingTable"."postedAt" desc
params: 1,published
    at  getJobListings (app\(job-seeker)\_shared\JobListingItems.tsx:232:16)
  230 |   }
  231 |
> 232 |   const data = await db.query.JobListingTable.findMany({
      |                ^
  233 |     where: or(
  234 |       jobListingId
  235 |         ? and( (app/(job-seeker)
 PUT /api/inngest 200 in 37ms (next.js: 4ms, proxy.ts: 5ms, application-code: 29ms))