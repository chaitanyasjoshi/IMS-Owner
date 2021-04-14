import { React, useState } from 'react';
import multiavatar from '@multiavatar/multiavatar';
import { store } from 'react-notifications-component';

import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import { ReactComponent as Lock } from '../assets/icons/lock.svg';
import { ReactComponent as Check } from '../assets/icons/check.svg';
import { ReactComponent as Cross } from '../assets/icons/cross.svg';
import { ReactComponent as Revoke } from '../assets/icons/revoke.svg';

export default function Request(props) {
  const [decryptedData, setDecryptedData] = useState(null);

  const decryptData = () => {
    window.ethereum
      .request({
        method: 'eth_decrypt',
        params: [props.properties, props.user],
      })
      .then((decryptedMessage) => {
        setDecryptedData(JSON.parse(decryptedMessage));
        notify(
          'Decryption successful',
          'Request decrypted successfully',
          'success'
        );
      })
      .catch((error) => {
        notify(
          'Decryption failed',
          'Please sign the transaction to decrypt the request',
          'danger'
        );
      });
  };

  const notify = (title, message, type) => {
    store.addNotification({
      title: title,
      message: message,
      type: type, // 'default', 'success', 'info', 'warning'
      container: 'top-right', // where to position the notifications
      animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
      animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
      dismiss: {
        duration: 3000,
        showIcon: true,
        pauseOnHover: true,
      },
    });
  };

  return (
    <tr>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <span
              className='h-10 w-10 rounded-full'
              dangerouslySetInnerHTML={{
                __html: multiavatar(props.requestor),
              }}
            />
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>
              {props.requestor}
            </div>
            <div className='text-sm text-gray-500'>{props.requestorUname}</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm font-medium text-gray-900'>{props.docName}</div>
      </td>
      {decryptedData ? (
        <td className='px-6 py-4 whitespace-nowrap'>
          {decryptedData.map((ele, i) => (
            <div key={i} className='grid grid-cols-2 gap-6'>
              <p className='text-sm text-gray-600 col-span-1'>{ele.label}</p>
              <p className='text-sm text-gray-600 text-right col-span-1'>
                {ele.expValue ? 'Verify' : 'Access'}
              </p>
            </div>
          ))}
        </td>
      ) : (
        <td className='px-6 py-4 whitespace-nowrap'>
          <button
            name='decrypt'
            id='decrypt'
            onClick={decryptData}
            className='flex items-center justify-between py-1 px-2 m-auto border border-transparent shadow-sm text-sm rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            <Lock className='h-4 w-4' />
            <span className='ml-1'>Decrypt request</span>
          </button>
        </td>
      )}
      <td className='px-6 py-4 whitespace-nowrap text-center'>
        <span
          className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            props.status === 'Requested'
              ? 'bg-yellow-100 text-yellow-800'
              : props.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {props.status}
        </span>
      </td>

      <td className='pr-6 py-4 text-right whitespace-nowrap'>
        {props.status === 'Requested' ? (
          <button
            className='bg-green-100 p-1 rounded-full text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Approved',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : notify(
                    'Status updation failed',
                    'Decrypt request data to update request status',
                    'danger'
                  );
            }}
          >
            <span className='sr-only'>Approve</span>
            {/* Heroicon name: outline/check */}
            <Check className='h-6 w-6' />
          </button>
        ) : (
          ''
        )}
        {props.status === 'Requested' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Declined',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : notify(
                    'Status updation failed',
                    'Decrypt request data to update request status',
                    'danger'
                  );
            }}
          >
            <span className='sr-only'>Decline</span>
            {/* Heroicon name: outline/x-circle */}
            <Cross className='h-6 w-6' />
          </button>
        ) : (
          ''
        )}
        {props.status === 'Approved' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Revoked',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : notify(
                    'Status updation failed',
                    'Decrypt request data to update request status',
                    'danger'
                  );
            }}
          >
            <span className='sr-only'>Revoke</span>
            {/* Heroicon name: outline/exclamation-circle */}
            <Revoke className='h-6 w-6' />
          </button>
        ) : (
          ''
        )}
      </td>
    </tr>
  );
}
