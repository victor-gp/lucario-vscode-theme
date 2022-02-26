const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'themes');

if (!fs.existsSync(THEME_DIR)) {
    fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {
    const theme = await generate();

    return Promise.all([
        fs.promises.writeFile(
            path.join(THEME_DIR, 'Lucario-color-theme.json'),
            JSON.stringify(theme, null, 4)
                .concat("\n") // newline at end of file
        )
    ]);
};

if (require.main === module) {
    module.exports();
}
