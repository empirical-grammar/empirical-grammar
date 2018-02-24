import React from 'react';
import { shallow, mount } from 'enzyme';

import TeacherAccount from '../TeacherAccount.jsx';
import StaticDisplaySubscription from '../../components/accounts/subscriptions/static_display_subscription';
import SelectSchool from '../../components/accounts/school/select_school';
import LoadingSpinner from '../../components/shared/loading_indicator.jsx'
import ButtonLoadingIndicator from '../../components/shared/button_loading_indicator.jsx'

describe('TeacherAccount container', () => {
  // Sadly, we have to mount here instead of using shallow
  // because the TeacherAccount container uses quite a few
  // refs for input fields. In order to test these, we need
  // to use mount because shallow does not play with refs.
  const wrapper = mount(
    <TeacherAccount
      userType='teacher'
      teacherId={7}
    />
  );
  const wrapperStaff = mount(
    <TeacherAccount
      userType='staff'
    />
  );
  wrapper.setState({loading: false});
  wrapperStaff.setState({loading: false});

  it('should have the expected initial state', () => {
    expect(shallow(<TeacherAccount userType='arbitrary' teacherId={4} />).state()).toEqual({
      id: 4,
			name: '',
			username: '',
			email: '',
			isSaving: false,
			selectedSchool: null,
			originalSelectedSchool: null,
			schoolOptions: [],
			schoolOptionsDoNotApply: false,
			role: 'teacher',
			password: null,
			loading: true,
			errors: {},
			subscription: {
				id: null,
				expiration: '2016-01-01',
				account_limit: null
			}
    });
  });

  it('should render LoadingSpinner component if loading', () => {
    wrapper.setState({loading: true});
    expect(wrapper.find(LoadingSpinner).exists()).toBe(true);
    wrapper.setState({loading: false});
    expect(wrapper.find(LoadingSpinner).exists()).toBe(false);
  });

  describe('StaticDisplaySubscription component', () => {
    it('should render', () => {
      expect(wrapper.find(StaticDisplaySubscription).exists()).toBe(true);
    });

    it('should have subscription prop based on state', () => {
      wrapper.setState({subscription: {
        id: 3,
        expiration: '2017-04-28',
        account_limit: 1000
      }});
      expect(wrapper.find(StaticDisplaySubscription).props().subscription.id).toBe(3);
    });
  });

  describe('if the user uses google', () => {
    wrapper.setState({googleId: 7});
    describe('input with ref email', () => {
      it('should render', () => {
        expect(wrapper.ref('email')).toBeInstanceOf(HTMLInputElement);
      });

      it('should have class inactive', () => {
        expect(wrapperStaff.ref('email').className).toBe('inactive');
      });

      it('should have value depending on state', () => {
        wrapperStaff.setState({email: 'george@vandelay.industries'});
        expect(wrapperStaff.ref('email').value).toBe('george@vandelay.industries');
      });

      it.skip('should have readOnly flag', () => {
        //TODO: figure out how to test presence of readOnly flag
      });
    });
    wrapperStaff.setState({googleId: 7});
    describe('if the user is staff', () => {
      describe('input with ref email', () => {
        it('should render', () => {
          expect(wrapper.ref('email')).toBeInstanceOf(HTMLInputElement);
        });

        it('should have class inactive', () => {
          expect(wrapperStaff.ref('email').className).toBe('inactive');
        });

        it('should have value depending on state', () => {
          wrapperStaff.setState({email: 'george@vandelay.industries'});
          expect(wrapperStaff.ref('email').value).toBe('george@vandelay.industries');
        });

        it.skip('should have readOnly flag', () => {
          //TODO: figure out how to test presence of readOnly flag
        });
      });
    });
  });

  describe('if the user does not use google', () => {
    wrapper.setState({googleId: null});
    describe('input with ref email', () => {
      it('should render', () => {
        expect(wrapper.ref('email')).toBeInstanceOf(HTMLInputElement);
      });

      it('have value based on state', () => {
        wrapper.setState({email: 'george@vandelay.industries'});
        expect(wrapper.ref('email').value).toBe('george@vandelay.industries');
      });

      it('should onChange prop that updates state', () => {
        wrapper.find({name:"email"}).simulate('change', {target: {value: 'cosmo@kramerica.industries'}});
        expect(wrapper.state().email).toBe('cosmo@kramerica.industries');
      });
    });
    it('should render email errors based on state', () => {
      wrapper.setState({errors: {email: 'I am error'}});
      expect(wrapper.text()).toMatch('I am error');
    });
  });

  describe('input with ref name', () => {
    it('should render', () => {
      expect(wrapper.ref('name')).toBeInstanceOf(HTMLInputElement);
    });

    it('should have value equal to state.name', () => {
      wrapper.setState({name: 'Cosmo Kramer'});
      expect(wrapper.ref('name').value).toBe('Cosmo Kramer');
    });

    it('should have an onChange event that changes state.name', () => {
      wrapper.find({name:"name"}).simulate('change', {target: {value: 'Cosmo'}});
      expect(wrapper.state().name).toBe('Cosmo');
    });
  });

  it('should render name errors based on state', () => {
    wrapper.setState({errors: {name: 'I am error'}});
    expect(wrapper.text()).toMatch('I am error');
  });

  describe('input of type password with ref password', () => {
    it('should render', () => {
      expect(wrapper.ref('password')).toBeInstanceOf(HTMLInputElement);
    });

    it('should have an onChange event that changes state.password', () => {
      wrapper.find({name:"password"}).simulate('change', {target: {value: 'bosco'}});
      expect(wrapper.state().password).toBe('bosco');
    });
  });

  it('should render password errors based on state', () => {
    wrapper.setState({errors: {password: 'I am error'}});
    expect(wrapper.text()).toMatch('I am error');
  });

  describe('SelectSchool component', () => {
    it('should render', () => {
      expect(wrapper.find(SelectSchool).exists()).toBe(true);
    });

    it('should have errors prop depending on state', () => {
      wrapper.setState({errors: {school: 'Error!'}});
      expect(wrapper.find(SelectSchool).props().errors).toBe('Error!');
    });

    it('should have selectedSchool prop based on state', () => {
      wrapper.setState({selectedSchool: {foo: 'bar'}});
      expect(wrapper.find(SelectSchool).props().selectedSchool.foo).toBe('bar');
    });

    it('should have schoolOptions prop based on state', () => {
      wrapper.setState({schoolOptions: [{zipcode: 10005}]});
      expect(wrapper.find(SelectSchool).props().schoolOptions[0].zipcode).toBe(10005);
    });

    it.skip('should have requestSchools prop that fires ajax call to schools.json', () => {
      // TODO: write this test once we switch over to request from jQuery
    });

    it('should have updateSchool prop that changes state', () => {
      wrapper.find(SelectSchool).props().updateSchool({foo: 'baz'});
      expect(wrapper.state().selectedSchool.foo).toBe('baz');
    });
  });

  describe('save button', () => {
    it('should render', () => {
      expect(wrapper.find('button').filterWhere(e => e.text() == 'Save Changes').exists()).toBe(true);
    });

    describe.skip('onClick prop', () => {
      //TODO: write these tests once we implement requestjs
    });

    it('should have class button-grey if state.isSaving or button-green if not', () => {
      wrapper.setState({isSaving: false});
      expect(wrapper.find('button').filterWhere(e => e.text() == 'Save Changes').props().className).toBe('save-button button-green');
      // we can no longer use a filterWhere on text to check for the button-grey class
      // because the button no longer has text when it is loading
      // as of 6/27/17, this is the only gray button that ever appears on the page
      wrapper.setState({isSaving: true});
      expect(wrapper.find('.button-grey')).toHaveLength(1)
    });

    it('should render a ButtonLoadingIndicator if state.isSaving and not if not', () => {
      wrapper.setState({isSaving: false});
      expect(wrapper.find(ButtonLoadingIndicator)).toHaveLength(0)
      wrapper.setState({isSaving: true});
      expect(wrapper.find(ButtonLoadingIndicator)).toHaveLength(1)
    });

  });

  describe('delete button', () => {
    it('should render', () => {
      expect(wrapper.find('.delete-account').exists()).toBe(true);
    });

    describe.skip('onClick prop', () => {
      //TODO: write these tests once we implement requestjs
    });
  });

});
