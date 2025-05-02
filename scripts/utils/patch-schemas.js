const fsp = require('fs/promises');
const path = require('path');

const SCHEMAS = [
    'color-theme.json',
    'textmate-colors.json',
    'token-styling.json',
    'workbench-colors.json',
];
//todo Change to https://github.com/andymcintosh/vscode-schemas (recently updated). Original is unmaintained.
//nice-TBD Or maybe keep my own fork? Run the save-vscode-schemas extension myself (headless vscode?) and point to that repo from here.
const BASE_URL = 'https://raw.githubusercontent.com/wraith13/vscode-schemas/refs/heads/master/en/latest/schemas/';
const ROOT_DIR = path.join(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT_DIR, '.vscode', 'schemas');

module.exports = async () => {
    await downloadSchemaFiles();

    for (const schemaFile of SCHEMAS) {
        const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
        const schemaString = await fsp.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaString);

        let newSchema = adaptIncompatibleBits(schema);
        if (schemaPath.endsWith('color-theme.json')) {
            newSchema = addMainSchemaAnnotations(newSchema);
        }

        const newSchemaString = JSON.stringify(newSchema, null, 4);
        await fsp.writeFile(schemaPath, newSchemaString);
    }
};

if (require.main === module) {
    module.exports();
}

//nice: install wraith13/save-vscode-schemas itself, run it as a workspace task, then all of this.
//      pros: won't depend on a repo that may be outdated. / cons: tasks are tricky to configure.
async function downloadSchemaFiles() {
    console.log('downloading schemas...')
    for (const schema of SCHEMAS) {
        const response = await fetch(BASE_URL + schema);
        const content = await response.text();
        const schemaPath = path.join(SCHEMAS_DIR, schema);
        await fsp.writeFile(schemaPath, content);
    }
    console.log('downloads finished')
}

function adaptIncompatibleBits(schema) {
    schema = replaceVscodeUris(schema);
    schema = replaceColorHexTypes(schema);

    for (const key in schema) {
        if (typeof schema[key] === 'object')
            schema[key] = adaptIncompatibleBits(schema[key]);
    }
    return schema;
}

// the original schemas come with $ref URIs like "vscode://schemas/workbench-colors",
// replace them for relative paths (no dirname as they're in the same directory)
function replaceVscodeUris(schema) {
    if (schema['$ref'] && schema['$ref'].startsWith('vscode://schemas/')) {
        const relativePath = schema['$ref'].replace('vscode://schemas/', '') + '.json';
        schema['$ref'] = relativePath;
    }
    return schema;
}

//fixme: nulls are only allowed on "colors:"" keys (workbench). cf: generate.js#L39.
//      Update this to only apply it to "colors:".
//      Actually, I need to duplicate this to have both yalm-workbench-color-property & yaml-token-color-property (no nulls).
//nice: It does make sense to extend tokenColors (syntax)...
//      use cases: annotate alternatives, TBD; annotate default values.
//      Algorithm: if !color && !fontStyle: remove the whole theming rule; if any exists: keep it but remove empty keys
//      Then I should also replaceFontStyleTypes() in adaptIncompatibleBits() to allow null.
// the original schema doesn't allow some YAML themes' patterns:
// - null values: usually placeholders for a color setting
// - !alpha tags with color-hex + alpha channel
// our custom yaml-color-hex schema covers them
function replaceColorHexTypes(schema) {
    if (schema['type'] === 'string' && schema['format'] === 'color-hex') {
        delete schema['type'];
        delete schema['format'];
        schema = {
            '$ref': 'yaml-color-property.yml',
            ...schema
        };
    }
    return schema;
}

// prevents the looong absolute path to the schema from showing in the status bar
function addMainSchemaAnnotations(schema) {
    const annotations = {
        title: 'VS Code YAML color theme',
        description: 'VS Code color theme YAML file',
    };
    return { ...annotations, ...schema };
}
