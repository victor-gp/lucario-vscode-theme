const { readFile } = require('fs').promises;
const { join } = require('path');
const { Type, DEFAULT_SCHEMA, load } = require('js-yaml');

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Theme - Parsed theme object.
 * @prop {Record<'base'|'ansi'|'brightOther'|'other', string[]>} dracula - Dracula color variables.
 * @prop {Record<string, string|null|undefined>} colors - VSCode color mapping.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

// nice: should expand 3-digit hex colors (like #fff) before appending alpha
const withAlphaType = new Type('!alpha', {
    kind: 'sequence',
    construct: ([hexRGB, alpha]) => hexRGB + alpha,
    represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = DEFAULT_SCHEMA.extend([withAlphaType]);

module.exports = async () => {
    const yamlFile = await readFile(
        join(__dirname, '..', 'themes', 'Lucario-color-theme.yml'),
        'utf-8'
    );

    /** @type {Theme} */
    const theme = load(yamlFile, { schema });

    // Remove nulls and other falsey values from colors
    for (const key of Object.keys(theme.colors)) {
        if (!theme.colors[key]) {
            delete theme.colors[key];
        }
    }

    return theme;
};
