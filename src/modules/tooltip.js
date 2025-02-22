/**
 * @fileoverview Generates tooltips and handles all logic related to tooltips and explanation popups.
 */

/**
 * Adds all tooltips and sets up dialog handling.
 * @function
 */
(() => {
	addAllTooltips();

	// handle dialog stuff
	const dialogElements = {
		output: {
			explanationHeading: 'explanationHeading',
			explanationContent: 'explanationContent',
			explanationLink: 'explanationLink',
			explanationImg: 'explanationImg',
		}
	}

	const content = `<h2 id="explanationHeading" class="title is-4"></h2>
	<div id="explanationContent" class="nms-font"></div>
	<a id="explanationLink" target='_blank' rel='noopener noreferrer'>
		<img id="explanationImg" alt='Explainer Image'>
	</a>
	<form method="dialog">
		<button class="button" type="submit" autofocus>Close</button>
	</form>`;

	globalElements.output.explanation.innerHTML = content;

	updateGlobalElements(dialogElements);
})();

/**
 * A Set which holds images that have been previously loaded and cached.
 * @type {Set}
 */
const cachedImages = new Set();

/**
 * Displays an explanation modal with optional text and image.
 * @param {string} heading - The heading of the modal.
 * @param {string} text - The text content of the modal.
 * @param {string} img - The URL of the image to display in the modal.
 */
function explanation(heading, text, img) {
	const { explanationImg: imgElement, explanationLink: linkElement, explanation: dialogElement } = globalElements.output;

	// Check if img URL was provided
	if (img) {

		// Check if img was previously loaded and thus cached in the Set
		if (cachedImages.has(img)) {

			// Image was previously loaded, no need for loading animation
			linkElement.classList.remove('loading');

			// Check if img is different from the previously loaded image
			if (imgElement.getAttribute('src') != img) {
				// Update img source and link href if img is different
				imgElement.src = '';
				imgElement.src = img;
				linkElement.href = img;
			}

		} else {
			// Image is not cached, need to load it and show a loading animation
			imgElement.src = '';
			imgElement.style.opacity = 0;
			imgElement.style.marginBlockStart = 0;
			imgElement.src = img;
			linkElement.classList.add('loading');
			linkElement.href = img;
		}

		// Set link display style to visible
		linkElement.style.display = '';

	} else {
		// No img URL provided, hide the link
		linkElement.style.display = 'none';
	}

	// Set modal heading and text content
	globalElements.output.explanationHeading.innerText = heading;
	globalElements.output.explanationContent.innerHTML = text;

	// Show the modal with a slide-down animation
	dialogElement.style.translate = '0 -100vh';
	dialogElement.showModal();
	dialogElement.style.translate = '0 0';
	dialogElement.scrollTo(0, 0);

	// Wait for img to load, then update the DOM and cache the image
	imgElement.onload = () => {
		imgElement.style.marginBlockStart = '1rem';
		imgElement.style.opacity = 1;
		cachedImages.add(img);
	}
}

/**
 * Adds a tooltip to all HTML elements with the class name 'tooltip'
 *
 * @param  {Object} [dom=document] - Optional DOM object to query for elements
 * @return {void}
 */
function addAllTooltips(dom = document) {
	const elements = dom.querySelectorAll('span.tooltip');
	for (const element of elements) {
		constructTooltip(element);
	}

	/**
	 * Turns HTML tooltip data into actual interactive tooltip
	 * @function
	 * @param {Element} element - The tooltip element to be constructed
	 * @returns {void}
	 */
	function constructTooltip(element) {
		const dataElements = element.getElementsByTagName('data');
		if (!dataElements.length) return;

		const dataArr = new Array;
		for (const element of dataElements) {
			const text = element.innerHTML;
			dataArr.push(text);
		}

		const img = document.createElement('img');
		img.src = './assets/vector/help.svg';
		img.alt = 'Help';

		const tooltip = document.createElement('span');
		tooltip.classList.add('tooltiptext', 'nms-font');
		tooltip.innerHTML = dataArr.shift();

		/**
		* This if statement checks if the length of dataArr is truthy. If it is, params is assigned to an array with dataArr elements joined with a comma as the separator.
		* Then, the functionCall is assigned the result of interpolating params into a string with the `explanation` function call.
		* Finally, assignFunction is called with element, functionCall, and 'onclick' as its arguments.
		*/
		if (dataArr.length) {
			const params = dataArr.join('`,`');
			const functionCall = `explanation(\`${params}\`)`;
			assignFunction(element, functionCall, 'onclick');
		}

		element.innerHTML = img.outerHTML + tooltip.outerHTML;
	}
}
