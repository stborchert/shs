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
      var widget = this;
      console.log('[render] shs.WidgetView');
      widget.$el.attr('id', widget.app.$el.attr('id') + '-shs-' + widget.level)
              .addClass('shs-select')
              // Add core class to apply default styles to the element.
              .addClass('form-select')
              .hide();
      if (widget.model.get('dataLoaded')) {
        widget.$el.show();
      }

      if (widget.$el.prop) {
        var options = widget.$el.prop('options');
      }
      else {
        var options = widget.$el.attr('options');
      }

      // Remove all existing options.
      $('option', widget.$el).remove();

      // Add "any" option. @todo
      if (!widget.config.settings.required) {
        widget.$el.append($('<option>').text(widget.config.settings.anyLabel).val(widget.config.settings.anyValue));
      }

      // Create options from collection.
      widget.model.itemCollection.each(function (item) {
        if (!item.get('tid')) {
          return;
        }
        var optionModel = new Drupal.shs.WidgetItemOptionModel({
          label: item.get('name'),
          value: item.get('tid'),
          hasChildren: item.get('hasChildren')
        });
        var option = new Drupal.shs.WidgetItemView({
          model: optionModel
        });
        widget.$el.append(option.render().$el);
      });

      // Set default value of widget.
      widget.$el.val(widget.model.get('defaultValue'));

      var $container = $($('.shs-widget-container', $(widget.app.container)).get(widget.level));
      // Add widget to container.
      if (widget.model.get('dataLoaded')) {
        // Add element without using any effect.
        $container.append(widget.$el);
      }
      else {
        $container.append(widget.$el.fadeIn(widget.config.display.animationSpeed));
      }

      widget.model.set('dataLoaded', true);
      // Return self for chaining.
      return widget;
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
