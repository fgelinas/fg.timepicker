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

fg.log = fg.log || function log(log) {
    if (console) {
        console.log(log);
    }
};

fg.TPLocales = {
    'en': {
        'am': 'AM',
        'pm': 'PM',
        'hour': 'Hour',
        'minute': 'Minute',
        'close': 'Close',
        'now': 'Now',
        'unselect': 'Unselect',
    },
    'fr': {
        'am': 'AM',
        'pm': 'PM',
        'hour': 'Heure',
        'minute': 'Minute',
        'close': 'Fermer',
        'now': 'Maintenant',
        'unselect': 'Désélectionner',
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

    // pointer to the popup element for popup behavior
    let popupEl = null;
    // pointer to the dom element build to show the timepicker
    let domEl = null;

    // Array of hour unit dom elements
    let domHourUnits = [];
    // Array of minute unit dom elements
    let domMinuteUnits = [];


    /**
     * processing option settings
     * The timepicker can be one and only one of the 3 : input, button or container
     */
    // bindInput is the text box HTMLInputElement bound to the timepicker for value and popup
    let bindInput = options.bindInput ? options.bindInput : null;
    // define if the timepicker pops up automatically on focus or not
    let autoPopup = options.autoPopup ? options.autoPopup : true;
    // TODO: show the timepicker when this button is clicked
    let bindButton = options.bindButton ? options.bindButton : null;
    // show the timepicker inline in this container
    let bindContainer = options.bindContainer ? options.bindContainer : null;
    // time options 
    // timeSeparator : string that seperate hours and minutes
    let timeSeparator = options.timeSeparator ? options.timeSeparator : ":"
    // showHours
    let showHours = options.showHours ? options.showHours : true;
    // hoursStart and hoursEnd list available hours 
    let hoursStart = options.hoursStart ? options.hoursStart : 0;
    let hoursEnd = options.hoursEnd ? options.hoursEnd : 23;
    // minutesStart, minutesEnd and minutesInterval list available minutes
    let minutesStart = options.minutesStart ? options.minutesStart : 0;
    let minutesEnd = options.minutesEnd ? options.minutesEnd : 59;
    let minutesInterval = options.minutesInterval ? options.minutesInterval : 5;
    // showMinutes
    let showMinutes = options.showMinutes ? options.showMinutes : true;


    // Localisation :
    let locale = options.locale ? options.locale : 'en';


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
        hourChangedEvent();
        timeChangedEvent();
    };

    this.getMinute = function getMinute() {
        return minute;
    };
    this.setMinute = function setMinute(newMinute) {
        minute = newMinute;
        minuteChangedEvent();
        timeChangedEvent();
    };

    this.setTime = function setTime(newHour, newMinute) {
        hour = newHour;
        minute = newMinute;
        hourChangedEvent();
        minuteChangedEvent();
        timeChangedEvent();

    }

    /**
     * function getFormattedTime
     * Return selected time displayed with localisation settings
     * TODO: implement localisation
     */

    this.getFormattedTime = function getFormattedTime() {
        return this.getHour() + timeSeparator + this.getMinute();
    };

    /**
     * Parse given time string, return an object with hours and minutes.
     * This function is not string, it will find any two number seperated by a string
     * 
     * The function will use instance time configuration properties to better interpret time.
     */
    this.parseTime = function parseTime(timeVal) {
        var retVal = new Object();
        retVal.hour = -1;
        retVal.minute = -1;

        if (!timeVal)
            return retVal;


        // first search for time seperator in string
        let p = timeVal.indexOf(timeSeparator);
        // check if time separator found
        if (p != -1) {
            retVal.hour = parseInt(timeVal.substr(0, p), 10);
            retVal.minute = parseInt(timeVal.substr(p + 1), 10);
        }

        // check for hours only
        else if (showHours && !showMinutes) {
            retVal.hour = parseInt(timeVal, 10);
        }
        // check for minutes only
        else if (!showHours && showMinutes) {
            retVal.minute = parseInt(timeVal, 10);
        }
        /*
                if (showHours) {
                    var timeValUpper = timeVal.toUpperCase();
                    if ((retVal.hours < 12) && (showPeriod) && (timeValUpper.indexOf(amPmText[1].toUpperCase()) != -1)) {
                        retVal.hours += 12;
                    }
                    // fix for 12 AM
                    if ((retVal.hours == 12) && (showPeriod) && (timeValUpper.indexOf(amPmText[0].toUpperCase()) != -1)) {
                        retVal.hours = 0;
                    }
                }
        */
        return retVal;
    };

    // force redraw of the timepicker
    this.redraw = function redraw() {

        let tpDom = buildTPDom();

        if (bindInput && !bindContainer) {
            while (popupEl.firstChild) {
                //The list is LIVE so it will re-index each call
                popupEl.removeChild(popupEl.firstChild);
            }
            popupEl.appendChild(tpDom);
        }

        if (bindContainer) {
            while (bindContainer.firstChild) {
                //The list is LIVE so it will re-index each call
                bindContainer.removeChild(bindContainer.firstChild);
            }
            bindContainer.appendChild(tpDom);
        }
    }

    // hide / destroy the timepicker div element
    this.destroyPopup = function destroyPopup() {
        console.log("removing popupEl");
        popupEl.remove();
    }

    /**
     * Private functions
     */

    let hourChangedEvent = function () {
        highlightSelectedHour();
        if (tpInst.onHourChange) {
            tpInst.onHourChange.apply();
        }
    }
    let minuteChangedEvent = function () {
        highlightSelectedMinute();
        if (tpInst.onMinuteChange) {
            tpInst.onMinuteChange.apply();
        }
    }
    let timeChangedEvent = function () {
        if (tpInst.onTimeChange) {
            tpInst.onTimeChange.apply();
        }
        if (bindInput) {
            bindInput.value = tpInst.getFormattedTime();
        }
    }

    let highlightSelectedHour = function () {
        domHourUnits.forEach((unit, hour) => {
            if (hour === tpInst.getHour()) {
                unit.classList.add('selected');
            } else {
                unit.classList.remove('selected');
            }
        });
    };

    let highlightSelectedMinute = function () {
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
    this.e = e;

    let getLocale = function getLocale(text) {
        return fg.TPLocales[locale][text];
    };

    /**
     * Build the DOM for the timepicker
     * @returns HTMLElement
     */
    let buildTPDom = function buildTPDom() {

        let classes = mainElementClass;
        if (bindContainer) {
            classes += ' inline';
        } else {
            classes += ' popup';
        }
        let newDomEl = e('div', classes);

        // set style position to just below input
        if (!bindContainer) {
            let top = bindInput.offsetTop + bindInput.offsetHeight;
            let left = bindInput.offsetLeft;
            newDomEl.style.position = 'absolute';
            console.log('top : ' + top + ', left : ' + left);
            newDomEl.style.left = left + 'px';
            newDomEl.style.top = top + 'px';
        }

        // prevent popup closing when clicking inside popup
        if (!bindContainer) {
            newDomEl.addEventListener('mousedown', function (e) {
                e.preventDefault();
                return false;
            })
        }


        let hoursBlock = e('div', 'hours', newDomEl);

        let amPmList = ['am', 'pm'];

        // todo: make the h4 configurable
        e('h4', 'fgtp-title', hoursBlock, getLocale('hour'));

        // empty dom hour unit array
        domHourUnits = [];

        for (let iAmPm = 0; iAmPm <= 1; iAmPm++) {
            let amPm = amPmList[iAmPm];
            let amPmBlock = e('div', 'fgtp-hr-block fgtp-ampm-block', hoursBlock); // TODO: add localisation

            e('h5', 'fgtp-ampm-title', amPmBlock, amPm.toUpperCase());

            let amUnitContainer = e('div', 'fgtp-unit-container fgtp-ampm-unit-container', amPmBlock);

            // Define first and end hour for the am/pm block
            let firstHour = iAmPm === 0 ? 0 : 12;
            let endHour = firstHour + 11;
            for (let i = firstHour; i <= endHour; i++) {
                // check if between starts and ends 
                if (i < hoursStart || i > hoursEnd) { continue; }
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

        minutesBlock = e('div', 'minutes', newDomEl);
        minutesTitle = e('h4', 'fgtp-title', minutesBlock, 'Minutes');
        let minutesUnitContainer = e('div', 'fgtp-unit-container fgtp-minutes-unit-container', minutesBlock);

        // empty minute unit array
        domMinuteUnits = [];

        for (let i = minutesStart; i <= minutesEnd; i += minutesInterval) {
            let minuteUnit = e('div', 'fgtp-minute-unit fgtp-unit', minutesUnitContainer, i.toString());
            minuteUnit.onclick = function () {
                tpInst.setMinute(i);
            };
            // append to minutesUnits array
            domMinuteUnits[i] = minuteUnit;
        }
        highlightSelectedMinute();

        domEl = newDomEl;

        return domEl;
    };

    let inputChangeHandle = function () {

        newTime = tpInst.parseTime(bindInput.value);
        console.log('new Time : ');
        console.log(newTime);
        tpInst.setTime(newTime.hour, newTime.minute);
    };

    let inputFocusHandle = function (e) {
        console.log('bindInput got focus');
        console.log(e);
        if (bindContainer) { return; }

        // create a new element that will show as a popup 
        popupEl = tpInst.e('div', 'fgtp');

        e.target.parentNode.insertBefore(popupEl, e.target.nextSibling);
        tpInst.redraw();
    }

    let inputBlurHandle = function (e) {
        console.log('bindInput blur event');
        if (bindContainer) { return; }
        tpInst.destroyPopup();

    }

    // end of initialisation
    if (bindContainer) {
        bindContainer.appendChild(buildTPDom());
        // trigger onshow
        console.log(this.onShow);
        if (this.onShow) { this.onShow.apply(); }
    }

    if (bindInput) {
        console.log(bindInput)

        bindInput.addEventListener('change', inputChangeHandle);
        bindInput.addEventListener('focus', inputFocusHandle);
        bindInput.addEventListener('blur', inputBlurHandle);
    }

    return this;
};



