"use client";

import { useEffect } from "react";
import Script from "next/script";

export function FeedbackButton({ token }: { token: string }) {
  useEffect(() => {
    const win = window as any;

    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        // eslint-disable-next-line prefer-rest-params
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    win.Featurebase("initialize_feedback_widget", {
      organization: process.env.NEXT_PUBLIC_FEATUREBASE_ORG_NAME, // Replace this with your organization name, copy-paste the subdomain part from your Featurebase workspace url (e.g. https://*yourorg*.featurebase.app)
      theme: "light",
      placement: "right", // optional - remove to hide the floating button
      // email, // optional
      // defaultBoard: "yourboardname", // optional - preselect a board
      locale: "nb", // Change the language, view all available languages from https://help.featurebase.app/en/articles/8879098-using-featurebase-in-my-language
      metadata: {
        environment: process.env.VERCEL_ENV ?? "development",
      }, // Attach session-specific metadata to feedback. Refer to the advanced section for the details: https://help.featurebase.app/en/articles/3774671-advanced#7k8iriyap66
      jwtToken: token,
    });
  }, []);

  return (
    <>
      <Script src="https://do.featurebase.app/js/sdk.js" id="featurebase-sdk" />
      <div>
        {/*If you wish to open the widget using your own button you can do so here.
           To get rid of our floating button, remove 'placement' from the Featurebase('initialize_feedback_widget') call above.
          */}
        <button data-featurebase-feedback>Open Widget</button>
      </div>
    </>
  );
}
