import React from 'react';
import {mount} from 'enzyme';

import {Client} from 'app/api';
import AccountSecurityEnroll from 'app/views/settings/account/accountSecurity/accountSecurityEnroll';

const ENDPOINT = '/users/me/authenticators/';

describe('AccountSecurityEnroll', function() {
  let wrapper;

  describe('Totp', function() {
    Client.clearMockResponses();
    let authenticator = TestStubs.Authenticators().Totp({
      isEnrolled: false,
      qrcode: [[1, 0]],
      secret: 'secret',
      form: [
        {
          type: 'string',
          name: 'otp',
        },
      ],
    });

    beforeAll(function() {
      Client.addMockResponse({
        url: `${ENDPOINT}${authenticator.authId}/enroll/`,
        body: authenticator,
      });
      wrapper = mount(
        <AccountSecurityEnroll />,
        TestStubs.routerContext([
          {
            router: {
              ...TestStubs.router(),
              params: {
                authId: authenticator.authId,
              },
            },
          },
        ])
      );
    });

    it('does not have enrolled circle indicator', function() {
      expect(wrapper.find('CircleIndicator').prop('enabled')).toBe(false);
    });

    it('has qrcode component', function() {
      expect(wrapper.find('Qrcode')).toHaveLength(1);
    });

    it('can enroll', function() {
      let enrollMock = Client.addMockResponse({
        url: `${ENDPOINT}${authenticator.authId}/enroll/`,
        method: 'POST',
      });

      wrapper.find('input[name="otp"]').simulate('change', {target: {value: 'otp'}});
      wrapper.find('Form').simulate('submit');
      expect(enrollMock).toHaveBeenCalledWith(
        `${ENDPOINT}15/enroll/`,
        expect.objectContaining({
          method: 'POST',
          data: expect.objectContaining({
            secret: 'secret',
            otp: 'otp',
          }),
        })
      );
    });
  });
});
