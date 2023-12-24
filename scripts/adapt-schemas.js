const fsp = require('fs/promises');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');

module.exports = async () => {
    await downloadSchemaFiles();

    const files = await fsp.readdir(SCHEMAS_DIR);
    // yaml-color-hex.json is custom, no need to adapt anything
    const filterFn = file => file.endsWith(".json") && file !== "yaml-color-hex.json";
    const schemaPaths = files.filter(filterFn).map(file => path.join(SCHEMAS_DIR, file));

    for (const schemaPath of schemaPaths) {
        const schemaString = await fsp.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaString);

        let newSchema = adaptIncompatibleBits(schema);
        if (schemaPath.endsWith("color-theme.json")) {
            newSchema = addMainSchemaAnnotations(newSchema);

        }

        const newSchemaString = JSON.stringify(newSchema, null, 4);
        await fsp.writeFile(schemaPath, newSchemaString)
    }
};

if (require.main === module) {
    module.exports();
}

// alt: install wraith13/save-vscode-schemas itself, run it as a workspace task, then this
async function downloadSchemaFiles() {
    const baseUrl = 'https://raw.githubusercontent.com/wraith13/vscode-schemas/master/en/latest/schemas/'
    const relevantSchemas = [
        'color-theme.json',
        'textmate-colors.json',
        'token-styling.json',
        'workbench-colors.json',
    ]

    console.log('downloading schemas...')
    for (schema of relevantSchemas) {
        const response = await fetch(baseUrl + schema);
        const content = await response.text();
        const schemaPath = path.join(SCHEMAS_DIR, schema);
        await fsp.writeFile(schemaPath, content);
    }
    console.log('downloads finished')
}

function adaptIncompatibleBits(schema) {
    schema = replaceVscodeUris(schema);
    schema = replaceColorHexTypes(schema);

    for (let key in schema) {
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

// the original schema doesn't allow some YAML themes' patterns:
// - nullable colors (usually placeholders or commented)
// - !alpha tags (color + alpha channel)
// the yaml-color-hex.json schema covers them
function replaceColorHexTypes(schema) {
    if (schema['type'] === 'string' && schema['format'] === 'color-hex') {
        delete schema['type'];
        delete schema['format'];
        schema = {
            '$ref': 'yaml-color-hex.json',
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
    }

    return {...annotations, ...schema}
}
