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

    let tpInst = this; // handle to this TP
    // init hour and minutes to current time
    let now = new Date();
    // the currently selected hour
    let hour = options.hour ? options.hour : now.getHours();
    // the currently selected minute
    let minute = options.minute ? options.minute : now.getMinutes();

    let mainElementClass = "fgtp";
    // TODO: Add parameter for dark theme, which should add the .fgtp-dark to mainElementClass.

    // pointer to the dom element build to show the timepicker
    let domEl = null;

    // Array of hour unit dom elements
    let domHourUnits = [];
    // Array of minute unit dom elements
    let domMinuteUnits = [];


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
    // TODO: find a better way to affect all options to the instance object.
    this.onHourChange = options.onHourChange ? options.onHourChange : null;
    this.onMinuteChange = options.onMinuteChange ? options.onMinuteChange : null;
    this.onTimeChange = options.onTimeChange ? options.onTimeChange : null;
    this.onShow = options.onShow ? options.onShow : null;
    this.onHide = null;
    this.onRedraw = options.onRedraw ? options.onRedraw : null;


    // internal to keep track of visibility of the timepicker
    let visible = false;

    // === getter and setters ===
    this.getHour = function getHour() {
        return hour;
    };
    this.setHour = function setHour(newHour) {
        hour = newHour;
        highlightSelectedHour();
        if (this.onHourChange) {
            this.onHourChange.apply();
        }
        if (this.onTimeChange) {
            this.onTimeChange.apply();
        }
    };

    this.getMinute = function getMinute() {
        return minute;
    };
    this.setMinute = function setMinute(newMinute) {
        minute = newMinute;
        highlightSelectedMinute();
        if (this.onMinuteChange) {
            this.onMinuteChange.apply();
        }
        if (this.onTimeChange) {
            this.onTimeChange.apply();
        }
    };


    /**
     * function getFormattedTime
     * Return selected time displayed with localisation settings
     * TODO: implement localisation
     */

    this.getFormattedTime = function getFormattedTime() {
        return this.getHour() + ":" + this.getMinute();
    };


    /**
     * Private functions
     */

    let highlightSelectedHour = function() {
        domHourUnits.forEach((unit, hour) => {
            if (hour === tpInst.getHour()) {
                unit.classList.add('selected');
            } else {
                unit.classList.remove('selected');
            }
        });
    };

    let highlightSelectedMinute = function() {
        domMinuteUnits.forEach((unit, minute) => {
            if (minute === tpInst.getMinute()) {
                unit.classList.add('selected');
            } else {
                unit.classList.remove('selected');
            }
        });
    };
    // create element helper function
    let e = function createElement(nameTag, className, bindToParent, innerHTML) {
        let e = document.createElement(nameTag);
        if (className) {
            e.className = className;
        }
        if (bindToParent) {
            bindToParent.appendChild(e);
        }

        if (innerHTML) {
            e.innerHTML = innerHTML;
        }

        return e;
    };

    /**
     * Build the DOM for the timepicker
     * @returns HTMLElement
     */
    let buildTPDom = function buildTPDom() {

        // TODO: Cleanup - possibly it will be better to affect to domEl after the new dom is built
        domEl = e('div', mainElementClass);

        let hoursBlock = e('div', 'hours', domEl);

        let amPmList = ['am', 'pm'];

        // todo: make the h4 configurable
        e('h4', 'fgtp-title', hoursBlock, 'Hours');

        // empty dom hour unit array
        domHourUnits = [];

        for (let iAmPm = 0; iAmPm <= 1; iAmPm++) {
            let amPm = amPmList[iAmPm];
            let amPmBlock = e('div','fgtp-hr-block fgtp-ampm-block', hoursBlock); // TODO: add localisation

            e('h5', 'fgtp-ampm-title', amPmBlock, amPm.toUpperCase());

            let amUnitContainer = e('div', 'fgtp-unit-container fgtp-ampm-unit-container', amPmBlock);

            // Define first and end hour for the am/pm block
            let firstHour = iAmPm === 0 ? 0 : 12;
            let endHour = firstHour + 11;
            for (let i = firstHour; i <= endHour; i++) {
                let hourUnit = e('div', 'fgtp-hour-unit fgtp-unit', amUnitContainer, i);
                if (i === 0) {
                    hourUnit.innerText = '12'; // TODO: use 24 for 24hour display
                }
                hourUnit.onclick = function onUnitClick() {
                    tpInst.setHour(i);

                };
                // append to hourUnits array
                domHourUnits[i] = hourUnit;
            }
        }
        highlightSelectedHour();

        minutesBlock = e('div', 'minutes', domEl);
        minutesTitle = e('h4', 'fgtp-title', minutesBlock, 'Minutes');
        let minutesUnitContainer = e('div', 'fgtp-unit-container fgtp-minutes-unit-container', minutesBlock);

        // empty minute unit array
        domMinuteUnits = [];
        // TODO: find a better way to handle minutes to show, more configurable
        let firstMinute = 0;
        let endMinute = 55;
        let step = 5;
        for (let i = firstMinute; i <= endMinute; i+= step) {
            let minuteUnit = e('div', 'fgtp-minute-unit fgtp-unit', minutesUnitContainer, i.toString());
            minuteUnit.onclick = function() {
                tpInst.setMinute(i);
            };
            // append to minutesUnits array
            domMinuteUnits[i] = minuteUnit;
        }
        highlightSelectedMinute();

        return domEl;
    };



    // end of initialisation
    if (bindContainer) {
        bindContainer.appendChild(buildTPDom());
        // trigger onshow
        console.log(this.onShow);
        if (this.onShow) { this.onShow.apply(); }
    }

    return this;
};



 