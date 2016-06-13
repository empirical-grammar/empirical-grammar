'use strict';

'use strict'

 import React from 'react'

 export default  React.createClass({
	propTypes: {
		tab: React.PropTypes.string.isRequired
	},

	select: function (tab) {
		var that = this;
		return function () {
			that.props.toggleTab(tab)
		}
	},

	render: function () {
		var classes = {createUnit: '', exploreActivityPacks: '', manageUnits: ''}
		classes[this.props.tab] = 'active';
		// put the below into the list to activate activity packs
		// <li onClick={this.select('exploreActivityPacks')}><a className={classes.exploreActivityPacks}>Explore Activity Packs</a></li>
		return (
			<div className="unit-tabs tab-subnavigation-wrapper">
				<div className="container">
					<ul>
						<li onClick={this.select('manageUnits')}><a className={classes.manageUnits}>My Activity Packs</a></li>
						<li onClick={this.select('exploreActivityPacks')}><a className={classes.exploreActivityPacks}>Featured Activity Packs</a></li>
						<li onClick={this.select('createUnit')}><a className={classes.createUnit}>Create an Activity Pack</a></li>
					</ul>
				</div>
			</div>
		);
	}


});
