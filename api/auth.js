import { buildLoginView } from "../pages/login.js";
import {SIGN_IN_ENDPOIINT} from '../config.js'
export function renderLogin({ appRoot, buildNetflixIntro, transitionKey, navigateToHome }) {
    appRoot.replaceChildren(buildLoginView());

    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginFeedback = document.getElementById("loginFeedback");
    const introContainer = document.getElementById("netflixContainer");

    if (!loginForm || !usernameInput || !passwordInput || !loginFeedback || !introContainer) {
        return;
    }

    let isSubmitting = false;
    let hasNavigated = false;
    let netflixIntro = buildNetflixIntro();
    introContainer.replaceChildren(netflixIntro);

    const clearValidationState = () => {
        usernameInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");
        loginFeedback.textContent = "";
    };

    const validateFields = (username, password) => {
        clearValidationState();

        if (!username) {
            usernameInput.classList.add("is-invalid");
            loginFeedback.textContent = "Enter your username to continue.";
            usernameInput.focus();
            return false;
        }

        if (!password) {
            passwordInput.classList.add("is-invalid");
            loginFeedback.textContent = "Enter your password to continue.";
            passwordInput.focus();
            return false;
        }

        return true;
    };

    const goToHomeRoute = () => {
        if (hasNavigated) {
            return;
        }

        hasNavigated = true;
        introContainer.classList.add("intro-exit");

        setTimeout(() => {
            sessionStorage.setItem(transitionKey, "1");
            navigateToHome();
        }, 420);
    };

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (isSubmitting || !validateFields(username, password)) return;

        isSubmitting = true;
        usernameInput.disabled = true;
        passwordInput.disabled = true;
        const submitButton = loginForm.querySelector("button[type='submit']");
        if (submitButton) submitButton.disabled = true;

        try {
            const cred = btoa(username + ":" + password);

            const response = await fetch(SIGN_IN_ENDPOIINT, {
                method: "POST",
                headers: { Authorization: "Basic " + cred }
            });

            if (!response.ok) throw new Error("Invalid credentials");

            let token = await response.text();
            token = token.trim().replace(/"/g, "");
            localStorage.setItem("jwt", token);

            loginFeedback.textContent = "Login successful";

            loginForm.classList.add("is-submitting");
            netflixIntro = buildNetflixIntro();
            introContainer.replaceChildren(netflixIntro);

            const handleIntroEnd = (animationEvent) => {
                if (animationEvent.animationName !== "zoom-in") return;
                netflixIntro.removeEventListener("animationend", handleIntroEnd);
                goToHomeRoute();
            };

            setTimeout(() => {
                loginForm.classList.add("is-hidden");
                introContainer.classList.remove("intro-exit", "intro-hidden");
            }, 260);

            netflixIntro.addEventListener("animationend", handleIntroEnd);
            setTimeout(goToHomeRoute, 5600);
        } catch (error) {
            loginFeedback.textContent = error.message || "Login failed";
            isSubmitting = false;
            usernameInput.disabled = false;
            passwordInput.disabled = false;
            if (submitButton) submitButton.disabled = false;
        }
    });

    const authMessage = sessionStorage.getItem("authMessage");
    if (authMessage) {
        loginFeedback.textContent = authMessage;
        sessionStorage.removeItem("authMessage");
    }
}