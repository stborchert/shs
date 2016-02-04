
-- SUMMARY --

The "Simple hierarchical select" module displays selected taxonomy fields as
hierarchical selects on entity forms and as exposed filter in views.


-- REQUIREMENTS --

The modules "Taxonomy" and "Views" (Drupal core) needs to be enabled for SHS to
work properly.


-- INSTALLATION --

* Install as usual, see https://www.drupal.org/documentation/install/modules-themes/modules-8
  for further information.


-- CONFIGURATION --

* Create a new field ("Reference > Taxonomy term") and select
  "Simple hierarchical select" on the form display settings for the new field.

* Form display settings
  - "Display number of nodes"
    Displays the number of nodes associated to a term.
    WARNING: on sites with a lot of terms and nodes this can be a great
    performance killer (even if the data is cached).
  - "Allow creating new items"
    Items may be created directly from within the widget (user needs to have
    permission to create items in the configured bundle).
  - "Allow creating new levels"
    Users with permission to create items in the configured bundle will be
    able to create a new item as child of the currently selected item.
  - "Force selection of deepest level"
    Force users to select items from the deepest level.


-- CONTACT --

Current maintainers:
* Stefan Borchert (stborchert) - http://drupal.org/user/36942

This project has been sponsored by:
* undpaul
  Drupal experts providing professional Drupal development services.
  Visit http://www.undpaul.de for more information.

