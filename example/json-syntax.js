const highlight = (value) => {
    const json = typeof value === "string"
        ? value
        : JSON.stringify(value, null, 2);

    let html = "";
    let i = 0;


    const styles = {
        key: 'color: var(--json-key); font-size: 16px; font-weight: 500;',
        string: 'color: var(--json-string); font-size: 16px; font-weight: 500;',
        number: 'color: var(--json-number); font-size: 16px; font-weight: 500;',
        boolean: 'color: var(--json-boolean); font-size: 16px; font-weight: 500;',
        null: 'color: var(--json-null); font-size: 16px; font-weight: 500;',
        punctuation: 'color: var(--json-punctuation); font-size: 16px; font-weight: 400;'
    };

    const escapeHTML = (str) =>
        str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

    while (i < json.length) {
        const char = json[i];

        // Preserve whitespace exactly
        if (/\s/.test(char)) {
            html += char;
            i++;
            continue;
        }

        // Strings
        if (char === '"') {
            let str = '"';
            i++;

            while (i < json.length) {
                const current = json[i];
                str += current;

                if (current === "\\") {
                    i++;

                    if (i < json.length) {
                        str += json[i];
                    }
                } else if (current === '"') {
                    break;
                }

                i++;
            }

            i++;

            // Determine whether this string is a JSON key
            let next = i;

            while (next < json.length && /\s/.test(json[next])) {
                next++;
            }

            const isKey = json[next] === ":";

            html += `<span style="${isKey ? styles.key : styles.string}">${escapeHTML(str)}</span>`;
            continue;
        }

        // Numbers
        if (char === "-" || /\d/.test(char)) {
            const match = json
                .slice(i)
                .match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);

            if (match) {
                html += `<span style="${styles.number}">${match[0]}</span>`;
                i += match[0].length;
                continue;
            }
        }

        // true / false
        if (json.startsWith("true", i) || json.startsWith("false", i)) {
            const value = json.startsWith("true", i) ? "true" : "false";

            html += `<span style="${styles.boolean}">${value}</span>`;
            i += value.length;
            continue;
        }

        // null
        if (json.startsWith("null", i)) {
            html += `<span style="${styles.null}">null</span>`;
            i += 4;
            continue;
        }

        // JSON punctuation
        if ("{}[],:".includes(char)) {
            html += `<span style="${styles.punctuation}">${char}</span>`;
            i++;
            continue;
        }

        // Anything else
        html += escapeHTML(char);
        i++;
    }

    return html;
}

export { highlight }