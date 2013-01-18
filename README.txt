
-- SUMMARY --

The Simple hierarchical select module displays selected taxonomy fields as
hierarchical selects on node creation/edit forms and as exposed filter in views.


-- REQUIREMENTS --

Taxonomy module (Drupal core) needs to be enabled.


-- INSTALLATION --

* Install as usual, see http://drupal.org/node/70151 for further information.


-- CONFIGURATION --

* Create a new field (type "Term reference") and select
  "Simple hierarchical select" as widget type.

* Field settings
  - "Display number of nodes"
    Displays the number of nodes associated to a term next to the term name in
    the dropdown.
    WARNING: on sites with a lot of terms and nodes this can be a great
    performance killer (even if the data is cached).
  - "Allow creating new terms"
    Terms may be created directly from within the dropdowns (user needs to have
    permission to create terms in the vocabulary).
  - "Allow creating new levels"
    If selected users with permission to create terms in the vocabulary will be
    able to create a new term as child of the currently selected term.

* Views (exposed filter)
  - add a new filter using the field set-up as "Simple hierarchical select"
  - use "Simple hierarchical select" as selection type
  - select "Expose this filter to visitors, to allow them to change it"
  - enjoy :)


-- CONTACT --

Current maintainers:
* Stefan Borchert (stborchert) - http://drupal.org/user/36942

This project has been sponsored by:
* undpaul
  Drupal experts providing professional Drupal development services.
  Visit http://www.undpaul.de for more information.

