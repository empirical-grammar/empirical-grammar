'use strict'

  import Data from './data/data'
  import Params from './params'

 export default  function () {

  var _modules = {
    data:   new Data(),
    params: new Params()
  }

  // data, options -> ajaxParams
  this.process = function (data, resourceNameSingular, resourceNamePlural, options) {
    return _.compose(
      _modules.params.process(data.id, resourceNamePlural, options),
      _modules.data.process(resourceNameSingular, options)
    )(data)
  }
}
