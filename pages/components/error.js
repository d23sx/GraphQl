export function renderError({
    title = "Error",
    message = "Something went wrong.",
    actions = [],
}) {
    const appRoot = document.querySelector(".app");
    if (!appRoot) return;

    const wrapper = document.createElement("section");
    wrapper.className = "route-error";

    const titleEl = document.createElement("h1");
    titleEl.className = "route-error-title";
    titleEl.textContent = title;

    const messageEl = document.createElement("p");
    messageEl.className = "route-error-message";
    messageEl.textContent = message;

    const actionsEl = document.createElement("div");
    actionsEl.className = "route-error-actions";

    actions.forEach(({ label, className = "route-error-button", onClick }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        button.addEventListener("click", onClick);
        actionsEl.appendChild(button);
    });

    wrapper.append(titleEl, messageEl, actionsEl);
    appRoot.replaceChildren(wrapper);
}

export function renderNotFound(path, navigate) {
    renderError({
        title: "Page Not Found",
        message: `No route matches '${path}'.`,
        actions: [
            { label: "Go To Login", onClick: () => navigate("/login") },
            { label: "Go To Home", className: "route-error-button route-error-button-secondary", onClick: () => navigate("/home") },
        ],
    });
}