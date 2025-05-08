export {};

// Create a type for the roles
export type Roles = "candidate" | "recruiter" | "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
