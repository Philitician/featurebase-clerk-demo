import { createJwtTokenAction } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";

const BASE_URL = process.env.FEATUREBASE_PORTAL_URL!;

type SignInPageProps = {
  searchParams: Promise<{ return_to: string }>;
};

export default async function SignInPage(props: SignInPageProps) {
  const { return_to } = await props.searchParams;
  const jwtResult = await createJwtTokenAction();
  if (!jwtResult.success) notFound();
  const searchParams = new URLSearchParams({ jwt: jwtResult.token, return_to });
  redirect(`${BASE_URL}/api/v1/auth/access/jwt?${searchParams.toString()}`);
}
