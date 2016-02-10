///<reference path="../../../headers/common.d.ts" />

import angular from 'angular';

export function HeroicDatasource(instanceSettings, $q, backendSrv, templateSrv) {
  this.type = instanceSettings.type;
  this.url = instanceSettings.url;
  this.name = instanceSettings.name;
  this.supportMetrics = true;
  this.supportAnnotations = true;

  this.testDatasource = function() {
    return this.doRequest('/status').then(function(data) {
      var service = data.data.service;

      return {
        status: "success",
        message: "OK: " + JSON.stringify(service),
        title: "Success"
      };
    });
  };

  this.query = function(options) {
    var queries = {};
    var targets = {};

    for (var i = 0; i < options.targets.length; i++) {
      var target = options.targets[i];
      var query = templateSrv.replace(target.query);
      var id = String(i);
      queries[id] = {query: query, features: ['com.spotify.heroic.distributed_aggregations']};
      targets[id] = target;
    }

    var data = {
      queries: queries,
      range: {
        type: "absolute",
        start: options.range.from.valueOf(),
        end: options.range.to.valueOf()
      }
    };

    return this.doRequest('/query/batch', {method: 'POST', data: data}).then(data => {
      var converter = function(d) {
        return [d[1], d[0]];
      };

      var output = [];

      var results = data.data.results;

      for (var k in results) {
        var groups = results[k].result;
        var target = targets[k];

        for (var i = 0, l = groups.length; i < l; i++) {
          var group = groups[i];

          var name;

          var scoped = this.buildScoped(group);
          name = templateSrv.replaceWithText(target.alias || "A Series", scoped);
          output.push({target: name, datapoints: group.values.map(converter)});
        }
      }

      return {data: output};
    });
  };

  this.buildScoped = function(group) {
    var scoped = {};

    for (var tk in group.tagCounts) {
      scoped[tk] = {text: "<" + group.tagCounts[tk] + ">"};
      scoped[tk + "_count"] = {text: "<" + group.tagCounts[tk] + ">"};
    }

    for (var t in group.tags) {
      scoped[t] = {text: group.tags[t]};
      scoped[t + "_count"] = {text: "<" + 1 + ">"};
    }

    for (var s in group.shard) {
      scoped[s] = {text: group.shard[s]};
      scoped[s + "_count"] = {text: "<" + 1 + ">"};
    }

    return scoped;
  };

  this.seriesCount = function(filter: any[]) {
    return this.doRequest('/metadata/series-count', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {filter: filter}
    });
  };

  this.validateQuery = function(query: String) {
    // convert query using template.
    query = templateSrv.replace(query);

    return this.doRequest('/parser/parse-query', {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      data: query
    });
  };

  this.doRequest = function(path: String, options: any) {
    options = options || {};
    options.url = this.url + path;
    options.inspect = {type: 'heroic'};
    return backendSrv.datasourceRequest(options);
  };
}
