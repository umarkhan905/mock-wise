/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as candidates from "../candidates.js";
import type * as feedbacks from "../feedbacks.js";
import type * as http from "../http.js";
import type * as interviews from "../interviews.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as participants from "../participants.js";
import type * as recruiter from "../recruiter.js";
import type * as types_index from "../types/index.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  candidates: typeof candidates;
  feedbacks: typeof feedbacks;
  http: typeof http;
  interviews: typeof interviews;
  messages: typeof messages;
  notifications: typeof notifications;
  participants: typeof participants;
  recruiter: typeof recruiter;
  "types/index": typeof types_index;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
