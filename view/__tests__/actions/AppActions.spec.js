import AppActions from '../../src/actions/AppActions'
import ActionTypes from '../../src/constants/ActionTypes'

describe('Test for AppActions', function () {

  it('reset app page', function () {
    expect(AppActions.resetAppPage().type).toBe(ActionTypes.RESET_APP_PAGE);
  });

  it('set app page current view', function () {
    let action = AppActions.setAppPageCurrentView('view')
    expect(action.type).toBe(ActionTypes.SET_APP_PAGE_CURRENT_VIEW);
    expect(action.view).toEqual('view');
  });

  it('set app page next view', function () {
    let action = AppActions.setAppPageNextView('view')
    expect(action.type).toBe(ActionTypes.SET_APP_PAGE_NEXT_VIEW);
    expect(action.view).toEqual('view');
  });

  it('set app page current children', function () {
    let action = AppActions.setAppPageCurrentChildren('edit')
    expect(action.type).toBe(ActionTypes.SET_APP_PAGE_CURRENT_CHILDREN);
    expect(action.children).toEqual('edit');
  });

  it('set app page switch alert', function () {
    let action = AppActions.setAppPageSwitchAlert(true)
    expect(action.type).toBe(ActionTypes.SET_APP_PAGE_SWITCH_ALERT);
    expect(action.show).toEqual(true);
  });

});
