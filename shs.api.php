<?php

/**
 * @file
 *
 * This file contains no working PHP code; it exists to provide additional
 * documentation for doxygen as well as to document hooks in the standard Drupal
 * manner.
 */

/**
 * Alter the list of used javascript classes to create the shs widgets.
 *
 * @param array $definitions
 *   List of class names keyed by type and class key.
 */
function hook_shs_class_definitions_alter(&$definitions) {
  // Use custom class for option elements.
  $definitions['views']['widgetItem'] = 'Drupal.customShs.MyWidgetItemView';
}

/**
 * Alter the list of used javascript classes to create the shs widgets for an
 * individual field.
 *
 * @param array $definitions
 *   List of class names keyed by type and class key.
 */
function hook_shs_FIELDNAME_class_definitions_alter(&$definitions) {
  // Use custom class for option elements.
  $definitions['views']['widgetItem'] = 'Drupal.customShs.MyWidgetItemView';
}
