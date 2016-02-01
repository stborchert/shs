/**
 * @file
 * A Backbone View that controls the overall Simple hierarchical select widgets.
 *
 * @see Drupal.shs.AppModel
 */

(function ($, _, Backbone, Drupal) {

  'use strict';

  Drupal.shs.AppView = Backbone.View.extend(/** @lends Drupal.shs.AppView# */{
    /**
     * Container element for SHS widgets.
     */
    container: null,
    /**
     * Field configuration.
     *
     * @type {object}
     */
    config: {},
    /**
     * @constructs
     *
     * @augments Backbone.View
     *
     * @param {object} options
     *   An object with the following keys:
     * @param {Drupal.shs.AppModel} options.model
     *   The application state model.
     */
    initialize: function (options) {
      // Track app state.
      console.log('[initialize] shs.AppView');
      this.config = this.model.get('config');

      this.$el.once('shs').addClass('visually-hidden');

      this.collection = new Drupal.shs.WidgetCollection({
        url: this.config.baseUrl + '/' + this.config.bundle
      });
      this.collection.reset();
      this.listenTo(this.collection, 'initialize', this.renderWidgets);
      this.listenTo(this.collection, 'update:selection', this.selectionUpdate);
    },
    /**
     * Main render function of Simple hierarchical select.
     *
     * @return {Drupal.shs.AppView}
     *   Returns AppView for chaining.
     */
    render: function () {
      var app = this;
      console.log('[render] shs.AppView');

      // Create container for widgets.
      app.container = $('<div>')
              .addClass('shs-field-container')
              .html('')
              .insertBefore(app.$el);

      console.log('[init] Initialize WidgetModels');

      $.each(app.config.parents, function (index, item) {
        // Add WidgetModel for each parent.
        app.collection.add(new Drupal.shs.classes[app.config.fieldName].models.widget({
          id: item.parent,
          defaultValue: item.defaultValue
        }));
      });
      app.collection.trigger('initialize');

      return app;
    },
    /**
     * Renders the select widgets of Simple hierarchical select.
     *
     * @return {Drupal.shs.AppView}
     *   Returns AppView for chaining.
     */
    renderWidgets: function () {
      var app = this;
      console.log('[render] shs.AppView:widgets');
      var level = 0;
      $(app.container).html('');
      app.collection.each(function (widgetModel) {
        // Create container for widget.
        $(app.container).append($('<div>').addClass('shs-widget-container'));
        // Create widget.
        new Drupal.shs.classes[app.config.fieldName].views.widget({
          app: app,
          model: widgetModel,
          level: level
        });
        level++;
      });
      return app;
    },
    /**
     * Rebuild widgets based on changed selection.
     *
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     * @param {integer} value
     *   New value of WidgetView
     * @param {Drupal.shs.WidgetView} widgetView
     *   View displaying the model.
     */
    selectionUpdate: function (widgetModel, value, widgetView) {
      var app = this;
      console.log('Selection changed to [' + value + '] in level [' + widgetModel.get('level') + ']');
      // Find all WidgetModels with a higher level than the changed model.
      var models = _.filter(this.collection.models, function (model) {
        return model.get('level') > widgetModel.get('level');
      });
      // Remove the found models from the collection.
      $.each(models, function (index, model) {
        app.collection.remove(model);
      });

      if (value !== app.config.settings.anyValue) {
        // Add new model with current selection.
        app.collection.add(new Drupal.shs.classes[app.config.fieldName].models.widget({
          id: value
        }));
      }

      // Trigger events.
      app.collection.trigger('initialize');
    }
  });

  /**
   * @constructor
   *
   * @augments Backbone.Collection
   */
  Drupal.shs.WidgetCollection = Backbone.Collection.extend(/** @lends Drupal.shs.WidgetCollection */{
    /**
     * @type {Drupal.shs.WidgetModel}
     */
    model: Drupal.shs.WidgetModel,
    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.url = options.url;
    }
  });

}(jQuery, _, Backbone, Drupal));
