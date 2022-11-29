const htmlparser2 = require("htmlparser2");

function query(text) {
    return new Promise((resolve, reject) => {
        const results = []
        let scrape = null
        const parser = new htmlparser2.Parser({
            onopentag(name, attributes) {
                if (typeof attributes.class !== "string") return
                const classList = attributes.class.split(" ")
                if (name === "div" && classList.includes("result__body")) {
                    results.push({
                        title: null,
                        url: null,
                        snippet: null
                    })
                } else if (results.length > 0 && name === "a") {
                    const result = results[results.length - 1]
                    if (classList.includes("result__a") && result.title === null) scrape = "title"
                    else if (classList.includes("result__url") && result.url === null) scrape = "url"
                    else if (classList.includes("result__snippet") && result.snippet === null) scrape = "snippet"
                }
            },
            ontext(text) {
                if (scrape == null) return
                results[results.length - 1][scrape] = text.trim()
                scrape = null
            }
        })
        fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(text)}`, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Sec-Fetch-Dest": "desktop",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "cross-site",
                "User-Agent": "Mozilla/5.0 (X11; Linux aarch64; rv:107.0) Gecko/20100101 Firefox/107.0"
            }
        })
            .then(response => {
                return response.text()
            })
            .then(html => {
                parser.write(html)
                parser.end()
                resolve(results)
            })
        
    })
}

module.exports = query

// search if using from cmd
if (process.argv.length > 2) query(process.argv.slice(2).join(" "))
    .then(results => console.log(results))