class Overlay {
    constructor(container, settings) {
        this.container = container;

        // Overlay Setup
        this.$overlay = $("<div>")
                        .addClass("global-overlay")
                        .addClass("hidden");
        $(this.container).append(this.$overlay);
        this.overlay_active = false;

        // Timer Setup
        this.$timer = $("<div>")
                        .addClass("global-timer")
                        .addClass("hidden")
                        .css({
                            "top": settings.timer.top,
                            "left": settings.timer.left
                        })
                        .appendTo(this.$overlay);
        this.$timer.append(`<img class="" src="icons/button/empty-hourglass.png" />
        <span>Loading...</span>`);
        this.timer_active = false;

        // Dialog Setup
        this.$dialog = $("<div>")
                        .addClass("global-dialog")
                        .addClass("hidden")
                        .css({
                            "top": settings.dialog.top,
                            "left": settings.dialog.left
                        })
                        .appendTo(this.$overlay);
        this.$dialog.append($("<header>"));
        this.$dialog.append($("<main>"));
        this.$dialog.append($("<aside>"));
        this.dialog_active = false;
    }

    showOverlay() {
        this.overlay_active = true;
        this.$overlay.removeClass("hidden");
    }

    hideOverlay() {
        this.overlay_active = false;
        this.$overlay.addClass("hidden");
    }

    showTimer() {
        this.showOverlay();
        this.timer_active = true;
        this.$timer.removeClass("hidden");
    }

    hideTimer() {
        this.hideOverlay();
        this.timer_active = false;
        this.$overlay.addClass("hidden");
    }

    showDialog(settings) {
        this.showOverlay();

        let header = this.$dialog.find("header");
        header.empty();
        header.removeClass();
        switch (settings.header) {
            case "error":
                header.addClass("error");
                break;
            case "caution":
                header.addClass("caution");
                header.html(`
                    <img src="icons/button/warning.png" />
                    <span>Caution Advised</span>
                    `);
                break;
            case "warning":
                header.addClass("warning");
                header.html(`
                    <img src="icons/button/warning.png" />
                    <span>Warning</span>
                    `);
                break;
        }

        let main = this.$dialog.find("main");
        main.empty();
        main.html(settings.text);

        let buttons = this.$dialog.find("aside");
        buttons.empty();
        $.each(settings.buttons, function(index, option) {
            let button = $(`<button>${option.text}</button>`);
            button.addClass(option.style);
            button.on("click", option.click);

            buttons.append(button);
        });

        this.dialog_active = true;
        this.$dialog.fadeIn({
            duration: 250
        });
        this.$dialog.removeClass("hidden");
    }

    hideDialog() {
        this.dialog_active = false;
        DOM_Case.case.dialog.fadeOut();
        DOM_Case.case.dialog.addClass("hidden");
        this.hideOverlay();
    }
}

class PageLoader {
    constructor(container, settings) {
        this.container = container;
        this.container_nav = "#js-global-nav";
        //this.empty = settings.empty;
    }

    load(path) {
        let def = $.Deferred();

        let $interim = $("<div>")
                        .addClass("global-loader")
                        .appendTo($(this.container))
                        .hide();


        let loader = this;

        function load() {
            $interim.fadeIn(500, function() {
                loader.$previous = $interim.children();
                $interim.children().unwrap();

                def.resolve();
            });
        }

        $interim.load(path, function() {
            if (loader.$previous) {
                loader.$previous.fadeOut(495, function() {
                    loader.$previous.remove();
                });
                load();
            } else {
                load();
            }
        });

        return def;
    }
}
