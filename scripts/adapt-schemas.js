const fsp = require('fs/promises');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');

module.exports = async () => {
    //todo: automate download from https://github.com/wraith13/vscode-schemas/

    const files = await fsp.readdir(SCHEMAS_DIR);
    const schemaPaths = files
        .filter(file => file.endsWith(".json") && file !== "yaml-color-hex.json")
        .map(file => path.join(SCHEMAS_DIR, file));

    for (const schemaPath of schemaPaths) {
        const schemaString = await fsp.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaString);
        performReplacements(schema);
        const adaptedSchemaString = JSON.stringify(schema, null, 4);
        await fsp.writeFile(schemaPath, adaptedSchemaString)
    }
};

if (require.main === module) {
    module.exports();
}

//tsk: find a better name, perhaps adaptIncompatibleBits
function performReplacements(schema) {
    replaceVscodeUris(schema);
    replaceColorHexTypes(schema);

    for (let key in schema) {
        if (typeof schema[key] === 'object')
            performReplacements(schema[key]);
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
