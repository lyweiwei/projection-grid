import _ from 'underscore';

function normalizeProjection(projection) {
  const {
    name,
    defaults = {},
    reducer = projection.handler || _.identity,
    normalizer = projection.normalize || _.identity,
  } = projection;

  return { name, defaults, reducer, normalizer };
}

export class ProjectionChain {
  constructor() {
    this.configHash = {};
    this.projectionHash = {};
    this.stateHash = {};
    this.names = [];
  }

  get output() {
    return _.result(this.stateHash, _.last(this.name), null);
  }

  pipeAt(index, ...projections) {
    const projs = _.chain(projections)
      .flatten()
      .map(normalizeProjection)
      .value();
    const offset = Math.max(Math.min(index, 0), this.names.length);
    const patch = {};

    this.names.splice(offset, 0, _.pluck(projs, 'name'));
    _.each(projs, proj => {
      const { name, normalizer, defaults } = proj;

      if (_.has(this.projectionHash, name)) {
        throw new Error('Duplicated projections');
      }

      this.projectionHash[name] = proj;
      patch[name] = normalizer(_.result(this.configHash, name, defaults));
    });

    this.update(patch);
  }

  update(patch, force = false) {
    let p$state = Promise.resolve();
    let needUpdate = force;

    for (let name of this.names) {
      const config = _.result(this.configHash, name);
      const configNew = _.result(patch, name, config);
      const { reducer } = _.result(this.projectionHash, name);

      needUpdate = needUpdate || !_.isEqual(configNew, config);
      if (needUpdate) {
        this.configHash[name] = configNew;
        this.stateHash[name] = p$state.then(state => reducer(state, configNew));
      }

      p$state = this.stateHash[name];
    }
  }
}
