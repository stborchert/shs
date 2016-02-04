<?php

/**
 * @file_field_delete_file
 * Contains \Drupal\shs\Controller\ShsController.
 */

namespace Drupal\shs\Controller;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\shs\Cache\ShsTermCacheDependency;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Controller for getting taxonomy terms.
 */
class ShsController extends ControllerBase {

  /**
   * Constructs a new ShsController object
   */
  public function __construct() {

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static();
  }

  /**
   * Load term data.
   *
   * @param string $bundle
   *   Bundle (vocabulary) identifier to limit the return list to a specific
   *   bundle.
   * @param integer $entity_id
   *   Id of parent term to load all children for. Defaults to 0.
   *
   * @return CacheableJsonResponse
   *   Cacheable Json response.
   */
  public function getTermData($bundle, $entity_id = 0) {
    $response = new CacheableJsonResponse();

    $cache_tags = [];
    $result = [];

    $entity_manager = \Drupal::getContainer()->get('entity.manager');
    $storage = $entity_manager->getStorage('taxonomy_term');
    $terms = $storage->loadTree($bundle, $entity_id, 1, TRUE);

    foreach ($terms as $term) {
      $result[] = (object) [
        'tid' => $term->id(),
        'name' => $term->getName(),
        'description__value' => $term->getDescription(),
        'langcode' => $term->default_langcode,
      ];
      $cache_tags[] = sprintf('taxonomy_term:%d', $term->id());
    }

    $response->addCacheableDependency(new ShsTermCacheDependency($cache_tags));
    $response->setData($result);

    return $response;
  }

}
