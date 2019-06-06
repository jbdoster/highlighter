export const activationEvents: Array<string> = [
    "onCommand:extension.highlightLines",
    "onCommand:extension.findHighlight",
    "onCommand:extension.removeHighlight",
    "onCommand:extension.removeAllHighlights"
];
export const commands: Array<object> = [
    {
        "command": "extension.highlightLines",
        "title": "Highlight Line(s)"
    },
    {
        "command": "extension.findHighlight",
        "title": "Find Highlighted Line(s)"
    },
    {
        "command": "extension.removeHighlight",
        "title": "Remove Highlighted Line(s)"
    },
    {
        "command": "extension.removeAllHighlights",
        "title": "Remove All Saved Highlights"
    }
];