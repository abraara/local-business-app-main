import { Button, Link } from "@payloadcms/ui";

export const StripeVerify = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-sm font-medium mb-4">Stripe Verification Required</h1>
      <p className="text-sm mb-6">Please verify your Stripe account to continue.</p>
      <Link href="/stripe-verify">
        <Button>
          Verify Stripe Account
        </Button>
      </Link>
    </div>
  );
}