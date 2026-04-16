export function createRouter({ routes, onRouteChange, onNotFound, defaultRoute = "/login" }) {
	const normalizePath = (path) => {
		if (!path) {
			return defaultRoute;
		}

		const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
		return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
	};

	const getCurrentPath = () => {
		return normalizePath(window.location.pathname);
	};

	const navigate = (path) => {
		const normalized = normalizePath(path);
		if (getCurrentPath() === normalized) {
			handleRoute();
			return;
		}

		window.history.pushState({}, "", normalized);
		handleRoute();
	};

	const handleRoute = () => {
		const currentPath = getCurrentPath();
		const normalizedDefaultRoute = normalizePath(defaultRoute);
		const routeHandler = routes[currentPath];
		const defaultRouteHandler = routes[normalizedDefaultRoute];

		if (!defaultRouteHandler) {
			throw new Error(`Default route '${normalizedDefaultRoute}' is not configured in routes`);
		}

		if (!routeHandler) {
			if (typeof onNotFound === "function") {
				onNotFound({ path: currentPath, navigate });
				return;
			}

			onRouteChange(defaultRouteHandler, normalizedDefaultRoute);
			return;
		}

		onRouteChange(routeHandler, currentPath);
	};

	window.addEventListener("popstate", handleRoute);

	if (!window.location.pathname || window.location.pathname === "/") {
		window.history.replaceState({}, "", normalizePath(defaultRoute));
		handleRoute();
	} else {
		handleRoute();
	}

	return {
		navigate,
		getCurrentPath,
	};
}
