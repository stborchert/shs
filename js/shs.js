/**
 * @file
 * Custom behaviors for Simple hierarchical select.
 */

(function ($) {

  /**
   * Creates the widget for Simple hierarchical select.
   */
  Drupal.behaviors.shsWidgetCreate = {

    // Default function to attach the behavior.
    attach: function (context, settings) {
      var self = this;
      $('input.shs-enabled')
        .not('.shs-processed')
        .once('shs')
        .addClass('element-invisible')
        .each(function() {
          var $field = $(this);
          var fieldName = $(this).attr('name');
          if (fieldName in settings.shs) {
            var level = 0;
            var parent_id = 0;
            // Update class of wrapper element.
            $field.parent('.form-item').not('.shs-wrapper-processed').once('shs-wrapper');
            // Create elements for each parent of the current value.
            $.each(settings.shs[fieldName].parents, function(index, parent) {
              level++;
              // Create select element.
              $select = shsElementCreate($field.attr('id'), settings.shs[fieldName], level);
              $select.appendTo($field.parent());
              // Retrieve data for this level.
              getTermChildren($select, settings.shs[fieldName], parent_id, parent.tid);
              // Use current term id as parent id for the next level.
              parent_id = parent.tid;
            });
          }
        });
    }
  }

  /**
   * Load direct children of a selected term.
   *
   * @param $element
   *   Element to fill with terms.
   * @param settings
   *   Field settings.
   * @param parent_value
   *   Value which has been selected in the parent element (== "selected term").
   * @param default_value
   *   Value to use as default.
   */
  getTermChildren = function($element, settings, parent_value, default_value) {
    $.ajax({
      url: Drupal.settings.basePath + 'shs/json',
      type: 'POST',
      dataType: 'json',
      cache: true,
      data: {
        callback: 'shs_term_get_children',
        arguments: {
          vid: settings.vid,
          parent: parent_value,
          settings: settings.settings
        }
      },
      success: function(data) {
        if (data.success == true) {
          if ($element.prop) {
            var options = $element.prop('options');
          }
          else {
            var options = $element.attr('options');
          }

          if (data.data.length == 0 && !(settings.settings.create_new_terms && settings.settings.create_new_levels)) {
            // Remove element.
            $element.remove();
            return;
          }

          // Remove all existing options.
          $('option', $element).remove();
          // Add empty option (if field is not required or this is not the
          // first level).
          if (!settings.settings.required || (settings.settings.required && parent_value != 0)) {
            options[options.length] = new Option(Drupal.t('- None -'), 0);
          }

          if (settings.settings.create_new_terms) {
            // Add option to add new item.
            options[options.length] = new Option(Drupal.t('<Add new item>', {}, {context: 'shs'}), '_add_new_');
          }

          // Add retrieved list of options.
          $.each(data.data, function(value, label) {
            options[options.length] = new Option(label, value);
          });
          // Set default value.
          $element.val(default_value);

          $element.fadeIn();
        }
      },
      error: function(xhr, status, error) {
      }
    });
  }

  /**
   * Add a new term to database.
   *
   * @param $triggering_element
   *   Element to add the new term to.
   * @param $container
   *   Container for "Add new" elements.
   * @param term
   *   The new term object.
   */
  termAddNew = function($triggering_element, $container, term) {
    $.ajax({
      url: Drupal.settings.basePath + 'shs/json',
      type: 'POST',
      dataType: 'json',
      cache: true,
      data: {
        callback: 'shs_json_term_add',
        arguments: {
          vid: term.vid,
          parent: term.parent,
          name: term.name
        }
      },
      success: function(data) {
        if (data.success == true && data.data.tid) {
          if ($triggering_element.prop) {
            var options = $triggering_element.prop('options');
          }
          else {
            var options = $triggering_element.attr('options');
          }

          // Add new option with data from created term.
          options[options.length] = new Option(data.data.name, data.data.tid);
          // Set new default value.
          $triggering_element.val(data.data.tid);
        }
      },
      error: function(xhr, status, error) {
        // Reset value of triggering element.
        $triggering_element.val(0);
      },
      complete: function(xhr, status) {
        // Remove container.
        $container.remove();
        // Display triggering element.
        $triggering_element.fadeIn();
      }
    });
  }

  /**
   * Update the changed element.
   *
   * @param $triggering_element
   *   Element which has been changed.
   * @param base_id
   *   ID of original field which is rewritten as "taxonomy_shs".
   * @param settings
   *   Field settings.
   * @param level
   *   Current level in hierarchy.
   */
  updateElements = function($triggering_element, base_id, settings, level) {
    // Remove all following elements.
    $triggering_element.nextAll('select').remove();
    $triggering_element.nextAll('.shs-term-add-new-wrapper').remove();
    // Create next level (if the value is != 0).
    if ($triggering_element.val() == '_add_new_') {
      // Hide element.
      $triggering_element.hide();
      // Create new container with textfield and buttons ("cancel", "save").
      $container = $('<div>')
        .addClass('shs-term-add-new-wrapper')
        .addClass('clearfix');
      // Append container to parent.
      $container.appendTo($triggering_element.parent());

      // Add textfield for term name.
      $nameField = $('<input type="text">')
        .attr('maxlength', 255)
        .attr('size', 10)
        .addClass('shs-term-name')
        .addClass('form-text');
      $nameField.appendTo($container);

      // Add buttons.
      $buttons = $('<div>')
        .addClass('buttons');
      $buttons.appendTo($container);
      $cancel = $('<a>')
        .attr('href', '#')
        .html(Drupal.t('Cancel'))
        .bind('click', function(event) {
          event.preventDefault();
          // Remove container.
          $container.remove();
          // Reset value of triggering element.
          $triggering_element.val(0);
          // Display triggering element.
          $triggering_element.fadeIn();
        });
      $cancel.appendTo($buttons);
      $save = $('<a>')
        .attr('href', '#')
        .html(Drupal.t('Save'))
        .bind('click', function(event) {
          event.preventDefault();
          // Get the new term name.
          var termName = $(this).parents('.shs-term-add-new-wrapper').find('input.shs-term-name').val();
          // Create a term object.
          var term = {
            vid: settings.vid,
            parent: $triggering_element.prev('select').val() || 0,
            name: termName
          };
          if (termName.length > 0) {
            termAddNew($triggering_element, $container, term);
          }
          else {
            // Remove container.
            $container.remove();
            // Reset value of triggering element.
            $triggering_element.val(0);
            // Display triggering element.
            $triggering_element.fadeIn();
          }
        });
      $save.appendTo($buttons);
    }
    else if ($triggering_element.val() != 0) {
      level++;
      $element_new = shsElementCreate(base_id, settings, level);
      $element_new.appendTo($triggering_element.parent());
      // Retrieve list of items for the new element.
      getTermChildren($element_new, settings, $triggering_element.val(), 0);
    }

    // Reset value of original field.
    $field_orig = $('#' + base_id);
    $field_orig.val(0);
    // Set original field value.
    if ($triggering_element.val() == 0 || $triggering_element.val() == '_add_new_') {
      if (level > 1) {
        // Use value from parent level.
        $field_orig.val($triggering_element.prev('select').val());
      }
    }
    else {
      // Use value from current field.
      $field_orig.val($triggering_element.val());
    }
  }


  /**
   * Create a new <select> element.
   *
   * @param base_id
   *   ID of original field which is rewritten as "taxonomy_shs".
   * @param settings
   *   Field settings.
   * @param level
   *   Current level in hierarchy.
   *
   * @return
   *   The new (empty) <select> element.
   */
  shsElementCreate = function(base_id, settings, level) {
    $element = $('<select>')
      .attr('id', base_id + '-select-' + level)
      .addClass('shs-select')
      .addClass('shs-select-level-' + level)
      .bind('change', function() {
        updateElements($(this), base_id, settings, level);
      })
      .hide(); // Initially hide the element.
    // Return the new element.
    return $element;
  }

})(jQuery);
