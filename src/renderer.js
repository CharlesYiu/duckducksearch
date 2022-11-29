const blessed = require("blessed");

// center text function - temp fix for blessed align & valign style properties
function center(
    text,
    element,
    options = {
        horizontally: true,
        vertically: true,
    }
) {
    const lines = text.split("\n");
    lines.forEach((line, index) => {
        // clipping
        if (line.length > element.width) {
            // append to next line if avaliable
            if (element.height > lines.length + 1) {
                if (index + 1 >= lines.length) lines.push("");
                lines[index + 1] += line.substring(element.width - 1);
            }
            line = line.substring(0, element.width - 2);
        }
        // center horizontally
        if (options.horizontally === true) {
            const hhalf = Math.floor((element.width - line.length) / 2);
            line = `${new Array(hhalf).join(" ")}${line}${new Array(hhalf).join(
                " "
            )}`;
        }
        lines[index] = line;
    });
    text = lines.join("\n");
    // center vertically
    if (options.vertically === true) {
        const vhalf = Math.floor(element.height / 2);
        text = `${new Array(vhalf).join("\n")}${text}${new Array(vhalf).join(
            "\n"
        )}`;
    }

    return text;
}

// has to set parent with options to work -- better input than the one provided
function Input(
    oninput,
    screen,
    options = {
        multiline: false,
        spacing: "",
        element: {
            top: "5",
            left: "center",
            width: "75%",
            height: 5,
            content: "",
            tags: true,
            border: {
                type: "bg",
            },
            style: {
                fg: "white",
                bg: "black",
                border: { fg: "#f0f0f0" },
            },
        },
    }
) {
    const element = blessed.text(options.element);

    let content = "";
    let caretPos = 0;
    let caret = "";
    const spacing = new Array(
        typeof options.spacing === "number" ? options.spacing : 0
    ).join(" ");

    function render() {
        let _content =
            spacing +
            (caret !== ""
                ? content.substring(0, caretPos) +
                  caret +
                  content.substring(caretPos + 1)
                : content);
        element.content = `{bold}${center(_content, element, {
            vertically: true,
        })}{/bold}`;

        screen.render();
    }

    // caret
    setInterval(function () {
        caret = caret === "█" ? "" : "█";
        render();
    }, 500);

    function appendCharacter(character) {
        content =
            content.substring(0, caretPos) +
            character +
            content.substring(caretPos);
        caretPos += 1;
    }

    screen.on("keypress", function (ch, key) {
        let changed = true;
        // handle caret
        if (key.full === "left") caretPos -= caretPos > 0 ? 1 : 0;
        else if (key.full === "right")
            caretPos += content.length < caretPos ? 0 : 1;
        else {
            // handle keys
            if (key.full === "enter" && options.multiline === true)
                appendCharacter("\n");
            else if (key.full === "backspace") {
                content =
                    content.substring(0, caretPos - 1) +
                    content.substring(caretPos);
                caretPos -= caretPos > 0 ? 1 : 0;
            } else if (
                (key.name || key.full).length === 1 ||
                key.full === "space"
            )
                appendCharacter(ch);
            else changed = false;
            if (changed) oninput(content);
        }
        if (changed) render();
    });

    return element;
}

