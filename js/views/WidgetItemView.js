/**
 * @file
 * A Backbone view for a shs widget items.
 */

(function ($, Drupal, drupalSettings, Backbone) {

  'use strict';

  Drupal.shs.WidgetItemView = Backbone.View.extend(/** @lends Drupal.shs.WidgetItemView# */{

    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'option',

    /**
     * Backbone View for a single shs widget item.
     *
     * @constructs
     *
     * @augments Backbone.View
     */
    initialize: function () {
      console.log('[initialize] shs.WidgetItemView');
    },

    /**
     * @inheritdoc
     */
    render: function () {
      console.log('[render] shs.WidgetItemView');
      if ((typeof this.model.get('value') === undefined) || (this.model.get('value') === null)) {
        // Do not render item.
        return;
      }

      // Set label and value of the option.
      this.$el.text(this.model.get('label'))
              .val(this.model.get('value'));

      if (this.model.hasChildren) {
        // Add special class.
        this.$el.addClass('has-children');
      }

      // Return self for chaining.
      return this;
    }

  });

}(jQuery, Drupal, drupalSettings, Backbone));
