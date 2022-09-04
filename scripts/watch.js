//fixme: it stops watching after a merge conflict. or stops re-building?

const { watch } = require("fs");
const build = require("./build");

const srcName = "themes/Lucario-color-theme.yml";
var fsTimeout;

module.exports = async () => {
    watch(srcName, async (eventType, filename) => {
        if (eventType == "change") {
            // skip duplicate events
            if (fsTimeout) return;
            fsTimeout = setTimeout(() => fsTimeout = null, 10); // ms

            try {
                console.log("watch: rebuild...");
                await build();
                console.log("watch: ok. waiting for file changes...\n");
            } catch (error) {
                if (error?.mark?.buffer)
                    delete error.mark.buffer; // don't show the entire file
                console.error(error);
                console.error("watch: build error. see above.");
                console.log("watch: waiting for file changes...\n");
            }
        }
    });
    console.log("watch: on\n");
};

if (require.main === module) {
    module.exports();
}
