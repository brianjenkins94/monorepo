// @ts-check

const argv = process.argv.slice(2);

const entries = argv.map(function(element) {
    element = element.substring(2);

    return [element, element + "/**"];
});

const object = Object.fromEntries(entries);

console.log(JSON.stringify(object));
