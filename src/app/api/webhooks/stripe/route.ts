import Stripe from "stripe";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { ConvexError } from "convex/values";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("Webhook signature verification failed.", error);
    return new Response("Webhook signature verification failed.", {
      status: 400,
    });
  }

  //   Handle Events
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
    }
  } catch (error) {
    console.log("Error handling event-stripe: ", error);
    return new Response("Error handling event-stripe", { status: 500 });
  }

  return new Response("Success", { status: 200 });
}

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const packId = session.metadata?.packId as Id<"interviewPacks">;
  const stripeCustomerId = session.customer as string;

  if (!stripeCustomerId || !packId) {
    throw new ConvexError("Missing packId or stripeCustomerId.");
  }

  const user = await convex.query(api.users.getUserByStripeCustomerId, {
    stripeCustomerId,
  });

  if (!user) {
    throw new ConvexError("User not found.");
  }

  const interviewCredits =
    parseInt(session.metadata?.interviewCredits as string) || 0;

  await Promise.all([
    //   add the interview pack credits in user plan
    convex.mutation(api.usage.updateUserInterviewCredits, {
      userId: user._id,
      interviewCredits,
    }),

    //   add the purchase
    convex.mutation(api.purchases.createPurchase, {
      userId: user._id,
      interviewPackId: packId,
      title: session.metadata?.title as string,
      description: session.metadata?.description as string,
      purchaseDate: session.created,
      amount: session.amount_total!,
      stripePurchaseId: session.id,
    }),
  ]);

  //   TODO: implement rate limiting and email notification
};
