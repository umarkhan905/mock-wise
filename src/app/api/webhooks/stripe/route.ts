import Stripe from "stripe";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { ConvexError } from "convex/values";
import { getSubscriptionPricingId } from "../../../../utils/subscriptions";
import { stripe } from "@/lib/stripe";

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

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleUpsertSubscription(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;

      case "customer.subscription.deleted":
        await handleResetSubscription(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response("Unhandled event type", { status: 400 });
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
    convex.mutation(api.users.updateUserCredits, {
      userId: user._id,
      credits: {
        total: user.credits.total + interviewCredits,
        remaining: user.credits.remaining + interviewCredits,
        used: user.credits.used,
      },
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

interface ExtendedSubscription extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

const handleUpsertSubscription = async (
  subscription: Stripe.Subscription,
  eventType: string
) => {
  const _subscription = subscription as ExtendedSubscription;

  if (_subscription.status !== "active" || !_subscription.latest_invoice) {
    console.log(
      `Skipping subscription ${subscription.id} with status ${_subscription.status}`
    );
    return;
  }

  const stripeCustomerId = _subscription.customer as string;

  try {
    await convex.mutation(api.subscriptions.upsertSubscription, {
      stripeSubscriptionId: _subscription.id,
      status: _subscription.status,
      plan:
        (_subscription.items.data[0].price.metadata.plan as
          | "free"
          | "standard"
          | "pro") || "pro",
      currentPeriodStart: _subscription?.current_period_start,
      currentPeriodEnd: _subscription?.current_period_end,
      cancelAtPeriodEnd: _subscription.cancel_at_period_end,
      stripeCustomerId,
    });

    console.log(
      `Successfully processed ${eventType} event for subscription ${subscription.id}`
    );

    // TODO: SEND SUCCESS EMAIL
  } catch (error) {
    console.log(
      `Error processing ${eventType} event for subscription ${subscription.id}:`,
      error
    );
  }
};

const handleResetSubscription = async (subscription: Stripe.Subscription) => {
  try {
    const currentUserSubscription = await convex.query(
      api.subscriptions.getUserSubscription
    );

    // if user has no next plan, return
    if (!currentUserSubscription.nextPlan) return;

    if (currentUserSubscription.nextPlan === "free") {
      await convex.mutation(api.subscriptions.resetSubscription, {
        stripeSubscriptionId: subscription.id,
      });
    } else {
      const newPriceId = getSubscriptionPricingId(
        currentUserSubscription.nextPlan
      );

      const newSub = (await stripe.subscriptions.create({
        customer: subscription.customer as string,
        items: [{ price: newPriceId }],
      })) as Stripe.Subscription;

      const _subscription = newSub as ExtendedSubscription;

      await convex.mutation(api.subscriptions.addNextSubscription, {
        plan: currentUserSubscription.nextPlan,
        stripeSubscriptionId: _subscription.id,
        currentPeriodStart: _subscription.current_period_start,
        currentPeriodEnd: _subscription.current_period_end,
        subscriptionId: currentUserSubscription._id,
      });
    }
  } catch (error) {
    console.log(`Error resetting subscription ${subscription.id}:`, error);
  }
};
