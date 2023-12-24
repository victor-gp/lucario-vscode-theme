const fsp = require('fs/promises');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');

module.exports = async () => {
    //todo: automate download from https://github.com/wraith13/vscode-schemas/

    const files = await fsp.readdir(SCHEMAS_DIR);
    // yaml-color-hex.json is custom, no need to adapt anything
    const filterFn = file => file.endsWith(".json") && file !== "yaml-color-hex.json";
    const schemaPaths = files.filter(filterFn).map(file => path.join(SCHEMAS_DIR, file));

    for (const path of schemaPaths) {
        const schemaString = await fsp.readFile(path, 'utf-8');
        const schema = JSON.parse(schemaString);

        adaptIncompatibleBits(schema);
        if (path.endsWith("color-theme.json")) addMainSchemaInfo(schema);

        const newSchemaString = JSON.stringify(schema, null, 4);
        await fsp.writeFile(path, newSchemaString)
    }
};

if (require.main === module) {
    module.exports();
}

function adaptIncompatibleBits(schema) {
    replaceVscodeUris(schema);
    replaceColorHexTypes(schema);

    for (let key in schema) {
        if (typeof schema[key] === 'object')
            adaptIncompatibleBits(schema[key]);
    }
}

// the original schemas come with $ref URIs like "vscode://schemas/workbench-colors"
// replace them for relative paths (no dirname as they're in the same directory)
function replaceVscodeUris(schema) {
    if (schema['$ref'] && schema['$ref'].startsWith('vscode://schemas/')) {
        const relativePath = schema['$ref'].replace('vscode://schemas/', '') + '.json';
        schema['$ref'] = relativePath;
    }
}

// the original schema is doesn't allow some YAML themes' patterns:
// nullable colors (usually placeholders or commented) and !alpha tags (color + alpha channel)
// the yaml-color-hex.json schema covers that
function replaceColorHexTypes(schema) {
    if (schema['type'] === 'string' && schema['format'] === 'color-hex') {
        delete schema['type'];
        delete schema['format'];
        //nit: place the $ref key first like type, not last
        schema['$ref'] = 'yaml-color-hex.json'
    }
}

// prevents the looong absolute path to the schema from showing in the status bar
function addMainSchemaInfo(schema) {
    //nit: place these first
    schema['title'] = 'VS Code YAML color theme';
    schema['description'] = 'VS Code color theme YAML file';
}
