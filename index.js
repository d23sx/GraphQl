import { createRouter } from "./router.js";
import { renderLogin } from "./api/auth.js";
import { renderHome } from "./pages/home.js";
import { buildNetflixIntro, initializeButtonAnimation } from "./pages/components/netflixAnimation.js";
import { renderError } from "./pages/components/error.js";
import { renderNotFound } from "./pages/components/error.js";
import { fetchUserGraphql } from "./api/graphql.js";

const appRoot = document.querySelector(".app");
const HOME_TRANSITION_KEY = "postLoginTransition";

if (!appRoot) {
    throw new Error("Missing .app root container");
}

const isAuthenticated = () => Boolean(localStorage.getItem("jwt"));

let data;

const redirectToLogin = (message) => {
    if (message) {
        sessionStorage.setItem("authMessage", message);
    } else {
        sessionStorage.removeItem("authMessage");
    }
    window.location.replace("/");
};

const router = createRouter({
    routes: {
        "/": () =>
            renderLogin({
                appRoot,
                buildNetflixIntro,
                transitionKey: HOME_TRANSITION_KEY,
                navigateToHome: () => router.navigate("/home"),
            }),
        "/home": async () => {
            if (!isAuthenticated()) {
                redirectToLogin("Session expired. Please sign in again.");
                return;
            }

            try {
                data = await fetchUserGraphql();
                renderHome(appRoot, data);
                initializeButtonAnimation(appRoot);
            } catch (err) {
                console.error("Failed to fetch GraphQL data:", err);
                renderError({
                    title: "Unable to load your dashboard",
                    message: err?.message || "Failed to fetch GraphQL data.",
                    actions: [
                        {
                            label: "Retry",
                            onClick: () => router.navigate("/home"),
                        },
                        {
                            label: "Back To Login",
                            className: "route-error-button route-error-button-secondary",
                            onClick: () => redirectToLogin("Please sign in and try again."),
                        },
                    ],
                });
            }
        },
        "/logout": () => {
            localStorage.removeItem("jwt");
            sessionStorage.removeItem(HOME_TRANSITION_KEY);
            redirectToLogin("Signed out successfully.");
        }
    },
    defaultRoute: isAuthenticated() ? "/home" : "/",
    onRouteChange: (routeHandler) => {
        document.body.classList.remove("with-handoff", "ready");
        routeHandler();
        initializeButtonAnimation(appRoot);
    },
    onNotFound: ({ path, navigate }) => {
        document.body.classList.remove("with-handoff", "ready");
        renderNotFound(path, navigate);
        initializeButtonAnimation(appRoot);
    },
});

document.addEventListener("DOMContentLoaded", () => {
    initializeButtonAnimation(appRoot);
});

export function attachCardPointerAnimation(card) {
    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
    });
}

export function formatNumber(value) {
    const sign = Math.sign(value);
    const magnitudeIndex = (Math.log(Math.abs(value)) / Math.log(1e3)) | 0;
    const unitSuffix = `${"kMGTPEZY"[magnitudeIndex - 1] || ""}B`;
    const scaledValue = (Math.abs(value) / 1e3 ** magnitudeIndex) * sign;
    const roundedScaledValue = Math.round(scaledValue);
    const displayValue = roundedScaledValue > 100
        ? roundedScaledValue
        : scaledValue.toFixed(roundedScaledValue > 10 ? 1 : 2);

    return `${displayValue} ${unitSuffix}`;
}
