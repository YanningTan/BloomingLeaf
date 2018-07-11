//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;
var alphaOnly = /[A-Z]/;

// All valid initial value and function combination
var validPair = {
    "none": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "(no value)"],
        "defaultValue": ["none"]
    },
    "C":{
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "unknown"],
        "defaultValue": ["none"]
    },
    "R":{
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "(no value)"],
        "defaultValue": ["none"]
    },
    "I": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["denied"]
    },
    "D": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["satisfied"]
    },
    "RC": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["none"]
    },
    "CR": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["none"]
    },
    "MP": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["denied"]
    },
    "MN": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
        "defaultValue": ["satisfied"]
    },
    "SD": {
        "validInitValue": ["satisfied"],
        "defaultValue": ["satisfied"]
    },
    "DS": {
        "validInitValue": ["denied"],
        "defaultValue": ["denied"]
    }

};

/*
Note:
Updating variables and render preexisting values often uses the same functions.
Functions like updateChart, and updateCell are always called whenever changes are made
on the inspector panel.

This approach is necessary because Chart.js is built on top HTML5 Canvas. The entire
canvas needs to be redrawn every time a variable is changed.

When evaluating the functions calls of a particular action, use a top-down approach in
file naviagation. That is, the first function called is always near the top. The last
function called, will always be near the bottom.
*/

