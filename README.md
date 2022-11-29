# DuckDuckSearch! - a tui for duckduckgo.
duckducksearch is a terminal user interface for browsing duckduckgo results  
and will be opened with your default browser.  
## usage
install with this command:
```bash
npm install -global duckducksearch
```
and run duckducksearch with:
```bash
duckducksearch
```
## images
![ui](https://raw.githubusercontent.com/charlesyiu/duckducksearch/master/images/ui.png)
![ui searching](https://raw.githubusercontent.com/charlesyiu/duckducksearch/master/images/ui_search.png)
## keybindings
- typing the alphabet, numbers, symbols will automatically trigger search.  
- using the left and right arrow keys will move the cursor left or right.  
- use up and down arrow keys to select your desired result.  
- pressing enter will open the selected result's link in the browser.  
## dependencies
- [htmlparser2](https://github.com/fb55/htmlparser2)
- [blessed](https://github.com/chjj/blessed)
- [open](https://github.com/sindresorhus/open)