//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;

var ActorInspector = Backbone.View.extend({

        className: 'element-inspector',

        template: [
            '<label>Actor name</label>',
            '<textarea class="cell-attrs-text" maxlength=100></textarea>',
            '<label> Actor type </label>',
            '<select class="actor-type">',
            '<option value=A> Actor </option>',
            '<option value=G> Agent </option>',
            '<option value=R> Role </option>',
            '</select>'
        ].join(''),

        events: {
            'keyup .cell-attrs-text': 'nameAction',
        },

        /**
         * Initializes the element inspector using previously defined templates
         */
        render: function(cell) {

            this.cell = cell;

            // Save actor here
            this.actor = model.getActorByID(cell.attributes.nodeID);

            // If the clicked node is an actor, render the actor inspector
            this.$el.html(_.template(this.template)());
            this.$('.cell-attrs-text').val(this.actor.nodeName);
        },


        /**
         * Updates the selected actor's name.
         * This function is called on keyup for .cell-attrs-text
         */
        nameAction: function(event) {
            // Prevent the ENTER key from being recorded when naming nodes.
            if (event.which === ENTER_KEY) {
                event.preventDefault();
            }

            var text = this.$('.cell-attrs-text').val();
            // Do not allow special characters in names, replace them with spaces.
            text = text.replace(/[^\w\n-]/g, ' ');

            this.cell.attr({ '.name': { text: text } });
            this.actor.nodeName = text;

        },
      clear: function(){
            this.$el.html('');
        }
}

);
