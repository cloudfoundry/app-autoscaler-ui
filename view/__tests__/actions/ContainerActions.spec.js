import ContainerActions from '../../src/actions/ContainerActions'
import ActionTypes from '../../src/constants/ActionTypes'

describe('Test for ContainerActions', function () {

  it('set app id', function () {
    let action = ContainerActions.setAppId('xxx')
    expect(action.type).toBe(ActionTypes.SET_CONTAINER_APP_ID);
    expect(action.appId).toBe('xxx');
  });

  it('set service id', function () {
    let action = ContainerActions.setServiceId('xxx')
    expect(action.type).toBe(ActionTypes.SET_CONTAINER_SERVICE_ID);
    expect(action.serviceId).toBe('xxx');
  });
  
});
