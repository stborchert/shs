<?php

/**
 * @file
 * Contains \Drupal\shs\Plugin\Field\FieldWidget\OptionsShsWidget.
 */

namespace Drupal\shs\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\OptionsSelectWidget;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'options_shs' widget.
 *
 * @FieldWidget(
 *   id = "options_shs",
 *   label = @Translation("Simple hierarchical select"),
 *   field_types = {
 *     "entity_reference"
 *   },
 *   multiple_values = TRUE
 * )
 */
class OptionsShsWidget extends OptionsSelectWidget {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    $settings_default = [
      'display_node_count' => FALSE,
      'create_new_items' => FALSE,
      'create_new_levels' => FALSE,
      'force_deepest' => FALSE,
    ];
    return $settings_default + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $field_name = $this->fieldDefinition->getName();

    $element['display_node_count'] = [
      '#type' => 'checkbox',
      '#title' => t('Display number of nodes'),
      '#default_value' => $this->getSetting('display_node_count'),
      '#description' => t('Display the number of nodes associated with each term.'),
      '#disabled' => TRUE,
    ];
    $element['create_new_items'] = [
      '#type' => 'checkbox',
      '#title' => t('Allow creating new items'),
      '#default_value' => $this->getSetting('create_new_items'),
      '#description' => t('Allow users to create new items of the source bundle.'),
      '#disabled' => TRUE,
    ];
    $element['create_new_levels'] = [
      '#type' => 'checkbox',
      '#title' => t('Allow creating new levels'),
      '#default_value' => $this->getSetting('create_new_levels'),
      '#description' => t('Allow users to create new children for items which do not have any children yet.'),
      '#states' => [
        'visible' => [
          ':input[name="fields[' . $field_name . '][settings_edit_form][settings][create_new_items]"]' => ['checked' => TRUE],
        ],
      ],
      '#disabled' => TRUE,
    ];
    $element['force_deepest'] = [
      '#type' => 'checkbox',
      '#title' => t('Force selection of deepest level'),
      '#default_value' => $this->getSetting('force_deepest'),
      '#description' => t('Force users to select terms from the deepest level.'),
      '#disabled' => TRUE,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();

    if ($this->getSetting('display_node_count')) {
      $summary[] = t('Display number of nodes');
    }
    else {
      $summary[] = t('Do not display number of nodes');
    }
    if ($this->getSetting('create_new_items')) {
      $summary[] = t('Allow creation of new items');
      if ($this->getSetting('create_new_levels')) {
        $summary[] = t('Allow creation of new levels');
      }
      else {
        $summary[] = t('Do not allow creation of new levels');
      }
    }
    else {
      $summary[] = t('Do not allow creation of new items');
    }
    if ($this->getSetting('force_deepest')) {
      $summary[] = t('Force selection of deepest level');
    }
    else {
      $summary[] = t('Do not force selection of deepest level');
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    global $base_url;
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    if (isset($form_state->getBuildInfo()['base_form_id']) && ('field_config_form' === $form_state->getBuildInfo()['base_form_id'])) {
      // Do not display the shs widget in the field config.
      return $element;
    }

    $field_name = $this->fieldDefinition->getName();
    $default_value = $element['#default_value'] ? : NULL;
    if ($form_state_default = $form_state->getUserInput()[$field_name]) {
      $default_value = $form_state_default;
    }
    $target_bundles = $this->getFieldSetting('handler_settings')['target_bundles'];
    $settings_additional = [
      'required' => $this->required,
      'multiple' => $this->multiple,
      'anyLabel' => $this->getEmptyLabel() ? : t('- None -'),
      'anyValue' => '_none',
      'addNewLabel' => t('Add another item'),
    ];

    $bundle = reset($target_bundles);

    // Define default parents for the widget.
    $parents = [
      [
        [
          'parent' => 0,
          'defaultValue' => $settings_additional['anyValue'],
        ]
      ]
    ];
    if ($default_value) {
      $parents = $this->getParents($default_value, $settings_additional);
    }

    $settings_shs = [
      'settings' => $this->getSettings() + $settings_additional,
      'bundle' => $bundle,
      'baseUrl' => $base_url . '/shs-term-data',
      'cardinality' => $this->fieldDefinition->getFieldStorageDefinition()->getCardinality(),
      'parents' => $parents,
      'defaultValue' => $default_value,
    ];

    $hooks = [
      'shs_js_settings',
      "shs_{$field_name}_js_settings",
    ];
    // Allow other modules to override the settings.
    \Drupal::moduleHandler()->alter($hooks, $settings_shs, $bundle, $field_name);

    $element += [
      '#shs' => $settings_shs,
    ];
    $element['#attributes'] = $element['#attributes'] ? : [];
    $element['#attributes'] = array_merge($element['#attributes'], [
      'class' => ['shs-enabled'],
    ]);
    $element['#attached'] = $element['#attached'] ? : [];
    $element['#attached'] = array_merge($element['#attached'], [
      'library' => ['shs/shs.form'],
    ]);
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function afterBuild(array $element, FormStateInterface $form_state) {
    $element = parent::afterBuild($element, $form_state);

    if (empty($element['#shs'])) {
      // Simply return the unaltered element if there is no information attached
      // about SHS (i.e. on field config forms).
      return $element;
    }
    $element['#shs'] += [
      'classes' => shs_get_class_definitions($element['#field_name']),
    ];
    $element['#attached'] = $element['#attached'] ? : [];
    $element['#attached'] = array_merge($element['#attached'], [
      'drupalSettings' => [
        'shs' => [
          $element['#field_name'] => $element['#shs'],
        ],
      ],
    ]);

    return $element;
  }

  /**
   * Load parents for default values.
   *
   * @param array $default_values
   *   List of default values of the widget.
   * @param array $settings
   *   Widget settings.
   *
   * @return array
   *   List of parents for each default value.
   */
  protected function getParents($default_values, $settings) {
    $parents = [];
    if (!is_array($default_values)) {
      $default_values = [$default_values];
    }
    foreach ($default_values as $delta => $value) {
      if ($settings['anyValue'] === $value) {
        $parents[$delta] = [
          [
            'parent' => 0,
            'defaultValue' => $settings['anyValue'],
          ]
        ];
        continue;
      }
      try {
        $storage = \Drupal::entityTypeManager()->getStorage($this->fieldDefinition->getItemDefinition()->getSetting('target_type'));
        $parent_terms = array_reverse(array_keys($storage->loadAllParents($value)));
        $keys = array_merge([0], $parent_terms);
        $values = array_merge($parent_terms, [$value]);
        $parents[$delta] = [];
        foreach ($keys as $index => $key) {
          $parents[$delta][] = [
            'parent' => $key,
            'defaultValue' => $values[$index] ? : $settings['anyValue'],
          ];
        }
      }
      catch (Exception $ex) {
        $parents[$delta] = [
          [
            'parent' => 0,
            'defaultValue' => $settings['anyValue'],
          ]
        ];
      }
    }
    return $parents;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
    // The widget currently only works for taxonomy terms.
    if (strpos($field_definition->getSetting('handler'), 'taxonomy_term') === FALSE) {
      return FALSE;
    }
    // The widget only works with fields having one target bundle as source.
    return count($field_definition->getSetting('handler_settings')['target_bundles']) === 1;
  }

  /**
   * {@inheritdoc}
   */
  protected function supportsGroups() {
    // We do not support optgroups.
    return FALSE;
  }

  /**
   * Return string representation of a setting.
   *
   * @param string $key
   *   Name of the setting.
   *
   * @return string
   *   Value of the setting. If boolean, the value is "translated" to 'true' or
   *   'false'.
   */
  protected function settingToString($key) {
    $options = [
      FALSE => t('false'),
      TRUE => t('true'),
    ];
    $value = $this->getSetting($key);
    if (!is_bool($value)) {
      return $value;
    }
    return $options[$value];
  }

}
