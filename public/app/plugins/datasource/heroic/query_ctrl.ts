///<reference path="../../../headers/common.d.ts" />

import {QueryCtrl} from 'app/plugins/sdk';

import angular from 'angular';
import _ from 'lodash';

import {quoteString} from './utils';

export class HeroicQueryCtrl extends QueryCtrl {
  static templateUrl = 'public/app/plugins/datasource/heroic/partials/query.editor.html';

  private testFilter;

  constructor($scope, $injector, private uiSegmentSrv, private templateSrv) {
    super($scope, $injector);

    // count in progress, show spinner
    $scope.countingSeries = false;
    // current series count
    $scope.seriesCount = null;
    // current set of matching tags
    $scope.seriesTags = null;
    // current query error
    $scope.queryError = 'no query';
    // if query is valid or not
    $scope.validQuery = false;

    $scope.$watch('ctrl.target.query', query => {
      if (!query) {
        return;
      }

      this.validateQuery($scope, query);
    });

    this.testFilter = _.debounce(($scope, filter: any[]) => {
      $scope.countingSeries = true;

      this.datasource.seriesCount(filter).then(data => {
        $scope.seriesCount = data.data.count;
      }).finally(() => $scope.countingSeries = false);

      this.datasource.tags(filter).then(data => {
        $scope.seriesTags = data.data.tags;
      });
    }, 1000);
  }

  validateQuery($scope, query: String) {
    this.datasource.validateQuery(query).then(data => {
      $scope.queryError = null;
      $scope.validQuery = true;
      this.testFilter($scope, data.data.filter);
    }, data => {
      $scope.queryError = data.data.message;
      $scope.validQuery = false;
    });
  }

  addTag(key: String, value: String) {
    this.target.query += "\n  and " + quoteString(key) + " = " + quoteString(value);
  }
}
