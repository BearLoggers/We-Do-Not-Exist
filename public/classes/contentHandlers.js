function updateTextarea(textarea, text) {
    let {selectionStart, selectionEnd, value} = textarea.elt;


    textarea.value(text);

    if (selectionStart == value.length && selectionEnd == value.length) {
        console.log("ok");
        textarea.elt.selectionStart = textarea.elt.value.length;
        textarea.elt.selectionEnd = textarea.elt.value.length;
    }
    else {
        textarea.elt.selectionEnd = selectionEnd;
        textarea.elt.selectionStart = selectionStart;
    }
}

class ContentHandler {
    constructor() {
        this.parent = null;
        this.content = null;

        this.keyStroke = null;

        this.cursorEnabled = false;
    }

    init(parent) {
        this.parent = parent;
    }

    update() {
        this.content.position(this.parent.x + TP, this.parent.y + TP + TBH);
        this.content.size(this.parent.width - 2*TP, this.parent.height - 2*TP - TBH);

        this.updateContent();
    }
}

class BlinkingTerminal extends ContentHandler {
    constructor() {
        super();

        this.count = 0;
        this.content = createElement('textarea');
        this.textContent =
`         _____  ______  _   _
        / ____||  ____|| \\ | |
       | |  __ | |__   |  \\| |   ___   ___
       | | |_ ||  __|  | . \` |  / _ \\ / __|
       | |__| || |____ | |\\  | | (_) |\\__ \\
        \\_____||______||_| \\_|  \\___/ |___/

Booting... Done.
Welcome. Please, perform a log in:

Username:
> `;

        //this.textContent = "Test > ";
        this.content.value(this.textContent);

        this.lastValidContent = null;

        this.content.elt.onkeyup = (e) => this.getKeyStroke(e);
    }

    getKeyStroke(keyEvent) {
        if (this.content.value().indexOf(this.textContent) != 0) {
            this.content.value(this.lastValidContent || this.textContent);
        }
        else {
            this.lastValidContent = this.content.value();
            if (keyEvent.key == "Enter") {
                const username = this.content.value().substring(
                    this.content.value().lastIndexOf('> ') + 1, this.content.value().lastIndexOf('\n'));

                this.textContent = this.content.value() + `Welcome, ${username} ;) \n> `;
                this.content.value(this.textContent);
            }
        }
    }

    updateContent() {
    }
}