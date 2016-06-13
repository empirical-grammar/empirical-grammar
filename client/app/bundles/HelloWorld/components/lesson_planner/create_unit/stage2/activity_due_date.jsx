'use strict'

 import React from 'react'
 import $ from 'jquery'
  import _ from 'underscore'
  // import datepicker from '../../../shared/date_picker'

  import DatePicker from 'react-datepicker';
  import moment from 'moment';

   export default React.createClass({
      // displayName: 'Example',

      getInitialState: function() {
          return {startDate: moment()};
      },

      handleChange: function(date) {
          this.setState({startDate: date});
      },

      render: function() {
          return <DatePicker selected={this.state.startDate} onChange={this.handleChange}/>;
      }
  });


//   initializeDatePicker: function () {
//     $(this.refs.dueDate.getDOMNode()).datepicker({
//       selectOtherMonths: true,
//       dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
//       minDate: -20,
//       dateFormat: "mm-dd-yy",
//       altField: ('#railsFormatDate' + this.props.activity.id),
//       altFormat: 'yy-mm-dd',
//       onSelect: this.handleChange,
//
//     });
//   },
//
//   tooltipTrigger: function (e) {
//     e.stopPropagation();
//     this.refs.activateTooltip.getDOMNode().tooltip('show');
//
//   },
//   tooltipTriggerStop: function (e) {
//     e.stopPropagation();
//     this.refs.activateTooltip.getDOMNode().tooltip('hide');
//   },
//
//   handleChange: function(e) {
//     var x1 = '#railsFormatDate' + this.props.activity.id;
//     var dom = $(x1);
//     var val = dom.val();
//     this.props.assignActivityDueDate(this.props.activity, val);
//   },
//
//   removeActivity: function () {
//     this.props.toggleActivitySelection(this.props.activity, false);
//     this.initializeDatePicker();
//   },
//
//   render: function() {
//     return (
//       <tr>
//         <td>
//           <div ref='activateTooltip' className={'activate-tooltip ' + this.props.activity.classification.image_class } data-html='true' data-toggle='tooltip' data-placement='top' title={"<h1>" + this.props.activity.name + "</h1><p>App: " + this.props.activity.classification.alias + "</p><p>" + this.props.activity.topic.name +  "</p><p>" + this.props.activity.description + "</p>"}></div>
//         </td>
//         <td onMouseEnter={this.tooltipTrigger} onMouseLeave={this.tooltipTriggerStop} className='tooltip-trigger activity_name'>{this.props.activity.name}</td>
//         <td>
//           <input type="text" ref="dueDate" value={this.props.dueDate} className="datepicker-input" placeholder="mm/dd/yyyy" onChange={this.handleChange}/>
//           <input type="text" value={this.props.dueDate} className='railsFormatDate' id={"railsFormatDate" + this.props.activity.id} ref="railsFormatDate" onChange={this.handleChange} />
//         </td>
//         <td className="icon-x-gray" onClick={this.removeActivity}></td>
//       </tr>
//     );
//   }
// });
