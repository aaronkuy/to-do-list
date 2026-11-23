# To-do List

A to-do list in the browser: add tasks, check them off and delete them; the list survives a reload.

![Screenshot of To-do List](docs/screenshot.png)

## Features

- Add tasks with the button or Enter
- Check off and delete tasks
- Tasks and their state persist in `localStorage`
- Works on phone screens

## Tech

- HTML, CSS, vanilla JavaScript
- `localStorage` for persistence
- Material Symbols icons as inline SVG

## How to run

Open the live version: **[aaronkuy.github.io/to-do-list](https://aaronkuy.github.io/to-do-list/)**

Or run it locally. There is no build step and no dependency:

```bash
git clone https://github.com/aaronkuy/to-do-list.git
cd to-do-list
open index.html        # macOS; on Linux use xdg-open, on Windows start
```

## What I learned

- Rendering a list from an array and keeping it in sync with storage
- Preventing the default form submit
- Responsive CSS for small screens

## What I'd do next

- Edit a task in place
- Filter by open and done
- Build list items with DOM methods instead of `innerHTML`

## Credits

- The first version of `script.js` (one array as state, a list rendered from it, save and load through `localStorage`) started from a to-do list tutorial. The link to that tutorial is not recorded in this repository yet.
- Icons: "check" and "delete" from [Material Symbols](https://fonts.google.com/icons) by Google, embedded as inline SVG and licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## License

MIT, see [LICENSE](LICENSE). It covers what this repository adds; the tutorial approach and the icons remain under the terms of their sources (see Credits).
