import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { stripe } from "../src/lib/stripe";
import { api } from "./_generated/api";
import { PLAN_LIMITS } from "../src/utils/plans-limits";

type Role = "admin" | "candidate" | "recruiter";
type Metadata = {
  companyName: string;
  role: Role;
};

const http = httpRouter();

const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!webhookSecret) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SIGNING_SECRET environment variable"
    );
  }

  const svix_id = request.headers.get("svix-id");
  const svix_signature = request.headers.get("svix-signature");
  const svix_timestamp = request.headers.get("svix-timestamp");

  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.log("Error verifying webhook", error);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  try {
    switch (evt.type) {
      case "user.created":
        const { id, email_addresses, username, image_url, unsafe_metadata } =
          evt.data;
        const metadata = unsafe_metadata as Metadata;
        const email = email_addresses[0]?.email_address;

        // create stripe customer
        const customer = await stripe.customers.create({
          email,
          name: username as string,
          metadata: { clerkId: id, username: username as string },
        });

        // create convex user
        const userId = await ctx.runMutation(api.users.createUser, {
          email,
          clerkId: id,
          stripeCustomerId: customer.id,
          username: username as string,
          image: image_url,
          role: metadata.role || "candidate",
          companyName: metadata.companyName || undefined,
        });

        if (!userId) {
          return new Response("Error creating user", {
            status: 400,
          });
        }

        const plan = PLAN_LIMITS["free"];

        // create new plan usage
        await ctx.runMutation(api.usage.createPlanUsage, {
          userId,
          plan: "free",
          interviews: { total: plan.interviews, used: 0 },
          aiBasedQuestions: plan.aiBasedQuestions,
          questionsPerInterview: plan.questionsPerInterview,
          attemptsPerInterview: plan.attemptsPerInterview,
          candidatesPerInterview: plan.candidatesPerInterview,
          period: Date.now(),
        });

        // TODO: add scheduler to create new plan usage after 30 days

        return new Response("User created", {
          status: 201,
        });

      default:
        return new Response("Event type not supported", {
          status: 404,
        });
    }
  } catch (error) {
    console.log("Error in clerk-webhook", error);
    return new Response("Internal server error", {
      status: 500,
    });
  }
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