function Renderer() {
    this.screen = blessed.screen({ smartCSR: true });

    this.screen.key(["escape", "C-c"], () => {
        return process.exit(0);
    });

    this.renderResults = (fetchResults, openURL, changedSelection) => {
        let results = [];
        let query = null;
        let fetchedQuery = null;
        let selectedURL = null;

        setInterval(() => {
            if (
                (query === fetchedQuery && fetchedQuery !== null) ||
                query === null
            )
                return;
            const _query = query;
            fetchResults(_query).then((_results) => {
                results = _results;
                renderResults();
                fetchedQuery = _query;
            });
        }, 500);

        const logo = blessed.text({
            top: 1,
            left: "75%",
            width: "20%",
            height: 3,
            content: "",
            style: {
                fg: "white",
                bg: "black",
                border: {
                    bg: "black",
                },
            },
            border: {
                type: "bg",
            },
        });
        this.screen.append(logo);
        logo.content = center("DuckDuckSearch", logo, {
            vertically: false,
            horizontally: true,
        });

        const searchBar = Input((text) => (query = text), this.screen, {
            spacing: 2,
            element: {
                top: 1,
                left: "5%",
                width: "70%-1",
                height: 3,
                content: "",
                tags: true,
                style: {
                    fg: "white",
                    bg: "black",
                    border: {
                        bg: "black",
                    },
                },
                border: {
                    type: "bg",
                },
            },
        });
        this.screen.append(searchBar);

        const resultContainer = blessed.box({
            top: searchBar.top * 2 + searchBar.height,
            width: "90%",
            height: "100%-5",
            left: "center",
            style: {
                bg: "black",
            },
        });
        this.screen.append(resultContainer);

        function renderResults() {
            while (resultContainer.children.length > 0)
                resultContainer.children[0].destroy();
            this.screen.render();
            if (displayableResults <= 0) return;

            const startIndex =
                Math.floor(
                    ((selectionIndex + 1) / displayableResults) *
                        displayableResults
                ) - 1;
            const renderResults = results.slice(
                startIndex,
                startIndex + displayableResults
            );
            renderResults.forEach((_result, index) => {
                const selected = startIndex + index === selectionIndex;
                const foreground = selected ? "black" : "white";
                const background = selected ? "white" : "black";
                const result = blessed.box({
                    top: resultContainer.top * index,
                    left: "center",
                    width: "90%",
                    height: 7,
                    style: {
                        bg: background,
                    },
                    children: [
                        blessed.line({
                            top: 0,
                            left: "5%",
                            width: "90%",
                            style: {
                                fg: foreground,
                                bg: background,
                            },
                            orientation: "horizontal",
                        }),
                        blessed.text({
                            top: 2,
                            left: "10%",
                            width: "80%",
                            style: {
                                fg: foreground,
                                bg: background,
                            },
                            content: _result.title,
                        }),
                        blessed.text({
                            top: 3,
                            left: "10%",
                            width: "80%",
                            style: {
                                fg: foreground,
                                bg: background,
                            },
                            content: _result.url,
                        }),
                        blessed.text({
                            top: 4,
                            left: "10%",
                            width: "80%",
                            style: {
                                fg: foreground,
                                bg: background,
                            },
                            content: _result.snippet,
                        }),
                        blessed.line({
                            top: 0,
                            left: "5%",
                            width: "90%",
                            style: {
                                fg: foreground,
                                bg: background,
                            },
                            orientation: "horizontal",
                        }),
                    ],
                });
                if (selected) selectedURL = _result.url;
                resultContainer.append(result);
            });
            this.screen.render();
        }

        // handle selections
        let selectionIndex = 0;

        this.screen.on("keypress", (_, key) => {
            let render = true;
            if (key.full === "up")
                selectionIndex -= selectionIndex <= 0 ? 0 : 1;
            else if (key.full === "down")
                selectionIndex += selectionIndex >= results.length - 1 ? 0 : 1;
            else if (
                key.full === "enter" &&
                selectedURL !== null &&
                typeof openURL === "function"
            )
                openURL(selectedURL);
            else render = false;
            if (render) {
                if (typeof changedSelection === "function")
                    changedSelection(selectionIndex);
                renderResults();
            }
        });

        // calculate how many results we can fit in the terminal
        let displayableResults = calculateDisplayableResults();
        this.screen.on("resize", () => {
            displayableResults = calculateDisplayableResults();
            renderResults();
        });
        function calculateDisplayableResults() {
            // fix bad code - constant for result height
            return Math.floor(resultContainer.height / 5);
        }
    };
    return this;
}

module.exports = Renderer;

// render example if running from cmd
if (require.main === module) {
    const renderer = Renderer();

    const log = [];
    let previousLog = null;
    let logElement = null;
    setInterval(() => {
        if (log === previousLog) return;
        if (logElement !== null) logElement.destroy();

        logElement = blessed.text({ content: log.join(", ") });
        renderer.screen.append(logElement);
        renderer.screen.render();
    }, 1000);

    renderer.renderResults(
        (text) =>
            new Promise((resolve, _) => {
                log[0] = `searched: "${text}"`;
                resolve([
                    {
                        title: "item 1",
                        url: "example.com/1",
                        snippet: "snippet 1",
                    },
                    {
                        title: "item 2",
                        url: "example.com/2",
                        snippet: "snippet 2",
                    },
                    {
                        title: "item 3",
                        url: "example.com/3",
                        snippet: "snippet 3",
                    },
                    {
                        title: "item 4",
                        url: "example.com/4",
                        snippet: "snippet 4",
                    },
                    {
                        title: "item 5",
                        url: "example.com/5",
                        snippet: "snippet 5",
                    },
                ]);
            }),
        (url) => (log[2] = `opened: "${url}"`),
        (index) => (log[1] = `selected: ${index}`)
    );
}
