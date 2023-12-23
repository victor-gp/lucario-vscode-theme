const fsp = require('fs/promises');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');

module.exports = async () => {
    //todo: automate download from https://github.com/wraith13/vscode-schemas/

    const files = await fsp.readdir(SCHEMAS_DIR);
    const schemaPaths = files.filter((file) => file.endsWith(".json"))
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

function performReplacements(schema) {
    // the original files come with $ref uris like "vscode://schemas/workbench-colors"
    // replace them for relative paths (in the same directory)
    if (schema['$ref'] && schema['$ref'].startsWith('vscode://schemas/')) {
        const relativePath = schema['$ref'].replace('vscode://schemas/', '') + '.json';
        schema['$ref'] = relativePath;
    }

    for (let key in schema) {
        if (typeof schema[key] === 'object')
            performReplacements(schema[key]);
    }
}
