/**
 * @file
 * Defines the behavior of the Simple hierarchical select module.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  /**
   * @todo: add description
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the SHS rendering functionality to matching elements.
   */
  Drupal.behaviors.shs = {
    attach: function (context) {
      var settingsDefault = {
        display: {
          animationSpeed: 400,
        }
      };
      $(context).find('select.shs-enabled:not([disabled])').each(function () {
        var field = this;
        var fieldConfig = $.extend({}, drupalSettings.shs[$(this).attr('name')], settingsDefault, {
          fieldName: $(field).attr('name')
        });

        var app_model = new Drupal.shs.AppModel({
          config: fieldConfig
        });

        var app_view = new Drupal.shs.AppView({
          el: field,
          model: app_model
        });
        Drupal.shs.views.appViews.push(app_view);
        app_view.render();

        // Broadcast model changes to other modules.
//        widget_model.on('change:items', function (model) {
//          $(document).trigger('shsWidgetItemsChange');
//        });
      });
    }
  };

  /**
   * SHS methods of Backbone objects.
   *
   * @namespace
   */
  Drupal.shs = {
    /**
     * A hash of View instances.
     *
     * @type {object.<string, Backbone.View>}
     */
    views: {
      appViews: []
    },
    /**
     * A hash of Model instances.
     *
     * @type {object.<string, Backbone.Model>}
     */
    models: {}
  };

}(jQuery, Drupal, drupalSettings));
