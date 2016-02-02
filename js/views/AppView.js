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
      this.config = this.model.get('config');

      this.$el.once('shs').addClass('hidden');

      this.collection = new Drupal.shs.WidgetCollection({
        url: this.getConfig('baseUrl') + '/' + this.getConfig('bundle')
      });
      this.collection.reset();
      this.listenTo(this.collection, 'initialize', this.renderWidgets);
      this.listenTo(this.collection, 'update:selection', this.selectionUpdate);
      this.listenTo(this.collection, 'update:value', this.update);
    },
    /**
     * Main render function of Simple hierarchical select.
     *
     * @return {Drupal.shs.AppView}
     *   Returns AppView for chaining.
     */
    render: function () {
      var app = this;

      // Create container for widgets.
      app.container = $('<div>')
              .addClass('shs-field-container')
              .html('')
              .insertBefore(app.$el);

      $.each(app.getConfig('parents'), function (index, item) {
        // Add WidgetModel for each parent.
        app.collection.add(new Drupal.shs.classes[app.getConfig('fieldName')].models.widget({
          id: item.parent,
          defaultValue: item.defaultValue,
          level: index
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
      $(app.container).html('');
      app.collection.each(function (widgetModel) {
        // Create container for widget.
        $(app.container).append($('<div>').addClass('shs-widget-container').attr('data-shs-level', widgetModel.get('level')));
        // Create widget.
        new Drupal.shs.classes[app.getConfig('fieldName')].views.widget({
          app: app,
          model: widgetModel
        });
      });
      return app;
    },
    /**
     * Rebuild widgets based on changed selection.
     *
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     * @param {string} value
     *   New value of WidgetView
     * @param {Drupal.shs.WidgetView} widgetView
     *   View displaying the model.
     */
    selectionUpdate: function (widgetModel, value, widgetView) {
      var app = this;
      // Find all WidgetModels with a higher level than the changed model.
      var models = _.filter(this.collection.models, function (model) {
        return model.get('level') > widgetModel.get('level');
      });
      // Remove the found models from the collection.
      $.each(models, function (index, model) {
        app.collection.remove(model);
      });

      if (value !== app.getSetting('anyValue')) {
        // Add new model with current selection.
        app.collection.add(new Drupal.shs.classes[app.getConfig('fieldName')].models.widget({
          id: value,
          level: widgetModel.get('level') + 1
        }));
      }
      // Trigger value update.
      app.collection.trigger('update:value', widgetModel, value);

      // Trigger events.
      app.collection.trigger('initialize');
    },
    /**
     * Update the value of the original element.
     *
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     * @param {string} value
     *   New value of element.
     */
    update: function(widgetModel, value) {
      var app = this;
      if (value === app.getSetting('anyValue') && widgetModel.get('level') > 0) {
        // Use value of parent widget (which is the id of the model ;)).
        value = widgetModel.get('id');
      }
      this.$el.val(value);
    },
    /**
     * Check if original widget reports an error.
     *
     * @returns {boolean}
     *   Whether there is something wrong with the original widget.
     */
    hasError: function () {
      return this.$el.hasClass('error');
    },
    /**
     * Get a configuration value for shs.
     *
     * @param {string} name
     *   Name of the configuration to get. To get the value of a nested
     *   configuration the names are concatted by a dot (i.e.
     *   "display.animationSpeed").
     *
     * @returns {mixed}
     *   The value of the configuration or the complete configuration object if
     *   the name is empty.
     */
    getConfig: function (name) {
      if (typeof name == undefined || name == null) {
        return this.config || {};
      }

      var parts = name.split('.');
      var conf = this.config || {};
      for (var i = 0, len = parts.length; i < len; i++) {
        conf = conf[parts[i]];
      }
      if (typeof conf === undefined) {
        return;
      }
      return conf;
    },
    /**
     * Shortcut function for <code>getConfig('settings.*');</code>.
     *
     * @param {string} name
     *   Name of a setting to get. If empty, the entire settings will be
     *   returned.
     *
     * @returns {mixed}
     *   The value of the setting.
     */
    getSetting: function (name) {
      if (typeof name == undefined || name == null) {
        name = 'settings';
      }
      else {
        name = 'settings.' + name;
      }
      return this.getConfig(name);
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
