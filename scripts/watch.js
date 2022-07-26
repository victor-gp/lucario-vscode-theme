const { watch } = require("fs");
const build = require("./build");

const srcName = "src/Lucario.yml"

module.exports = async () => {
    watch(srcName, async (eventType, filename) => {
        if (eventType == "change") {
            try {
                console.log("watch: rebuild...");
                await build();
                console.log("watch: ok. waiting for file changes...\n");
            } catch (error) {
                delete error.mark.buffer // don't show the entire file
                console.error(error);
                console.error("watch: build error. see above.")
                console.log("watch: waiting for file changes...\n");
            }
        }
    });
    console.log("watch: on\n");
};

if (require.main === module) {
    module.exports();
}
