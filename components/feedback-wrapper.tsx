import { createJwtTokenAction } from "@/lib/actions";
import { FeedbackButton } from "./feedback";

export async function FeedbackWrapper() {
  const jwtTokenResult = await createJwtTokenAction();

  if (!jwtTokenResult.success) return null;

  return <FeedbackButton token={jwtTokenResult.token} />;
}
