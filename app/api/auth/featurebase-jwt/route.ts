import { createJwtTokenAction } from "@/lib/actions";
import { NextResponse } from "next/server";

// const userData = {
//   name: user.name,
//   // Both email and userId should be provided when possible
//   // At minimum, either email or userId must be present
//   email: user.email,
//   userId: user.id,

//   // Optional fields
//   profilePicture: "https://example.com/images/yourcustomer.png",

//   // Optional fields
//   customFields: {
//     title: "Product Manager",
//     plan: "Premium",
//     number: "123",
//   },

//   // Optional, uncomment if you are looking to use multilingual changelog
//   // locale: "en", // Will make sure the user receives the changelog email in the correct language

//   // Optional fields
//   companies: [
//     {
//       id: "987654321", // required
//       name: "Business Inc. 23", // required
//       monthlySpend: 500, // optional
//       createdAt: "2023-05-19T15:35:49.915Z", // optional
//       customFields: {
//         industry: "Fintech",
//         location: "Canada",
//       }, // optional
//     },
//   ],

//   // role: "",  // optional - used for user roles feature with enterprise plan
// };

export async function GET(request: Request) {
  const jwtTokenResult = await createJwtTokenAction();

  if (!jwtTokenResult.success) {
    return NextResponse.json(
      { error: "Failed to create JWT token" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token: jwtTokenResult.token });
}
