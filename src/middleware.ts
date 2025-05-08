import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/verify-email"]);
const isRecruiterRoute = createRouteMatcher(["/dashboard/recruiter(.*)"]);
const isCandidateRoute = createRouteMatcher(["/dashboard/candidate(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const user = await auth();
  const role = user.sessionClaims?.metadata?.role;

  // handle un-authenticated users and not on public routes
  if (!user.userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // handle authenticated users
  if (user.userId) {
    // handle if user is candidate and on candidate routes
    if (role === "candidate" && !isCandidateRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard/candidate", req.url));
    }

    // handle if user is candidate and on recruiter routes
    if (isRecruiterRoute(req) && role === "candidate") {
      return NextResponse.redirect(new URL("/dashboard/candidate", req.url));
    }

    // handle if user is recruiter and on recruiter routes
    if (role === "recruiter" && !isRecruiterRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
    }

    // handle if user is recruiter and on candidate routes
    if (isCandidateRoute(req) && role === "recruiter") {
      return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
    }

    // handle if user is not admin and on admin routes
    if (isAdminRoute(req) && role !== "admin") {
      return NextResponse.redirect(
        new URL(
          role === "recruiter"
            ? "/dashboard/recruiter"
            : "/dashboard/candidate",
          req.url
        )
      );
    }

    // handle if user is admin and not on admin routes
    if (role === "admin" && !isAdminRoute(req)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Redirect authenticated users trying to access public routes
    if (isPublicRoute(req)) {
      return NextResponse.redirect(
        new URL(
          role === "admin"
            ? "/admin/dashboard"
            : role === "recruiter"
              ? "/dashboard/recruiter"
              : "/dashboard/candidate",
          req.url
        )
      );
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
