import { React, useState } from 'react';
import gradient from 'random-gradient';
import { store } from 'react-notifications-component';

import { ReactComponent as Lock } from '../assets/icons/lock.svg';

import 'animate.css';

export default function Card(props) {
  const [decryptedData, setDecryptedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const decryptData = () => {
    setLoading(true);
    window.ethereum
      .request({
        method: 'eth_decrypt',
        params: [props.data, props.user],
      })
      .then((decryptedMessage) => {
        setLoading(false);
        setDecryptedData(JSON.parse(decryptedMessage));
        notify(
          'Decryption successful',
          'Document decrypted successfully',
          'success'
        );
      })
      .catch((error) => {
        notify(
          'Decryption failed',
          'Please sign the transaction to decrypt the document',
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
    <div
      style={{
        background: gradient(`${props.issuer + props.name}`),
      }}
      className='w-96 h-56 m-4 rounded-xl text-gray-100 shadow-md transition-transform transform hover:scale-105 hover:shadow-2xl'
    >
      <div className='w-full p-6 absolute'>
        <div className='flex justify-center'>
          <p className='font-medium text-xl'>{props.name}</p>
        </div>
        <div className='flex flex-col'>
          <div className='flex justify-between'>
            <p className='font-normal text-gray-200'>Issued by</p>
            <p className='font-normal'>{props.issuerUname}</p>
          </div>
          <div className='flex justify-between'>
            <p className='font-normal text-gray-200'>Issued on</p>
            <p className='font-normal'>
              {new Date(props.dateOfIssue * 1000).toLocaleString()}
            </p>
          </div>
          {decryptedData ? (
            decryptedData.map((ele, i) => (
              <div key={i} className='flex justify-between'>
                <p className='font-normal text-gray-200'>{ele.fieldLabel}</p>
                <p className='font-normal'>{ele.fieldValue}</p>
              </div>
            ))
          ) : (
            <div className='flex justify-center items-center mt-1 h-24 bg-white bg-opacity-25 rounded-md'>
              <button
                name='decrypt'
                id='decrypt'
                onClick={decryptData}
                className='flex items-center justify-between p-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                <Lock className='h-4 w-4' />
                <span className='ml-1'>{`${
                  loading ? 'Decrypting' : 'Decrypt document'
                }`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
