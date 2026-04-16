
const createSpans = (count, classPrefix) => {
	const fragment = document.createDocumentFragment();
	for (let i = count; i >= 1; i -= 1) {
		const span = document.createElement("span");
		span.className = `${classPrefix}-${i}`;
		fragment.appendChild(span);
	}
	return fragment;
};

const createHelper = (helperIndex) => {
	const helper = document.createElement("div");
	helper.className = `helper-${helperIndex}`;

	const brush = document.createElement("div");
	brush.className = "effect-brush";
	brush.appendChild(createSpans(31, "fur"));
	helper.appendChild(brush);

	if (helperIndex === 1) {
		const lumieres = document.createElement("div");
		lumieres.className = "effect-lumieres";
		lumieres.appendChild(createSpans(28, "lamp"));
		helper.appendChild(lumieres);
	}

	return helper;
};

export const buildNetflixIntro = () => {
	const intro = document.createElement("netflixintro");
	intro.id = "netflixIntro";
	intro.setAttribute("letter", "N");
	intro.appendChild(createHelper(1));
	intro.appendChild(createHelper(2));
	intro.appendChild(createHelper(3));
	intro.appendChild(createHelper(4));
	return intro;
};

export const initializeButtonAnimation = (container = document) => {
	const btns = container.querySelectorAll(".btn");
	const spanSpacingPx = 2; 

	btns.forEach((btn) => {
		if (btn.dataset.animationReady === "1") return;

		const buttonWidth = btn.getBoundingClientRect().width;
		const spanCount = Math.max(1, Math.ceil(buttonWidth / spanSpacingPx));

		for (let i = 0; i < spanCount; i++) {
			const span = document.createElement("span");
			span.style.left = `${i * spanSpacingPx}px`;
			span.style.transitionDelay = `${Math.random()}s`;
			btn.appendChild(span);
		}

		btn.dataset.animationReady = "1";
	});
};