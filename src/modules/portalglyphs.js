/**
 * @fileoverview Inserts portalglyph buttons into the page and handles all logic surrounding them.
 */

const validPortalKeys = '0123456789ABCDEF';

/**
 * Adds portal glyph buttons to a specified element.
 * @param {HTMLElement} element - The element to which the buttons should be added.
 * @param {string} glyphInputBindId - The input binding ID for the glyph press function.
 * @returns {void}
 */
function addPortalGlyphButtons(element, glyphInputBindId) {
	if (!element) return;
	const glyphs = new Array;
	for (const letter of validPortalKeys) {
		const glyph = `<button type="button" data-input-bind="${glyphInputBindId}" class="button" value="${letter}" onclick="glyphOnClick(this)"><span class="glyph icon is-small">${letter}</span></button>`;
		glyphs.push(glyph);
	}
	element.innerHTML = glyphs.join('');
}
addPortalGlyphButtons(globalElements.output.portalglyphButtons, 'portalglyphsInput');

/**
* Calls the `oninput` function of the input element.
*
* @param {HTMLInputElement} input - The input element to be executed on.
*/
function executeOnInput(input) {
	input?.oninput?.call(input);
}

/**
 * Handles the onclick event of a glyph button.
 *
 * @param {HTMLButtonElement} button - The button that was clicked
 * @returns {void}
 */
function glyphOnClick(button) {
	const glyphInputBindId = button?.dataset?.inputBind ?? null;
	const input = globalElements.input[glyphInputBindId] ?? document.getElementById(glyphInputBindId) ?? button?.closest('.tableHeader')?.previousElementSibling?.querySelector('input');
	const portalCode = input.value;

	if (portalCode.length < 12) {
		input.value += button.value;
	}
	executeOnInput(input);
}

/**
 * Displays the portal glyphs based on the user's input, and also updates the wiki code and glyph region on the page.
 *
 * @returns {void}
 */
function displayGlyphs() {
	const input = globalElements.input.portalglyphsInput;
	const glyphString = input.value;
	pageData.portalglyphs = glyphString;
	const dest = input.dataset.destNoauto;
	wikiCode(glyphString, dest);
	glyphRegion(glyphString);
	if (getDestElements('galacticCoords').length) wikiCode(glyphs2Coords(glyphString), 'galacticCoords')
}

/**
 * Removes the last character from a given input field, updates the value of the field, and executes `executeOnInput` with the updated input field.
 *
 * @param {HTMLElement} button - The button element clicked to invoke this function.
 * @returns {void} - This function does not return a value.
 */
function deleteCharacter(button) {
	const input = button?.dataset?.inputBind ?? null;
	const glyphInput = globalElements.input[input] ?? document.getElementById(input) ?? button?.closest('.tableCell')?.nextElementSibling?.querySelector('input') ?? globalElements.input.portalglyphsInput;
	const enteredGlyphs = glyphInput?.value?.split('');
	enteredGlyphs.pop();
	const newString = enteredGlyphs.join('');
	glyphInput.value = newString;
	executeOnInput(glyphInput);
}

/**
 * This function handles the `oninput` event for the input field for glyph values.
 *
 * @param {HTMLInputElement} input - The input field element for glyph values
 * @returns {void}
 */
function glyphInputOnChange(input) {
	// Converts the value of the input field to uppercase
	const newValue = input?.value?.toUpperCase?.();
	if (newValue == null) return;

	// Sets the input field value to the validated glyph value
	input.value = validateGlyphInput(newValue);
}

/**
 * This function validates a string of portal glyphs by filtering out invalid characters and truncating the result to 12 characters or less.
 *
 * @param {string} glyphString - The string of portal glyphs to validate
 * @returns {string} The validated string of portal glyphs
 */
function validateGlyphInput(glyphString) {
	// Filters out invalid characters and truncates the result to 12 characters or less
	return glyphString
		.split('')
		.filter(char => validPortalKeys.includes(char))
		.join('')
		.substring(0, 12);
}

