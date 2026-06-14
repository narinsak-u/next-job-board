import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ["/sign-in", "/sign-up", "/", "/api", "/job-listings", "/ai-search"]
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublic) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
