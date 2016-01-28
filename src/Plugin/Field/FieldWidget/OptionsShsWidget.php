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
      'create_new_terms' => FALSE,
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
    ];
    $element['create_new_terms'] = [
      '#type' => 'checkbox',
      '#title' => t('Allow creating new terms'),
      '#default_value' => $this->getSetting('create_new_terms'),
      '#description' => t('Allow users to create new terms in the source vocabulary.'),
    ];
    $element['create_new_levels'] = [
      '#type' => 'checkbox',
      '#title' => t('Allow creating new levels'),
      '#default_value' => $this->getSetting('create_new_levels'),
      '#description' => t('Allow users to create new children for items which do not have any children yet.'),
      '#states' => [
        'visible' => [
          ':input[name="fields[' . $field_name . '][settings_edit_form][settings][create_new_terms]"]' => ['checked' => TRUE],
        ],
      ],
    ];
    $element['force_deepest'] = [
      '#type' => 'checkbox',
      '#title' => t('Force selection of deepest level'),
      '#default_value' => $this->getSetting('force_deepest'),
      '#description' => t('Force users to select terms from the deepest level.'),
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
    if ($this->getSetting('create_new_terms')) {
      $summary[] = t('Allow creation of new terms');
      if ($this->getSetting('create_new_levels')) {
        $summary[] = t('Allow creation of new levels');
      }
      else {
        $summary[] = t('Do not allow creation of new levels');
      }
    }
    else {
      $summary[] = t('Do not allow creation of new terms');
    }
    if ($this->getSetting('create_new_terms')) {
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

    $default_value = $element['#default_value'][$delta] ? : NULL;
    $target_bundles = $this->getFieldSetting('handler_settings')['target_bundles'];
    $settings_additional = [
      'required' => $element['#required'],
      'multiple' => $element['#multiple'],
      'anyLabel' => empty($element['#required']) ? t('- None -', [], ['context' => 'shs']) : t('- Select a value -', [], ['context' => 'shs']),
      'anyValue' => '_none',
    ];

    $parents = [[
      'parent' => 0,
      'defaultValue' => $settings_additional['anyValue'],
    ]];
    if ($default_value) {
      try {
        $storage = \Drupal::entityTypeManager()->getStorage($this->fieldDefinition->getItemDefinition()->getSetting('target_type'));
        $parent_terms = array_reverse(array_keys($storage->loadAllParents($default_value)));
        // Do not include the default value.
        array_pop($parent_terms);
        $keys = array_merge([0], $parent_terms);
        $values = array_merge($parent_terms, [$default_value]);
        $parents = [];
        foreach ($keys as $index => $key) {
          $parents[] = [
            'parent' => $key,
            'defaultValue' => $values[$index] ?: $settings_additional['anyValue'],
          ];
        }
      }
      catch (Exception $ex) {

      }
    }

    $element += [
      '#shs' => [
        'settings' => $this->getSettings() + $settings_additional,
        'bundle' => reset($target_bundles),
        'baseUrl' => $base_url . '/shs-term-data',
        'parents' => $parents,
        'defaultValue' => $default_value ? : $settings_additional['anyValue'],
      ],
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
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
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