var ElementInspector = Backbone.View.extend({

    className: 'element-inspector',

    template: [
            '<label>Node name</label>',
            '<textarea class="cell-attrs-text"></textarea>',
            '<label>Initial Satisfaction Value</label>',
            '<select id="init-sat-value">',
                '<option value="(no value)"> (no value) </option>',
                '<option value=none> None (⊥, ⊥)</option>',
				'<option value=satisfied> Satisfied (FS, ⊥)</option>',
                '<option value=partiallysatisfied> Partially Satisfied (PS, ⊥) </option>',
                '<option value=denied> Denied (⊥, FD)</option>',
                '<option value=partiallydenied> Partially Denied (⊥, PD)</option>',
            '</select>',
            '<br>',
            '<div id="function-div">',
                '<label>Function Type</label>',
                '<select class="function-type">',
                    '<option value=none> No Function </option>',
                    '<option value=C> Constant </option>',
                    '<option value=R> Stochastic </option>',
                    '<option value=I> Increase </option>',
                    '<option value=D> Decrease </option>',
                    '<option value=RC> Stochastic-Constant </option>',
                    '<option value=CR> Constant-Stochastic </option>',
                    '<option value=MP> Montonic Positive </option>',
                    '<option value=MN> Montonic Negative </option>',
                    '<option value=SD> Satisfied Denied </option>',
                    '<option value=DS> Denied Satisfied </option>',
                    '<option value=UD> User Defined </option>',
                '</select>',
                '<select id="markedValue" class="function-sat-value">',
                    '<option value=satisfied> Satisfied </option>',
                    '<option value=partiallysatisfied> Partially Satisfied </option>',
                    '<option value=unknown selected> Random/Stochastic </option>',
                    '<option value=partiallydenied> Partially Denied </option>',
                    '<option value=denied> Denied </option>',
                '</select>',
                '<div id="user-constraints">',
                    '<div id="all-user-constraints">',
                        '<div id="new-user-constraints">',
                            '<select class="user-function-type user-defined-select">',
                                '<option value=C> Constant </option>',
                                '<option value=R> Stochastic </option>',
                                '<option value=I> Increase </option>',
                                '<option value=D> Decrease </option>',
                            '</select>',
                            '<select class="user-sat-value user-defined-select">',
                                '<option value=none selected> None (T, T) </option>',
                                '<option value=satisfied> Satisfied (FS, T) </option>',
                                '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>',
                                '<option value=partiallydenied> Partially Denied (T, PD)</option>',
                                '<option value=denied> Denied (T, FD)</option>',
                                '<option value=unknown> Unknown </option>',
                            '</select>',
                        '</div>',
                    '</div>',
                    '<br>',
                    // Error message is controlled dynamically
                    '<label id="repeat-error"></label>',
                    '<select id="repeat-begin" class="repeat-select">',
                        '<option class="select-placeholder" selected disabled value="">Begin</option>',
                    '</select>',
                    '<select id="repeat-end" class="repeat-select">',
                        '<option class="select-placeholder" selected disabled value="">End</option>',
                    '</select>',
                    '<label style="float:left; font-size:0.8em;" id="repeat-begin2" class="repeat-select2">Repeat counts</label>',
                    '<input style="float:right;"class="repeat-select2" id="repeat-end2" type="number" value="2">',
                    '<label style="float:left; font-size:0.8em;" id="repeat-begin3" class="repeat-select3">Absolute Length</label>',
                    '<input style="float:right;"class="repeat-select3" id="repeat-end3" type="number" value="0">',
                    '<p id="noteRepeat" style="text-align:left; float:left; color:red; font-size:0.7em;">Note: Leave Absolute Length as 0 for unknown length. If Absolute Length is less than 0 or Repeat Count is less than 2, they will be set to 0 or 2 respectively.</p>',
            // change to blue or change color to green
                    '<button style="margin-top:10px;" id="constraint-add" class="inspector-btn small-btn green-btn">Add</button>',
                    '<button id="constraint-repeat" class="inspector-btn small-btn blue-btn">Set Repeats</button>',
                    '<button id="constraint-restart" class="inspector-btn small-btn red-btn">Clear</button>',
                '</div>',
            '</div>',
            '<br>',
            '<canvas id="chart" width="240" height="240"></canvas>',

    ].join(''),

    events: {
        'change #init-sat-value':'initSatValueChanged',

        'change .function-type':'funcTypeChanged',
        'change .function-sat-value':'funcSatValChanged',

        'change .user-function-type':'userFuncTypeChanged',
        'change .user-sat-value':'userSatValChanged',
        'change .repeat-select':'selectRepeatValues',
        'change .repeat-select2':'selectNumRepeatValues',
        'change .repeat-select3':'selectAbsoluteLength',

        'click #constraint-add': 'addConstraint',
        'click #constraint-repeat': 'repeatConstraintControl',
        'click #constraint-restart': 'removeUserConstraints',
        'keyup .cell-attrs-text': 'nameAction'
    },
 
    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function(cell) {

        this.cell = cell; // Save the clicked node's backbone model

        // Save the UserIntention object from the global model variable to 
        // this.intention
        this.intention = model.getUserIntentionByID(this.cell.attributes.nodeID);

        this.$el.html(_.template(this.template)());

        // Attributes
        this.chartObject = new chartObject();
        this.constraintsObject = new constraintsObject();

        // Genernate all available selection options based on selected function type
        this.satValueOptions = this.initializeSatValueOptions();

        // Save html template to dynamically render more
        this.userConstraintsHTML = $("#new-user-constraints").last().clone();

        // Load initial value and node name
        this.$('.cell-attrs-text').val(this.intention.nodeName);
        this.$('#init-sat-value').val(satisfactionValuesDict[this.intention.getInitialSatValue()].name);
        this.checkInitialSatValue();

        if (!cell.attr(".satvalue/value") && cell.attr(".funcvalue/text") != "NB"){
            cell.attr(".satvalue/value", 'none');
            cell.attr(".funcvalue/text", ' ');
        }

        // Turn off repeating by default
        this.repeatOptionsDisplay = false;
        // TODO what does this do?
        this.setRepeatConstraintMode("TurnOff");

        // Load initial value for function type in the html select element
        var functionType = cell.attr('.funcvalue/text');
        if ((functionType == '') || (functionType == ' ') || (functionType == 'NB')) {
            this.$('.function-type').val('none');
            this.updateHTML(null);
        } else if (functionType != 'UD') {
            this.$('.function-type').val(functionType);
            this.updateHTML(null);
        } else {
            // loading user defined constraint
            this.$('.function-type').val(functionType);
            this.renderUserDefined(cell);
        }

    },

    /**
     * Checks the initial satisfaction value for a (no value).
     * If the initial satisfaction value is (no value), then set the
     * availible function options to be No Function, Stochastic and UserDefined
     * If not, set the function options so that all options are availible
     */
    checkInitialSatValue() {
        if (this.intention.getInitialSatValue() == '(no value)') {
            // remove current options, add 3 options
            this.$('.function-type').empty();
            this.$('.function-type').append('<option value=none> No Function </option>');
            this.$('.function-type').append('<option value=R> Stochastic </option>');
            this.$('.function-type').append('<option value=UD> User Defined </option>');
        } else {
            this.$('.function-type').empty();
            this.$('.function-type').append('<option value=none> No Function </option>');
            this.$('.function-type').append('<option value=C> Constant </option>');
            this.$('.function-type').append('<option value=R> Stochastic </option>');
            this.$('.function-type').append('<option value=I> Increase </option>');
            this.$('.function-type').append('<option value=D> Decrease </option>');
            this.$('.function-type').append('<option value=RC> Stochastic-Constant </option>');
            this.$('.function-type').append('<option value=CR> Constant-Stochastic </option>');
            this.$('.function-type').append('<option value=MP> Montonic Positive </option>');
            this.$('.function-type').append('<option value=MN> Montonic Negative </option>');
            this.$('.function-type').append('<option value=SD> Satisfied Denied </option>');
            this.$('.function-type').append('<option value=DS> Denied Satisfied </option>');
            this.$('.function-type').append('<option value=UD> User Defined </option>');
        }
    },

    nameAction: function(event) {
      if (event.which === ENTER_KEY) {
          event.preventDefault();
      }

      var text = this.$('.cell-attrs-text').val();

      text = text.replace(/[^\w\n-]/g, ' ');

      this.cell.attr({'.name': {text: text} });
      this.intention.nodeName = text;
    },

    /**
     * Returns an object used for providing option tags for valid satisfaction values for
     * functions.
     *
     * @returns {Object}
     */
    initializeSatValueOptions: function() {
        var satValueOptions = {};

        var none = '<option value=none selected> None (T, T) </option>';
        var satisfied = '<option value=satisfied> Satisfied (FS, T) </option>';
        var partiallysatisfied = '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>';
        var partiallydenied = '<option value=partiallydenied> Partially Denied (T, PD) </option>';
        var denied = '<option value=denied> Denied (T, FD) </option>';
        var unknown = '<option value=unknown> Unknown </option>';
        satValueOptions.all = none + satisfied + partiallysatisfied + partiallydenied + denied + unknown;
        satValueOptions.noRandom = satisfied + partiallysatisfied + partiallydenied + denied;

        /**TODO
         * Returns
         */
        satValueOptions.positiveOnly = function(currentVal){
            currentVal = satvalues[currentVal];
            result = '';
            for (var i = currentVal; i <= satvalues['satisfied']; i++){
                // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
                var text = satvalues[i];
                result += eval(text);
            }
            return result;
        };

        /**TODO
         * Returns
         */
        satValueOptions.negativeOnly = function(currentVal){
            currentVal = satvalues[currentVal];
            result = '';
            for (var i = currentVal; i >= satvalues['denied']; i--){
                // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
                var text = satvalues[i];
                result += eval(text);
            }
            return result;
        };

        return satValueOptions;
    },


    /**
     * Initializes components to display user defined functions
     */
    renderUserDefined: function(cell){
        this.$('#markedValue').hide();

        // Get arrays representing the individual functions (C, R, I, D)
        // and the corresponding satisfaction values
        this.constraintsObject.userFunctions = cell.attr(".constraints/function");
        this.constraintsObject.userValues = cell.attr(".constraints/lastval");

        // Load the user defined constraints
        var index = cell.attr(".constraints/lastval").length - 1;
        if (index == 0) {
            $(".user-sat-value").last().val(this.constraintsObject.userValues[index]);
            $(".user-function-type").last().val(this.constraintsObject.userFunctions[index]);
        } else {
            for (var i = 0; i < index; i++) {
                var prevLetter = this.constraintsObject.endLetter[this.constraintsObject.endLetter.length - 1];
                this.constraintsObject.beginLetter.push(prevLetter);
                this.constraintsObject.endLetter.push(String.fromCharCode(prevLetter.charCodeAt(0) + 1));

                this.addConstraint(null);
            }
            $(".user-sat-value").last().val(this.constraintsObject.userValues[i]);
            $(".user-function-type").last().val(this.constraintsObject.userFunctions[i]);
        }

        // Render repeat if set repeat button is clicked
        var repeatBegin = cell.attr(".constraints/beginRepeat");
        var repeatEnd = cell.attr(".constraints/endRepeat");
        var repeatCount = cell.attr(".constraints/repeatCount");
        var absLen = cell.attr(".constraints/absoluteLen");

        if (repeatBegin && repeatEnd) {
            this.repeatOptionsDisplay = true;
            this.constraintsObject.repeatBegin = repeatBegin;
            this.constraintsObject.repeatEnd = repeatEnd;
            if (repeatCount) {
                this.constraintsObject.repeat_count = repeatCount;
            }

            if (absLen) {
                this.constraintsObject.absoluteLength = absLen;
            }

            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");
            $("#repeat-begin").val(repeatBegin);
            $("#repeat-end").val(repeatEnd);
            $("#repeat-end2").val(repeatCount);
            $("#repeat-end3").val(absLen);
        }

        this.updateChartUserDefined(null);
    },

    /**
     * Saves the initial satisfaction value into the IntentionEvaluation
     * corresponding to this intention.
     *
     * This function is called on change for #init-sat-value,
     */
    initSatValueChanged: function(event) {
        var initValue = this.$('#init-sat-value').val();
        this.intention.changeInitialSatValue(satValueDict[initValue]);
        this.checkInitialSatValue();
        this.updateHTML(event);
    },

    /**
     * Clears all FuncSegments for this intention's UserIntention object's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     *
     * This function is called on change for .function-type.
     */
    funcTypeChanged: function(event) {
        var funcType = this.$('.function-type').val();
        console.log(funcType);
        this.intention.setEvolvingFunction(funcType);
        this.updateHTML(event);
    },

    /**
     * Updates the FuncSegment for this intention's UserIntention object's
     * with the correct marked value and function type
     * This function is called on change for .user-function-type
     */
    userFuncTypeChanged: function(event) {
        var funcType = this.$('.user-function-type').last().val();
        this.intention.setUserDefinedSegment(funcType);
        this.updateHTML(event);
    },

    /**
     * This function is called on change for .user-sat-value
     */
    userSatValChanged: function(event) {
        var satVal = satValueDict[this.$('.user-sat-value').last().val()];
        this.intention.updateLastFuncSegSatVal(satVal);
        this.updateChartUserDefined(event);
    },

    /**
     * //TODO: Sets the marked value
     */
    funcSatValChanged: function(event) {
        var satValue = satValueDict[this.$('#markedValue').val()]; // 4 digit representation
        this.intention.setMarkedValueToFunction(satValue);

        this.updateChart(event);
    },

    /**
     * Updates the possible satisfaction values and buttons selections based on current
     * function type.
     *
     * This function is called on change for .user-function-type
     */
    updateHTML: function(event) {

        // Check if selected init sat value and functionType pair is illegal
        this.validityCheck(event);

        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();

        // All functions that have satisfaction valuen associated with it
        var funcWithSatValue = ["I", "D", "RC", "MP", "MN", "UD"];

        // Disable init value menu if functype is NB
        if (this.cell.attr('.funcvalue/text') == "NB") {
            $('#init-sat-value').prop('disabled', true);
        }

        if (functionType == 'UD') {
            // User defined function
            this.$('#markedValue').hide();
            this.$('#user-constraints').show("fast");
            this.addUDFunctionValues(null);
        } else {
            this.$('#user-constraints').hide();
            $('#init-sat-value').prop('disabled', false);

            if ($.inArray(functionType, funcWithSatValue) > -1) {
                // Function with an associated satisfaction value
                delete this.cell.attr(".constraints/markedvalue");
                this.displayFunctionSatValue(null);
            } else {
                // Function without an associated satisfaction value
                this.$('#markedValue').hide();
            }
        }
        this.updateChart(null);
    },

    /**
     * Checks the validity of the initial satisfaction value function type
     * pair. If illegal, this function changes either the initial satisfaction
     * value or the function type accordingly.
     */
    validityCheck: function(event) {
        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();

        // If an element gets clicked, don't bother checking
        if (event == null) {
            return;
        }

        // Check what triggered the validty check
        // Either init value changed, func type changed or simply an element gets clicked
        var initValueChanged = event.target.id == 'init-sat-value';
        var funcTypeChanged = event.target.className == 'function-type';

        // Perform check
        // If not UD, just do a regular check
        if (functionType != "UD") {
            // If not valid, 2 possible actions:
            // change to default init value if functTypeChanged
            // change to none function if initValueChanged
            if ($.inArray(initValue, validPair[functionType]['validInitValue']) == -1) {
                if (initValueChanged && initValue != "unknown"){this.$('.function-type').val('none');}
                if (initValueChanged && initValue == "unknown"){this.$('.function-type').val('C');}
                var newValue = validPair[functionType]['defaultValue'];
                if (funcTypeChanged){this.$('#init-sat-value').val(newValue);}

            }
        }
    },

    /**
     * Displays the select element (#function-type) for the function type for the current cell.
     * If the function type has an associated satisfaction value, displays another
     * select element (#markedValue) for the associated satisfaction value.
     */
    displayFunctionSatValue: function(event) {
        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();
        this.$('#markedValue').show("fast");
        switch (functionType) {
            case "RC":
                this.$('#markedValue').html(this.satValueOptions.noRandom);
                var markedValue = this.cell.attributes.attrs['.constraints'].markedvalue;
                if(markedValue){
                    value = satvalues[markedValue];
                    this.$('#markedValue').val(value);
                }
                break;
            case "I":
            case "MP":
                this.$('#markedValue').html(this.satValueOptions.positiveOnly(initValue));
                var markedValue = this.cell.attributes.attrs['.constraints'].markedvalue;
                if(markedValue) {
                    value = satvalues[markedValue];
                    this.$('#markedValue').val(value);
                }
                break;
            case "D":
            case "MN":
                this.$('#markedValue').html(this.satValueOptions.negativeOnly(initValue));
                var markedValue = this.cell.attributes.attrs['.constraints'].markedvalue;
                if(markedValue){
                    value = satvalues[markedValue];
                    this.$('#markedValue').val(value);
                }
                break;
            default:
                break;
        }
        return;
    },

    /**
     * Adds appropriate satisfaction values option tags 
     * for .user-sat-value, which is the select tag used to 
     * indicate satisfaction values when creating a user defined function.
     */
    addUDFunctionValues: function(event) {
        var func = $(".user-function-type").last().val();
        var index = this.constraintsObject.currentUserIndex;

        // If initially disabled, enable it for now
        if ($('.user-sat-value').last().prop('disabled')) {
            $('.user-sat-value').last().prop('disabled', false);
            $('.user-sat-value').last().css('background-color','');
        }

        // Load available satisfaction values for user defined constraint type
        switch (func) {
            case "I":
                // May get last value of the graph in the future
                $(".user-sat-value").last().html(this.satValueOptions.positiveOnly('partiallysatisfied'));
                $(".user-sat-value").last().val("satisfied");

                break;

            case "D":
                $(".user-sat-value").last().html(this.satValueOptions.negativeOnly('partiallydenied'));
                $(".user-sat-value").last().val("denied");
                break;

            case "R":
                $(".user-sat-value").last().html(this.satValueOptions.all);
                $(".user-sat-value").last().val("unknown")
                $(".user-sat-value").last().prop('disabled', true);
                $(".user-sat-value").last().css("background-color",'grey');
                break;

            case "C":
                $(".user-sat-value").last().html(this.satValueOptions.all);
                // Restrict input if it is the first constraint
                if (index == 0) {
                    $(".user-sat-value").last().val(this.$('#init-sat-value').val())
                    $(".user-sat-value").last().prop('disabled', true);
                    $(".user-sat-value").last().css("background-color","grey");
                }
                break;
            default:
                break;
        }
        return;
    },

    /**
     * Modifies the passed in datasets with their default values
     * @param {Array.<Object>}
     */
    resetChartDatasets: function(datasets) {

        for (var i = 0; i < datasets.length; i++) {
            datasets[i].borderDash = [];
            datasets[i].data = [];
            datasets[i].pointBackgroundColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];
            datasets[i].pointBorderColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];
            datasets[i].borderColor = "rgba(220,220,220,1)";
        }
    },

    /**
     * Updates the chart to represent data related to the the current function and 
     * satisfaction value(s)
     */
    updateChart: function(event) {
        var functionType = this.$('.function-type').val();
        var initVal = satvalues[this.$('#init-sat-value').val()];
        var satVal = satvalues[this.$('#markedValue').val()];

        if (this.cell.attributes.attrs['.constraints']) {
            this.cell.attributes.attrs['.constraints'].markedvalue = satVal;
        }

        // Rerender chart canvas
        var data = this.chartObject.chartData;

        // Get the chart canvas
        var context = $("#chart").get(0).getContext("2d");

        // Reset datasets
        this.resetChartDatasets(data.datasets);

        // Destroy the previous chart if exists
        if (this.chartObject.chart != null) {
            this.chartObject.chart.destroy();
        }

        // If there is a preexisting user-defined function, clear it
        if ((functionType != "UD") && (this.constraintsObject.currentUserIndex > 0)) {
            this.removeUserConstraints(null);
        }

        // Render preview for user defined function types
        if (functionType == "UD") {
            this.updateChartUserDefined(null);
            return;
        }


        // Change chart dataset(s), depending on the function type
        if (functionType == "R") {
            data.labels = ["0", "Infinity"];
            data.datasets[0].data = [initVal, initVal];
            data.datasets[0].borderDash = [5, 5];
            data.datasets[0].pointBackgroundColor[1] = "rgba(220,220,220,0)";
            data.datasets[0].pointBorderColor[1] = "rgba(220,220,220,0)";

        } else if (functionType == "C") {
            data.labels = ["0", "Infinity"];
            // If not unknown, just display one line
            if (initVal != satvalues["unknown"]) {
                data.datasets[0].data = [initVal, initVal];
            } else {
                // If it is, then display 5 dotted lines
                var value_to_add = -2;
                for (var i = 0; i < 5; i++) {
                    data.datasets[i].data = [value_to_add, value_to_add];
                    data.datasets[i].borderDash = [5, 5];
                    data.datasets[i].pointBackgroundColor[1] = "rgba(220,220,220,0)";
                    data.datasets[i].pointBorderColor[1] = "rgba(220,220,220,0)";
                    value_to_add ++;
                }
            }

        } else if ((functionType == "I") || (functionType == "D")) {
            data.labels = ["0", "Infinity"];
            data.datasets[0].data = [initVal, satVal];

        } else if (functionType == "RC") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [initVal, initVal];
            data.datasets[0].borderDash = [5, 5];
            data.datasets[0].pointBackgroundColor[1] = "rgba(220,220,220,0)";
            data.datasets[0].pointBorderColor[1] = "rgba(220,220,220,0)";
            data.datasets[1].data = [null, satVal, satVal];

        } else if (functionType == "CR") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [initVal, initVal, null];
            data.datasets[1].data = [null, initVal, initVal];
            data.datasets[1].borderDash = [5, 5];
            data.datasets[1].pointBackgroundColor[2] = "rgba(220,220,220,0)";
            data.datasets[1].pointBorderColor[2] = "rgba(220,220,220,0)";

        } else if (functionType == "SD") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [2, 2, null];
            data.datasets[1].data = [null, -2, -2];

        } else if (functionType == "DS") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [-2, -2, null];
            data.datasets[1].data = [null, 2, 2];

        } else if (functionType == "MP") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [initVal, satVal, satVal];

        } else if (functionType == "MN") {
            data.labels = ["0", "A", "Infinity"];
            data.datasets[0].data = [initVal, satVal, satVal];

        } else {
            data.labels = ["0", "Infinity"];
            // Display one dot
            data.datasets[0].data = [initVal];
        }

        // Display the chart
        this.chartObject.chart = new Chart(context, {
            type: 'line',
            data: data,
            options: this.chartObject.chartOptions
        });

        this.updateCell(null);
    },

    /**
     * Updates the chart to represent data related to the the current user 
     * defined function and satisfaction value(s)
     */
    updateChartUserDefined: function(event) {
        var context = $("#chart").get(0).getContext("2d");
        var func = $(".user-function-type").last().val();
        var index = this.constraintsObject.currentUserIndex;

        // If unknown is selected
        if ($(".user-sat-value").last().val() == 'unknown') {
            $(".user-sat-value").last().prop('disabled', 'disabled');
            $(".user-sat-value").last().css("background-color","grey");
        } else {
            $(".user-function-type").last().prop('disabled', '');
            $(".user-function-type").last().css("background-color",'');
        }

        // Save values in user defined functions
        this.constraintsObject.userFunctions[index] = func;
        this.constraintsObject.userValues[index] = $(".user-sat-value").last().val();

        // Clone chart template
        var data = this.chartObject.chartData;

        // Setting up the labels
        data.labels = this.constraintsObject.beginLetter.slice(0);
        data.labels.push(this.constraintsObject.endLetter[this.constraintsObject.endLetter.length - 1]);

        // Setting repeating variables
        var repeat = this.repeatOptionsDisplay;
        var repeatBegin = this.constraintsObject.repeatBegin;
        var repeatEnd = this.constraintsObject.repeatEnd;

        // Reset chart datasets
        this.resetChartDatasets(data.datasets);

        // Add datapoints to graph for each userfunction/uservalue pair
        var previousDatasetIndex = -1;
        var currentDatasetIndex = 0;

        for (var i = 0; i < this.constraintsObject.userFunctions.length; i++) {
            if (currentDatasetIndex >= data.datasets.length) {
                data.datasets.push({
                    label: "Source",
                    fill: false,
                    borderColor: "rgba(220,220,220,1)",
                    pointRadius: 4,
                    lineTension: 0,
                    data: []
                });
            }

            var previousDataset = data.datasets[previousDatasetIndex];
            var currentDataset = data.datasets[currentDatasetIndex];
            var currentFunc = this.constraintsObject.userFunctions[i];
            var previousFunc = this.constraintsObject.userFunctions[i - 1];
            var currentVal = this.constraintsObject.userValues[i]; // satisfaction value associated with current function type
            var currentNumVal = currentVal == "unknown" ? 0 : satvalues[currentVal];
            var previousVal = this.constraintsObject.userValues[i - 1];

            // First we need to find out how many nulls do we need
            // Nulls are needed to translate the line to the right
            var numNulls = []
            if (currentDatasetIndex != 0) {
                for (var j = 0; j < previousDataset.data.length - 1; j++) {
                    numNulls.push(null);
                }
            }

            // Add datapoint to dataset according to which function
            if (currentFunc == 'I' || currentFunc == 'D') {
                // If previous function is stochastic, set the starting point to be either FD or FS
                if ((previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')) && currentFunc == 'I') {
                    firstVal = satvalues['denied'];
                } else if ((previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')) && currentFunc == 'D') {
                    firstVal = satvalues['satisfied'];
                } else if (currentDatasetIndex != 0){
                    // Use the last value of the previous dataset as the current dataset's first value
                    firstVal = previousDataset.data[previousDataset.data.length - 1];
                } else {
                    firstVal = satvalues[this.$('#init-sat-value').val()];
                }

                currentDataset.data = numNulls.concat([firstVal, currentNumVal]);

            } else if (currentFunc == 'C') {
                if (currentVal != 'unknown') {
                    currentDataset.data = numNulls.concat([currentNumVal, currentNumVal]);
                } else {
                    // it is unknown

                    // Then we need 4 datasets in addition to the currentDataset
                    // And we add datapoints into each dataset starting from FD
                    var value_to_add = -2;
                    for (var k = currentDatasetIndex; k < currentDatasetIndex + 5; k ++) {
                        // Make sure we have enough dataset availabe. If not add some
                        if (k >= data.datasets.length) {
                            data.datasets.push({
                                label: "Source",
                                fill: false,
                                borderColor: "rgba(220,220,220,1)",
                                pointRadius: 4,
                                lineTension: 0,
                                data: []
                            });
                        }
                        currentSubset = data.datasets[k];
                        currentSubset.data = numNulls.concat([value_to_add, value_to_add]);

                        // Update the style
                        currentSubset.borderDash = [5, 5]
                        currentSubset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
                        currentSubset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
                        if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentSubset.data)) {
                            currentSubset.borderColor = "rgba(255, 110, 80, 1)";
                        }
                        value_to_add ++;
                    }
                }

            } else if (currentFunc == 'R') {
                 currentDataset.data = numNulls.concat([currentNumVal, currentNumVal]);
            }


            // Update the style of current dataset and advance indices
            // I, D and non unknown C function share the same style
            if (currentFunc == 'C' && this.constraintsObject.userValues[i] == 'unknown') {
                previousDatasetIndex += 5;
                currentDatasetIndex += 5;
            } else if (currentFunc == 'R') {
                currentDataset.borderDash = [5, 5]
                currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
                currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
                if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentDataset.data)) {
                    currentDataset.borderColor = "rgba(255, 110, 80, 1)";
                }
                previousDatasetIndex ++;
                currentDatasetIndex ++;
            } else {
                // If previous function is stochastic, or constant unknown, hide the first dot
                if (previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')) {
                    currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,0)", "rgba(220,220,220,1)"])
                    currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,0)", "rgba(220,220,220,1)"]);
                }
                // Else, both points should be solid
                else {
                    currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,1)"])
                    currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,1)"]);
                }
                // If currentDataset is in repeat range, set red
                if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentDataset.data)){
                    currentDataset.borderColor = "rgba(255, 110, 80, 1)";
                }
                previousDatasetIndex ++;
                currentDatasetIndex ++;

            }

        }


        this.chartObject.chart = new Chart(context, {
            type: 'line',
            data: data,
            options: this.chartObject.chartOptions
        });

        this.updateCell(null);
    },

    /**
     * Returns true iff the data array contains points that are 
     * within the repeat range which the user has set
     *
     * @param {Boolean} repeat 
     *   true if the user has set repeats
     * @param {String} repeatBegin
     *   represents beginning index of the repeat range
     * @param {String} repeatEnd
     *   represents the end index of the repeat range
     * @param {Array.<Number | null>} data
     *   represents data points for the chart
     */
    inRepeatRange: function(repeat, repeatBegin, repeatEnd, data) {
        // If the repeat mode isnt on, return false
        if (!repeat || repeatBegin === undefined || repeatBegin === null || repeatEnd === undefined || repeatEnd === null) {
            return false;
        } else {
            // Convert letter to index
            var repeatBegin = repeatBegin == '0'? 0 : repeatBegin.charCodeAt(0) - 65 + 1;
            var repeatEnd = repeatEnd.charCodeAt(0) - 65 + 1;
            // Find the index of start point and end point of data
            var dataBegin = data.length - 2;
            var dataEnd = data.length - 1;
            if (dataBegin >= repeatBegin && dataEnd <= repeatEnd) {
                return true;
            }
        }
        return false;
    },

    /**
     * Adds new constraint for the user defined function.
     * This function is called on click for #constraint-add.
     * This function is also called when loading user defined 
     * constraints from previously stored.
     */
    addConstraint: function(event) {

        // update html display for additional user inputs
        var html = this.userConstraintsHTML.clone();
        var i = this.constraintsObject.currentUserIndex;

        if (event == null) {
            $(".user-sat-value").last().val(this.constraintsObject.userValues[i]);
            $(".user-function-type").last().val(this.constraintsObject.userFunctions[i]);
        } else {
            this.intention.addUserDefinedSeg("C", "0000");
        }

        $(".user-sat-value").last().prop('disabled', true);
        $(".user-sat-value").last().css("background-color",'grey');
        $(".user-function-type").last().prop('disabled', true);
        $(".user-function-type").last().css("background-color", 'grey');

        html.appendTo(this.$('#all-user-constraints'));
        this.constraintsObject.currentUserIndex += 1;

        // generate graph only if constraints are manually added
        if (event && event.target.id == 'constraint-add') {
            var prevLetter = this.constraintsObject.endLetter[this.constraintsObject.currentUserIndex - 1];
            this.constraintsObject.beginLetter.push(prevLetter);
            this.constraintsObject.endLetter.push(String.fromCharCode(prevLetter.charCodeAt(0) + 1));

            if (this.repeatOptionsDisplay) {
                this.setRepeatConstraintMode("Update");
                this.constraintsObject.repeatBegin = null;
                this.constraintsObject.repeatEnd = null;
            }

            this.updateChartUserDefined(null);
        }
    },

    
    /**
     * Toggles the display for the user defined function's 
     * repeat feature.
     * This function is called on click for #constraint-repeat.
     */
    repeatConstraintControl: function(e){
        if (!this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");
        }else if (this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOff");
            this.intention.dynamicFunction.removeRepFuncSegments();
            this.constraintsObject.repeatBegin = null;
            this.constraintsObject.repeatEnd = null;
            this.constraintsObject.repeat_count = null;
            this.constraintsObject.absoluteLength = null;
            this.updateChartUserDefined(null);
        }
    },

    /**
     * Handles the changes done for the select elements for the 
     * repeat feature for user defined functions, by ensuring that
     * the begin and end range of repeated constraints are valid.
     * This function is called on change for .repeat-select 
     * (the select elements for repeat begin and end)
     */
    selectRepeatValues: function(event){
        var begin = $("#repeat-begin").val();
        var end = $("#repeat-end").val();

        if (begin === null || end === null) {
            return;
        }

        var nextChar = String.fromCharCode(begin.charCodeAt(0) + 1);

        if (begin >= end) {
            $("#repeat-error").text("Repeated range must be chronological");
            $("#repeat-error").show("fast");
            this.constraintsObject.repeatBegin = null;
            this.constraintsObject.repeatEnd = null;

        } else if (nextChar == end) {
            $("#repeat-error").text("Repeated range must be at least two apart");
            $("#repeat-error").show("fast");
            this.constraintsObject.repeatBegin = null;
            this.constraintsObject.repeatEnd = null;

        } else {

            $("#repeat-error").hide();
            this.intention.dynamicFunction.setRepeatingFunction(begin, end);
            this.constraintsObject.repeatBegin = begin;
            this.constraintsObject.repeatEnd = end;
        }
        this.updateChartUserDefined(null);

    },

    /**
     * Ensures that the number of repeat counts is a valid number,
     * updates the constraintsObject with the new repeat count and
     * updates the chart in case there are constraint lines that need 
     * to be coloured red.
     *
     * This function is called on change for #repeat-end2.
     */
    selectNumRepeatValues: function(event){
        var repVal = $("#repeat-end2").val();
        if (repVal < 2) {
            $('#repeat-end2').val(2);
        } 
        this.intention.dynamicFunction.setRepNum(repVal);
        this.constraintsObject.repeat_count = repVal;
        this.updateChartUserDefined(null);
    },

    /**
     * Ensures that the absolute length is a non negative number and
     * updates the constraintsObject to have the new absolute length.
     *
     * This function is called on change for #repeat-end3.
     */
    selectAbsoluteLength: function(event){
        var absLength = $("#repeat-end3").val();
        if (absLength < 0) {
            $('#repeat-end3').val(0);
        }
        this.intention.dynamicFunction.setAbsoluteTime(absLength);
        this.constraintsObject.absoluteLength = absLength;
        this.updateChartUserDefined(null);
    },

    /**
     * Sets the mode for the user defined function's repeat feature.
     * Depending on the mode, this function controls the display
     * for repeat related elements and values.
     * 
     * @param {String} mode
     */
    setRepeatConstraintMode: function(mode) {

        // Reset options for select everytime repeat is clicked
        $("#repeat-begin").html('<option class="select-placeholder" selected disabled value="">Begin</option>');
        $("#repeat-end").html('<option class="select-placeholder" selected disabled value="">End</option>');

        // Turn on all repeat related display and values
        if (mode == "TurnOn") {
            $("#repeat-begin").show("fast");
            $("#repeat-end").show("fast");
            $("#repeat-begin2").show("fast");
            $("#repeat-end2").show("fast");
            $("#repeat-begin3").show("fast");
            $("#repeat-end3").show("fast");
            $("#noteRepeat").show("fast");
            $("#constraint-repeat").text("Clear Repeats");
            this.repeatOptionsDisplay = true;

        // Turn off all repeat related display and values
        } else if (mode == "TurnOff") {
            $("#repeat-begin").hide();
            $("#repeat-end").hide();
            $("#constraint-repeat").text("Set Repeats");
            $("#repeat-error").hide();
            $("#repeat-begin2").hide();
            $("#repeat-end2").hide();
            $("#repeat-begin3").hide();
            $("#repeat-end3").hide();
            $("#noteRepeat").hide();
            this.repeatOptionsDisplay = false;

        // Update all repeat related display and values
        } else if (mode == "Update") {

            // Cannot repeat with only one constraint
            if (this.constraintsObject.currentUserIndex == 0) {

                $("#repeat-error").text("More constraints are needed");

                $("#repeat-error").show("fast");
                $("#repeat-begin").prop('disabled', 'disabled');
                $("#repeat-begin").css("background-color","grey");
                $("#repeat-end").prop('disabled', 'disabled');
                $("#repeat-end").css("background-color","grey");

            // Update HTML
            } else {

                if ($("#repeat-begin").prop('disabled')) {
                    $("#repeat-error").hide();
                    $("#repeat-begin").prop('disabled', '');
                    $("#repeat-begin").css("background-color","");
                    $("#repeat-end").prop('disabled', '');
                    $("#repeat-end").css("background-color","");
                }

                // Set select options
                for (var i = 0; i < this.constraintsObject.currentUserIndex; i++) {
                    var beginVal = this.constraintsObject.beginLetter[i];
                    var endVal = this.constraintsObject.endLetter[i + 1];
                    $("#repeat-begin").append(
                        $('<option></option>').val(beginVal).html(beginVal)
                    );
                    $("#repeat-end").append(
                        $('<option></option>').val(endVal).html(endVal)
                    );
                }
                var repeatCounter = this.constraintsObject.repeat_count;
                var absLength = this.constraintsObject.absoluteLength;
                $("repeat-end2").val(this.constraintsObject.repeat_count);
                $("repeat-end3").val(this.constraintsObject.absoluteLength);
            }
        }
    },

    // Reset user-define chart to default
    /**
     * Removes all user constraints for user defined functions
     * This function is called on click for #constraint-restart (red Clear button).
     */
    removeUserConstraints: function(e){
        $('#init-sat-value').prop('disabled', '');
        $('#init-sat-value').css("background-color","");

        this.constraintsObject.repeat_count = $("repeat-end2").val();
        this.constraintsObject.absoluteLength = $("repeat-end3").val();
        this.constraintsObject.beginLetter = ["0"];
        this.constraintsObject.endLetter = ["A"];
        this.constraintsObject.currentUserIndex = 0;
        this.constraintsObject.userFunctions = ["C"];
        this.constraintsObject.userValues = [$('#init-sat-value').val()];
        var html = this.userConstraintsHTML.clone();
        this.$('#all-user-constraints').html('');
        html.appendTo(this.$('#all-user-constraints'));

        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("TurnOff");
        }

        this.funcTypeChanged(null);
    },

    /**
     * Makes corresponding changes for the cell attributes, according to the values in the 
     * inspector. This function is always called alongside with updateChart
     * and updateChartUserDefined. 
     */
    updateCell: function(event) {
        
        // Set data related to functions
        this.setCellFunctionData();

        // Set data related to satisfaction values
        this.setCellSatData();
    },

    /**
     * Sets the function data on the inspector to the cell's attributes.
     */
    setCellFunctionData: function() {

        var funcType = this.$('.function-type').val();

        if (funcType != 'none' && this.cell.attr(".funcvalue/text") != 'NB') {
            this.cell.attr(".funcvalue/text", funcType);
        } else {
            this.cell.attr(".funcvalue/text", '');
        }

        // Update constraint attributes for the cell
        if (funcType == 'UD') {
            this.setUserDefinedCellFunctionData();
        // Change the last value according to the function type
        } else if (funcType == "R") {
            this.cell.attr(".constraints/lastval", "unknown");
        } else if ((funcType == "C") || (funcType == "CR")) {
            this.cell.attr(".constraints/lastval", this.$('#init-sat-value').val());
        } else if (funcType == "SD") {
            this.cell.attr(".constraints/lastval", "denied");
        } else if (funcType == "DS") {
            this.cell.attr(".constraints/lastval", "satisfied");
        } else {
            this.cell.attr(".constraints/function", this.$('.function-type').val());
            this.cell.attr(".constraints/lastval", this.$('#markedValue').val());
        }
    },

    /**
     * Sets the satisfaction values on the inspector to the cell's attributes
     */
    setCellSatData: function() {

        var markedValue;
        if (this.$('#markedValue').val()) {
            markedValue = satvalues[this.$('#markedValue').val()];
        } else {
            markedValue = "0000";
        }

        this.cell.attr(".constraints/markedvalue", markedValue);

        // Set initial satisfaction value
        var initValue = this.$('#init-sat-value').val();
        this.cell.attr(".satvalue/value", initValue);

        // Set satvalue/text
        if (initValue == "satisfied") {
            this.cell.attr(".satvalue/text", "(FS, ⊥)");
        } else if (initValue == "partiallysatisfied") {
            this.cell.attr(".satvalue/text", "(PS, ⊥)");
        } else if (initValue == "denied") {
            this.cell.attr(".satvalue/text", "(⊥, FD)");
        } else if (initValue == "partiallydenied") {
            this.cell.attr(".satvalue/text", "(⊥, PD)");
        } else if (initValue == "unknown") {
            this.cell.attr(".satvalue/text", "?");
        } else {
            this.cell.attr(".satvalue/text", '');
            // If functype is NB, dont clear it
            if (this.cell.attr(".funcvalue/text") != 'NB') {
                this.cell.attr(".satvalue/text", ' ');
            }
        }
    },

    /**
     * Sets the user defined function data onto the cell's attributes
     */
    setUserDefinedCellFunctionData: function() {

        this.cell.attributes.attrs['.constraints'].function = this.constraintsObject.userFunctions;
        this.cell.attributes.attrs['.constraints'].lastval = this.constraintsObject.userValues;
        this.cell.attr(".constraints/beginLetter", this.constraintsObject.beginLetter);
        this.cell.attr(".constraints/endLetter", this.constraintsObject.endLetter);
        this.cell.attr(".constraints/repeatCount", this.constraintsObject.repeat_count);
        this.cell.attr(".constraints/absoluteLen", this.constraintsObject.absoluteLength);

        // Update repeat values
        if (this.repeatOptionsDisplay) {
            this.cell.attr(".constraints/beginRepeat", this.constraintsObject.repeatBegin);
            this.cell.attr(".constraints/endRepeat", this.constraintsObject.repeatEnd);
            this.cell.attr(".constraints/repeatCount", this.constraintsObject.repeat_count);
            this.cell.attr(".constraints/absoluteLen", this.constraintsObject.absoluteLength);
        } else {
            this.cell.attr(".constraints/beginRepeat", null);
            this.cell.attr(".constraints/endRepeat", null);
            this.cell.attr(".constraints/repeatCount", null);
            this.cell.attr(".constraints/absoluteLen", null);
        }
    },
    clear: function(){
        this.$el.html('');
    }
}
);
