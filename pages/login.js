export function buildLoginView() {
    const root = document.createDocumentFragment();

    const span = document.createElement("span");
    span.className = "border-span"

    const netflixIntro = document.createElement("div");
    netflixIntro.id = "netflixContainer";
    netflixIntro.className = "intro-hidden";
    
    const loginSection = document.createElement("section");
    loginSection.className = "login-section";
    loginSection.setAttribute("aria-label", "Login panel");

    const loginContainerBase = document.createElement("div");
    loginContainerBase.className = "login-container";
    loginContainerBase.id = "loginForm";
    
    const loginContainer = document.createElement("form");
    loginContainer.className = "loginForm";
    loginContainer.noValidate = true;
    loginContainer.autocomplete = "on";

    const titleH2 = document.createElement("h2");
    titleH2.textContent = "Sign In";
    titleH2.className = "login-title";

    const usernameInput = document.createElement("input");
    usernameInput.id = "username";
    usernameInput.name = "username";
    usernameInput.className = "login-input";
    usernameInput.type = "text";
    usernameInput.placeholder = "Username/email";
    usernameInput.autocomplete = "username";

    const usernameLabel = document.createElement("label");
    usernameLabel.textContent = "Username/E-mail";
    usernameLabel.htmlFor = "username";
    usernameLabel.className = "input-label";

    const passwordInput = document.createElement("input");
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInput.className = "login-input";
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.autocomplete = "current-password";

    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password";
    passwordLabel.htmlFor = "password";
    passwordLabel.className = "input-label";

    const feedback = document.createElement("p");
    feedback.id = "loginFeedback";
    feedback.className = "login-feedback";
    feedback.setAttribute("aria-live", "polite");

    const submitBtn = document.createElement("button");
    submitBtn.id = "loginButton";
    submitBtn.className = "login-button btn";
    submitBtn.type = "submit";
    submitBtn.textContent = "Login";

    loginContainer.append(
        titleH2,
        usernameLabel,
        usernameInput,
        passwordLabel,
        passwordInput,
        feedback,
        submitBtn
    );

    loginContainerBase.append(span, loginContainer)
    loginSection.appendChild(loginContainerBase);

    root.append(netflixIntro, loginSection);
    return root;
}

