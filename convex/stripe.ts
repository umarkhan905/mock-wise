import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { stripe } from "../src/lib/stripe";

const createInterviewPackCheckoutSession = action({
  args: {
    packId: v.id("interviewPacks"),
  },
  handler: async (ctx, args): Promise<{ checkoutURL: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }

    //TODO: implement rate limiting
    const pack = await ctx.runQuery(api.interviewPacks.getPackById, {
      packId: args.packId,
    });

    if (!pack) {
      throw new ConvexError("Interview Pack not found.");
    }

    // create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: pack.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/dashboard/${user.role}/billing/success?session_id={CHECKOUT_SESSION_ID}&pack=${pack.name}&interviewCredits=${pack.interviewCredits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/dashboard/${user.role}/billing`,
      metadata: {
        userId: user._id,
        packId: pack._id,
        title: pack.name,
        description: pack.description,
        interviewCredits: pack.interviewCredits,
      },
    });

    return { checkoutURL: session.url };
  },
});

export { createInterviewPackCheckoutSession };
