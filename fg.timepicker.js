// noinspection JSUnusedAssignment
/**
 * FG Timepicker 2019 edition
 * 
 * I am creating this timepicker script because I feel there is still in 2019 a lack of a good usefull timepicker
 * 
 * The previous one I created was based on jQuery UI. I think it is time we have a library agnostic timepicker
 * 
 */

var fg = fg || {};

fg.log = fg.log || function log(log){
    if (console) {
        console.log(log);
    }
};

// a basic time object
fg.Time = function Time(hour, minute) {
    
};

fg.Timepicker = function Timepicker(options) {

    // init hour and minutes to current time
    let now = new Date();
    // the currently selected hour
    let hour = options.hour ? options.hour : now.getHours();
    // the currently selected minute
    let minute = options.minute ? options.minute : now.getMinutes();

    let mainElementClass = "fgtp";

    // pointer to the dom element build to show the timepicker
    let domEl = null;


    /**
     * binding and popup settings
     * The timepicker can be one and only one of the 3 : input, button or container
     */
    // bindInput is the text box bound to the timepicker for value and popup
    let bindInput = options.bindInput ? options.bindInput : null;
    // define if the timepicker pops up automatically on focus or not
    let autoPopup = options.autoPopup ? options.autoPopup : true;
    // TODO: show the timepicker when this button is clicked
    let bindButton = options.bindButton ? options.bindButton : null;
    // show the timepicker inline in this container
    let bindContainer = options.bindContainer ? options.bindContainer : null;

    // events 
    this.onHourChange = options.onHourChange ? options.onHourChange : null;
    this.onMinuteChange = null;
    this.onTimeChange = options.onTimeChange ? options.onTimeChange : null;
    this.onShow = null;
    this.onHide = null;
    this.onRedraw = null;


    // internal to keep track of visibility of the timepicker
    let visible = false;

    // === getter and setters ===
    this.getHour = function getHour() {
        return hour;
    };
    this.setHour = function setHour(newHour) {
        hour = newHour;
        // TODO: add handle for new hour
    };

    this.getMinute = function getMinute() {
        return minute;
    };
    this.setMinute = function setMinute(newMinute) {
        minute = newMinute;
        // TODO: add handle for new minute
    };

    /**
     * function getFormattedTime
     * Return selected time displayed with localisation settings
     * TODO: implement localisation
     */

    this.getFormattedTime = function() {
        return this.getHour() + ":" + this.getMinute();
    };


    /**
     * Private functions
     */
    let e = function createElement(nameTag, className) {
        let e = document.createElement(nameTag);
        e.className = className;
        return e;
    };

    let buildDomElements = function buildDomElements() {

        // TODO: Cleanup
        domEl = null;

        domEl = document.createElement('div', mainElementClass);

        let p = e('p');
        p.innerHTML = "Hello my coconut";
        domEl.appendChild(p);


        return domEl;
    };



    // end of initialisation
    if (bindContainer) {
        bindContainer.appendChild(buildDomElements());
    }
};



 