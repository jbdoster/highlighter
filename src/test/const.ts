export const activationEvents: Array<string> = [
    "onCommand:extension.highlightLines",
    "onCommand:extension.find_highlight",
    "onCommand:extension.remove_highlight",
    "onCommand:extension.remove_all_highlights"
];
export const commands: Array<object> = [
    {
        "command": "extension.highlightLines",
        "title": "Highlight Line(s)"
    },
    {
        "command": "extension.find_highlight",
        "title": "Find Highlighted Line(s)"
    },
    {
        "command": "extension.remove_highlight",
        "title": "Remove Highlighted Line(s)"
    },
    {
        "command": "extension.remove_all_highlights",
        "title": "Remove All Saved Highlights"
    }
];