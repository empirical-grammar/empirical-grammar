EC.RelatedUnitTemplates = React.createClass({
  propTypes: {
    models: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired
  },

  miniView: function(model, index) {
    var className;
    if (index === 0) {
      className = 'col-xs-6 no-pr';
    } else {
      className = 'col-xs-6 no-pl';
    }
    return (
      <div className={className}>
        <EC.UnitTemplateMini data={model} key={model.id} actions={this.props.actions} index={index}/>
      </div>
    );
  },

  render: function() {
    var displayedId = this.props.data;
    var relatedModels = _.reject(this.props.models, function(other) {
      return other.id === displayedId;
    });
    var cols = _.map(relatedModels.slice(0, 2), this.miniView);
    return (
      <span>
        <div className='row'>
          <div className='col-xs-12 no-pl'>
            <h2>
              Related Activity Packs:
            </h2>
          </div>
        </div>
        <div className='row'>
          {cols}
        </div>
      </span>
    );
  }
});