/**
 * This function validates a string of glyphs and returns the region object.
 *
 * @param {string} glyphs - The string of glyphs to validate
 * @param {string} [civShort=pageData.civShort] - The short name of the civilization
 * @param {Object} [regionObj=regions] - The object containing the region data
 * @returns {Object|string} - The region object or an empty string if the input does not contain 12 glyphs
 */
function validateGlyphs(glyphs, civShort = pageData.civShort, regionObj = regions) {
	// Checks if the input contains exactly 12 glyphs
	if (glyphs.length != 12) return '';

	// Gets the region list based on the civilization short name and extracts the region glyphs
	const regionList = regionObj[civShort];
	const regionGlyphs = glyphs.substring(4);

	// Finds the corresponding region object based on the region glyphs and returns it
	const region = regionList[regionGlyphs];
	return region;
}

/**
 * Validates whether a set of glyphs is a valid region and outputs the corresponding Wiki code for it.
 * @param {Array<string>} glyphs - An array of Portal Glyph strings.
 * @returns {string} The corresponding Wiki code for the valid region, or an empty string if the region is invalid.
 */
function glyphRegion(glyphs) {
	const glyphElement = globalElements.input.portalglyphsInput;
	let region = '';
	if (glyphs?.length == 12) {
		region = validateGlyphs(glyphs);
	}
	glyphError(region, glyphElement);
	wikiCode(region ?? '', 'region');
}

/**
 * Displays an error message for a glyph element with an optional invalid region message.
 *
 * @param {string} region - The region to validate. If undefined, the error message will display a link to a list of valid regions.
 * @param {HTMLElement} glyphElement - The HTML element representing the incorrect glyph.
 *
 * @returns {void}
 */
function glyphError(region, glyphElement) {
	errorMessage(glyphElement,
		(region == undefined)
			? 'No valid Hub region. See <a href="https://nomanssky.fandom.com/wiki/Galactic_Hub_Regions" target="_blank" rel="noopener noreferrer">Galactic Hub Regions</a> for a list of valid regions.'
			: null);
}

/**
 * Converts a glyph string to coordinates.
 * @param {string} glyphs - A string of glyphs representing coordinates.
 * @returns {string} A string of coordinates in the format "XXXX:YYYY:ZZZZ:SSSS".
 */
function glyphs2Coords(glyphs) {
	if (glyphs.length != 12) return '';

	const X_Z_POS_SHIFT = 2049;
	const X_Z_NEG_SHIFT = 2047;
	const Y_POS_SHIFT = 129;
	const Y_NEG_SHIFT = 127;

	const x_glyphs = parseInt(glyphs.substring(9, 12), 16);
	const y_glyphs = parseInt(glyphs.substring(4, 6), 16);
	const z_glyphs = parseInt(glyphs.substring(6, 9), 16);
	const system_idx = glyphs.substring(1, 4);

	let coords_x = 0;
	let coords_y = 0;
	let coords_z = 0;

	if (x_glyphs >= X_Z_POS_SHIFT) {
		coords_x = x_glyphs - X_Z_POS_SHIFT;
	} else {
		coords_x = x_glyphs + X_Z_NEG_SHIFT;
	}

	if (z_glyphs >= X_Z_POS_SHIFT) {
		coords_z = z_glyphs - X_Z_POS_SHIFT;
	} else {
		coords_z = z_glyphs + X_Z_NEG_SHIFT;
	}

	if (y_glyphs >= Y_POS_SHIFT) {
		coords_y = y_glyphs - Y_POS_SHIFT;
	} else {
		coords_y = y_glyphs + Y_NEG_SHIFT;
	}

	const coordinates = new Array(4);

	coordinates[0] = coords_x.toString(16).toUpperCase().padStart(4, '0');
	coordinates[1] = coords_y.toString(16).toUpperCase().padStart(4, '0');
	coordinates[2] = coords_z.toString(16).toUpperCase().padStart(4, '0');
	coordinates[3] = system_idx.padStart(4, '0');

	return coordinates.join(':');
}