import { routeConstants } from "@/constants/route.constants";
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

export const initSuperToken = () =>
  SuperTokens.init({
    appInfo: {
      apiDomain: import.meta.env.VITE_PUBLIC_API_ENDPOINT,
      apiBasePath: "/v1/auth",
      appName: "mis",
      websiteDomain: import.meta.env.VITE_PUBLIC_WEB_ENDPOINT,
      websiteBasePath: "",
    },

    recipeList: [
      Session.init({
        tokenTransferMethod: "header",
      }),
      EmailPassword.init(),
    ],

    getRedirectionURL: async (context) => {
      if (context.action === "SUCCESS" && context.newSessionCreated) {
        // called on a successful sign in / up. Where should the user go next?
        let redirectToPath = context.redirectToPath;
        if (redirectToPath !== undefined) {
          // we are navigating back to where the user was before they authenticated
          return redirectToPath;
        }
        if (context.createdNewUser) {
          // user signed up
          return "/";
        } else {
          // user signed in
          return "/";
        }
      } else if (context.action === "TO_AUTH") {
        // called when the user is not authenticated and needs to be redirected to the auth page.
        return `/${routeConstants.LOGIN}`;
      }
      // return undefined to let the default behaviour play out
      return undefined;
    },
  });
