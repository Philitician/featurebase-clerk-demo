import { SignIn } from "@clerk/nextjs";

type FeaturebaseSSOProps = {
  searchParams: Promise<{ return_to: string }>;
};

export default async function FeaturebaseSSO({
  searchParams,
}: FeaturebaseSSOProps) {
  const { return_to } = await searchParams;
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn forceRedirectUrl={return_to} />
    </div>
  );
}
