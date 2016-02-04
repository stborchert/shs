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

/**
 * Alter Javascript settings of shs widgets in entity forms and views.
 *
 * @param array $settings_shs
 *   Javascript settings for shs widgets.
 * @param string $field_name
 *   Name of field the provided settings are used for.
 * @param string $bundle
 *   Bundle name of vocabulary the settings are used for.
 */
function hook_shs_js_settings_alter(&$settings_shs, $field_name, $bundle) {
  if ($field_name == 'field_article_terms') {
    $settings_shs['settings']['anyLabel'] = t(' - Select an item - ');
  }
}

/**
 * Alter Javascript settings for a single shs widget.
 *
 * @param array $settings_shs
 *   Javascript settings for the specified field.
 * @param string $field_name
 *   Name of field the provided settings are used for.
 * @param string $bundle
 *   Bundle name of vocabulary the settings are used for.
 */
function hook_shs_FIELDNAME_js_settings_alter(&$settings_shs, $field_name, $bundle) {
  $settings_shs['labels'] = [
    FALSE, // No label for first level.
    t('Country'),
    t('City'),
  ];
  // Small speed-up for anmiations (defaults to 400ms).
  $settings_shs['display']['animationSpeed'] = 100;
}
