class APIInput {

    constructor(String name, String type) {
        this.name = name;

        this.div = $("<div></div>");
    }

    isValid() {

    }

    getValue() {
        return this.input.val();
    }
}

/**
 * types
 * - TEXT
 * -- ANY
 * -- NAME
 * -- WORD
 * -- ADDRESS
 * - INT
 * - DATE
 * - TEXTAREA
 *
 * special types
 * - COORDS
 * - DATERANGE
 * - LIST
 */

class IntInput extends APIInput {
    constructor(String name, String type) {
        super(name);
        this.maxLength = type.split("(")[1].split(")")[0];
    }

    createInput() {
        let label = $("<label>" + key + "</label>")
        this.div.append(label);

        this.input = $("<input>");
        this.input.attr("name", key);

        let maxNum = Math.pow(10, parseInt(this.maxLength)) - 1;

        this.input.attr("min", 0);
        this.input.attr("max", maxNum);
        this.input.attr("step", 1);

        this.div.append(this.input);
    }

}
