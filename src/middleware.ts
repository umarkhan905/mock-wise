import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/verify-email"]);
const isRecruiterRoute = createRouteMatcher([
  "/dashboard/recruiter(.*)",
  "/interview/:interviewId/recruiter/details",
]);
const isCandidateRoute = createRouteMatcher([
  "/dashboard/candidate(.*)",
  "/interview/:interviewId",
  "/interview/:interviewId/join",
  "/interview/:interviewId/join-mcq",
  "/interview/:interviewId/attempted",
  "/interview/:interviewId/expired",
  "/interview/:interviewId/candidate/details",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCommonRoute = createRouteMatcher([
  "/interview/:interviewId/feedback/:feedbackId",
]);

export default clerkMiddleware(async (auth, req) => {
  const user = await auth();
  const role = user.sessionClaims?.metadata?.role ?? "candidate";

  // handle un-authenticated users and not on public routes
  if (!user.userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (user.userId) {
    // ✅ BLOCK ADMIN from common routes
    if (isCommonRoute(req) && role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // ✅ CANDIDATE LOGIC
    if (role === "candidate") {
      if (!isCandidateRoute(req) && !isCommonRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard/candidate", req.url));
      }
      if (isRecruiterRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard/candidate", req.url));
      }
    }

    // ✅ RECRUITER LOGIC
    if (role === "recruiter") {
      if (!isRecruiterRoute(req) && !isCommonRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
      }
      if (isCandidateRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
      }
    }

    // ✅ ADMIN LOGIC
    if (role === "admin") {
      if (!isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
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
