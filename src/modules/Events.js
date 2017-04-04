import Component from "./Component"

/**
 * The module editor's event manager
 * @module Events
 * @params {Object} parent Jodit main object
 */
export default class Events extends Component{
    current;
    stack = [];

    /**
     * Get current event name
     *
     * @method current
     * @example
     * parent.events.on('openDialog closeDialog', function () {
     *     if (parent.events.current() === 'closeDialog') {
     *         alert('Dialog was closed');
     *     } else {
     *         alert('Dialog was opened');
     *     }
     * });
     */
    getEventName() {
        return this.current;
    }

    /**
     * Disable all handlers specified event ( Event List ) for a given element. Either a specific event handler.
     * @method off
     * @param {object} [object] - The object which is disabled handlers
     * @param {string} [list] - List of events, separated by a space or comma , which is necessary to disable the handlers for a given object
     * @param {function} [callback] - Specific event handler to be removed
     * @return {Events} this
     * @example
     * var a = {name: "Anton"};
     * parent.events.on(a, 'open', function () {
     *     alert(this.name);
     * });
     *
     * parent.events.fire(a, 'open');
     * parent.events.off(a, 'open');
     * var b = {name: "Ivan"}, hndlr = function () {
     *  alert(this.name);
     * };
     * parent.events.on(b, 'open close', hndlr);
     * parent.events.fire(a, 'open');
     * parent.events.off(a, 'open', hndlr);
     * parent.events.fire(a, 'close');
     * parent.events.on('someGlobalEvents', function () {
     *   console.log(this); // parent
     * });
     * parent.events.fire('someGlobalEvents');
     * parent.events.off('someGlobalEvents');
     */
    off(object, list, callback) {
        if (arguments.length === 0) {
            this.parent.handlers = {};
            return this;
        }
        let i, j;
        if (typeof object === 'string') {
            callback = list;
            list = object;
            object = this.parent;
        }
        if (object.handlers === undefined) {
            return this;
        }
        let actions = list.split(/[\s,]+/);
        for (i = 0; i < actions.length; i += 1) {
            if (object.handlers[actions[i]] === undefined) {
                continue;
            }
            if (callback !== undefined) {
                for (j = 0; j < object.handlers[actions[i]].length; j += 1) {
                    if (object.handlers[actions[i]][j] === callback) {
                        object.handlers[actions[i]].splice(j, 1);
                    }
                }
            } else {
                delete object.handlers[actions[i]];
            }
        }
        return this;
    }

     /**
     * Sets the handler for the specified event ( Event List ) for a given element .
     * @method on
     * @param {object} [object] - The object for which to set an event handler
     * @param {string} list - List of events , separated by a space or comma
     * @param {function} callback - The event handler
     * @return {Jodit.Events} this
     * @example
     * // set global handler
     * parent.on('beforeSetELementValue', function (data) {
     *     data.value = jQuery.trim(data.value);
     * });
     */
    on(object, list, callback) {
        var i;
        if (typeof object === 'string') {
            callback = list;
            list = object;
            object = this.parent;
        }
        list = list.split(/[\s,]+/);
        for (i = 0; i < list.length; i += 1) {
            if (object.handlers === undefined) {
                object.handlers = {};
            }
            if (object.handlers[list[i]] === undefined) {
                object.handlers[list[i]] = [];
            }
            object.handlers[list[i]].push(callback);
        }
        return this;
    }

    /**
     * Sets the handler for the specified event (Event List) for a given element .
     * @method fire
     * @param {object|string} object - The object which is caused by certain events
     * @param {string|Array} list - List of events , separated by a space or comma
     * @param {array} [args] - Options for the event handler
     * @return {boolean} `false` if one of the handlers return `false`
     * @example
     * var dialog = new Jodit.modules.Dialog(parent);
     * parent.on(dialog, 'afterClose', function () {
     *     dialog.destroy(); // will be removed from DOM
     * });
     * dialog.open('Hello world!!!');
     */
    fire (object, list, args) {
        let i, j, result, result_value;
        if (typeof object === 'string') {
            args = list;
            list = object;
            object = this.parent;
        }
        if (object.handlers === undefined) {
            return;
        }
        list = list.split(/[\s,]+/);
        for (i = 0; i < list.length; i += 1) {
            if (object.handlers[list[i]] === undefined) {
                continue;
            }
            this.stack.push(list[i]);
            for (j = 0; j < object.handlers[list[i]].length; j += 1) {
                this.current = list[i];
                result_value = object.handlers[list[i]][j].apply(object, args || []);
                if (result_value !== undefined) {
                    result = result_value;
                }
            }
            this.stack.pop();
        }
        return result;
    }
}