const { watch } = require("fs");
const build = require('./build');

module.exports = async () => {
    watch('src/Lucario.yml', async (eventType, filename) => {
        if (eventType == "change") {
            await build();
        }
    });
};

if (require.main === module) {
    module.exports();
}
