const { handler } = require("./dist/index");

async function main() {
    console.time("Local test");
    handler();
    console.timeEnd("Local test");
}

main().then(() => {
    console.log("Done");
});