"use server";

import jwt from "jsonwebtoken";

import { auth } from "@clerk/nextjs/server";

type CreateJwtTokenActionResult =
  | {
      success: true;
      token: string;
    }
  | {
      success: false;
      error: string;
    };

export const createJwtTokenAction =
  async (): Promise<CreateJwtTokenActionResult> => {
    const {
      userId,
      sessionClaims: { email },
    } = await auth.protect();

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    const featurebaseSecret = process.env.FEATUREBASE_SSO_KEY;
    if (!featurebaseSecret) {
      console.error("FEATUREBASE_SSO_KEY is not set.");
      return { success: false, error: "SSO configuration error" };
    }

    const token = jwt.sign(
      {
        userId,
        email: email as string,
      },
      featurebaseSecret,
      {
        algorithm: "HS256",
      }
    );

    return { success: true, token };
  };
