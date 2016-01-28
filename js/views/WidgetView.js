/**
 * @file
 * A Backbone view for a shs widget.
 */

(function ($, Drupal, drupalSettings, Backbone) {

  'use strict';

  Drupal.shs.WidgetView = Backbone.View.extend(/** @lends Drupal.shs.WidgetView# */{
    /**
     * The main application.
     *
     * @type {Drupal.shs.AppView}
     */
    app: null,
    /**
     * Widget level (position).
     *
     * @type {integer}
     */
    level: 0,
    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'select',
    /**
     * List of custom events.
     */
    events: {
      'change': 'selectionChange'
    },
    /**
     * Field configuration.
     *
     * @type {object}
     */
    config: {},
    /**
     * Backbone View for shs widgets.
     *
     * @constructs
     *
     * @augments Backbone.View
     */
    initialize: function (options) {
      console.log('[initialize] shs.WidgetView');
      this.app = options.app;
      this.level = options.level;
      this.model.set('level', options.level);

      this.config = this.app.model.get('config');

      if (!this.model.get('dataLoaded')) {
        // Create new item collection.
        this.model.itemCollection = new Drupal.shs.WidgetItemCollection({
          url: this.config.baseUrl + '/' + this.config.bundle + '/' + this.model.get('id')
        });
      }

      this.listenTo(this, 'rerender', this.render);
      this.listenTo(this.model.itemCollection, 'update', this.render);

      if (this.model.get('dataLoaded')) {
        // Re-render widget without fetching.
        this.trigger('rerender');
      }
      else {
        // Fetch collection items.
        this.model.itemCollection.fetch();
      }
    },
    /**
     * @inheritdoc
     */
    render: function () {
      console.log('[render] shs.WidgetView');
      this.$el.attr('id', this.app.$el.attr('id') + '-shs-' + this.level)
              .addClass('shs-select')
              // Add core class to apply default styles to the element.
              .addClass('form-select')
              .hide();
      if (this.model.get('dataLoaded')) {
        this.$el.show();
      }

      if (this.$el.prop) {
        var options = this.$el.prop('options');
      }
      else {
        var options = this.$el.attr('options');
      }

      // Remove all existing options.
      $('option', this.$el).remove();

      // Add "any" option. @todo
      if (!this.config.settings.required) {
        options[options.length] = new Option(this.config.settings.anyLabel, this.config.settings.anyValue);
      }

      // Create options from collection.
      this.model.itemCollection.each(function (item) {
        if (item.get('tid')) {
          var option = new Option(item.get('name'), item.get('tid'));
          options[options.length] = option;
          if (item.get('hasChildren')) {
            option.setAttribute('class', 'has-children');
          }
        }
      });

      // Set default value of widget.
      this.$el.val(this.model.get('defaultValue'));

      var $container = $($('.shs-widget-container', $(this.app.container)).get(this.level));
      // Add widget to container.
      if (this.model.get('dataLoaded')) {
        $container.append(this.$el);
      }
      else {
        $container.append(this.$el.fadeIn(this.config.display.animationSpeed));
      }

      this.model.set('dataLoaded', true);
      // Return self for chaining.
      return this;
    },
    /**
     * React to selection changes within the element.
     */
    selectionChange: function () {
      var value = $(this.el).val();
      // Update default value of attached model.
      this.model.set('defaultValue', value);
      // Fire events.
      $(document).trigger('shsWidgetSelectionChange', this.model, value, this.app);
      this.app.collection.trigger('update:selection', this.model, value, this);
    }

  });

  /**
   * @constructor
   *
   * @augments Backbone.Collection
   */
  Drupal.shs.WidgetItemCollection = Backbone.Collection.extend(/** @lends Drupal.shs.WidgetItemCollection */{
    /**
     * @type {Drupal.shs.WidgetItemModel}
     */
    model: Drupal.shs.WidgetItemModel,
    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.url = options.url;
    }
  });

}(jQuery, Drupal, drupalSettings, Backbone));
