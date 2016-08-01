(function () {
  'use strict';

  var dropdown = angular.module('kt.dropdown', ['kt.util.dom']);

  dropdown.factory('ktDropdownSvc', ['$timeout', 'ktOffset', function ($timeout, ktOffset) {
    var current = undefined;
    var dropdowns = [];
    var service = {};

    service.addDropdown = function (element, targets) {
      var dropdown = {
        element: element,
        targets: targets
      };
      dropdowns.push(dropdown);

      return dropdown;
    };

    service.removeDropdown = function (dropdown) {
      if (service.isOpen(dropdown)) {
        service.closeDropdown(dropdown);
      }
      var index = dropdowns.indexOf(dropdown);
      dropdowns.splice(index, 1);
    };

    service.openDropdown = function (dropdown) {
      service.closeCurrent();
      dropdown.targets.forEach(function (target) {
        service.openTarget(target);
        target.bounds = ktOffset.boundingRectangle(target[0]);
        target.bind('DOMSubtreeModified', function () {
          $timeout(function () {
            target.bounds = ktOffset.boundingRectangle(target[0]);
          });
        });
      });
      dropdown.element.addClass('kt-dropdown-open');
      current = dropdown;
    };

    service.closeDropdown = function (dropdown) {
      dropdown.targets.forEach(function (target) {
        service.closeTarget(target);
      });
      dropdown.element.removeClass('kt-dropdown-open');
      current = undefined;
    };

    service.closeCurrent = function () {
      if (current) {
        service.closeDropdown(current);
      }
    };

    service.toggleDropdown = function (dropdown) {
      if (service.isOpen(dropdown)) {
        service.closeDropdown(dropdown);
      } else {
        service.openDropdown(dropdown);
      }
    };

    service.isCurrent = function (dropdown) {
      return current === dropdown;
    };

    service.openTarget = function (target) {
      target.removeClass('kt-dropdown-target-closed');
      target.addClass('kt-dropdown-target-open');
    };

    service.closeTarget = function (target) {
      target.removeClass('kt-dropdown-target-open');
      target.addClass('kt-dropdown-target-closed');
    };

    service.isOpen = function (dropdown) {
      return dropdown.element.hasClass('kt-dropdown-open');
    };

    service.getCurrent = function () {
      return current;
    };

    return service;
  }]);

  dropdown.directive('ktDropdown', ['$timeout', 'ktDropdownSvc', function ($timeout, ktDropdownSvc) {
    function link(scope, element, attributes) {
      if (!attributes.ktDropdown) {
        return;
      }

      var dropdown = undefined;

      scope.isOpen = function () {
        return ktDropdownSvc.isCurrent(dropdown);
      };

      $timeout(function () {
        var targets = [];
        Array.prototype.slice.call(document.querySelectorAll(attributes.ktDropdown)).forEach(function (target) {
          var t = angular.element(target);
          ktDropdownSvc.closeTarget(t);
          targets.push(t);
        });
        dropdown = ktDropdownSvc.addDropdown(element, targets);
      });

      element.on('click', function () {
        document.removeEventListener('click', onDocumentClick, false);

        if (!ktDropdownSvc.isCurrent(dropdown)) {
          ktDropdownSvc.openDropdown(dropdown);
        } else if (attributes.ktDropdownToggle == true) {
          ktDropdownSvc.toggleDropdown(dropdown);
        }

        $timeout(function () {
          document.addEventListener('click', onDocumentClick, false);
        });
      });

      scope.$on('$destroy', function () {
        ktDropdownSvc.removeDropdown(dropdown);
      });
    }

    var onDocumentClick = function(e) {
      var dropdown = ktDropdownSvc.getCurrent();
      if (!dropdown || !dropdown.targets) {
        return;
      }

      var clickedInsideCurrent = false;

      dropdown.targets.forEach(function (target) {
        if (e.pageX >= target.bounds.left && e.pageX <= target.bounds.right
          && e.pageY >= target.bounds.top && e.pageY <= target.bounds.bottom) {
          clickedInsideCurrent = true;
        }
      });

      if (!clickedInsideCurrent && e.target.tagName !== 'OPTION') {
        ktDropdownSvc.closeCurrent();
      }
    };

    return {
      restrict: 'A',
      link    : link
    };
  }]);
})();
