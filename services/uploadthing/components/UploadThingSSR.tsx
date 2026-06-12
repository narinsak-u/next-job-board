import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { customFileRouter } from "../router";

export function UploadThingSSR() {
  return (
    <NextSSRPlugin routerConfig={extractRouterConfig(customFileRouter)} />
  );
}
