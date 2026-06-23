namespace nums {
    /**
     * Returns a 5x5 LED image representation of numbers from 0 to 19,
     * or a fallback question mark image for other numbers.
     * @param num the number to convert into an LED image
     */
    export function icon(num: number): Image {
        if (num == 0) {
            return images.createImage(`
                . # # # .
                . # . # .
                . # . # .
                . # . # .
                . # # # .
                `);
        } else if (num == 1) {
            return images.createImage(`
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                `);
        } else if (num == 2) {
            return images.createImage(`
                . # # # .
                . . . # .
                . # # # .
                . # . . .
                . # # # .
                `);
        } else if (num == 3) {
            return images.createImage(`
                . # # # .
                . . . # .
                . # # # .
                . . . # .
                . # # # .
                `);
        } else if (num == 4) {
            return images.createImage(`
                . # . # .
                . # . # .
                . # # # .
                . . . # .
                . . . # .
                `);
        } else if (num == 5) {
            return images.createImage(`
                . # # # .
                . # . . .
                . # # # .
                . . . # .
                . # # # .
                `);
        } else if (num == 6) {
            return images.createImage(`
                . # # # .
                . # . . .
                . # # # .
                . # . # .
                . # # # .
                `);
        } else if (num == 7) {
            return images.createImage(`
                . # # # .
                . . . # .
                . . . # .
                . . . # .
                . . . # .
                `);
        } else if (num == 8) {
            return images.createImage(`
                . # # # .
                . # . # .
                . # # # .
                . # . # .
                . # # # .
                `);
        } else if (num == 9) {
            return images.createImage(`
                . # # # .
                . # . # .
                . # # # .
                . . . # .
                . # # # .
                `);
        } else if (num == 10) {
            return images.createImage(`
                # . # # #
                # . # . #
                # . # . #
                # . # . #
                # . # # #
                `);
        } else if (num == 11) {
            return images.createImage(`
                . # . # .
                . # . # .
                . # . # .
                . # . # .
                . # . # .
                `);
        } else if (num == 12) {
            return images.createImage(`
                # . # # #
                # . . . #
                # . # # #
                # . # . .
                # . # # #
                `);
        } else if (num == 13) {
            return images.createImage(`
                # . # # #
                # . . . #
                # . # # #
                # . . . #
                # . # # #
                `);
        } else if (num == 14) {
            return images.createImage(`
                # . # . #
                # . # . #
                # . # # #
                # . . . #
                # . . . #
                `);
        } else if (num == 15) {
            return images.createImage(`
                # . # # #
                # . # . .
                # . # # #
                # . . . #
                # . # # #
                `);
        } else if (num == 16) {
            return images.createImage(`
                # . # # #
                # . # . .
                # . # # #
                # . # . #
                # . # # #
                `);
        } else if (num == 17) {
            return images.createImage(`
                # . # # #
                # . . . #
                # . . . #
                # . . . #
                # . . . #
                `);
        } else if (num == 18) {
            return images.createImage(`
                # . # # #
                # . # . #
                # . # # #
                # . # . #
                # . # # #
                `);
        } else if (num == 19) {
            return images.createImage(`
                # . # # #
                # . # . #
                # . # # #
                # . . . #
                # . # # #
                `);
        } else {
            // Fallback: Returns a question mark image for numbers outside 0-19
            return images.createImage(`
                . # # # .
                . . . # .
                . . # # .
                . . . . .
                . . # . .
                `);
        }
    }
}