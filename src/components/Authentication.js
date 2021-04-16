import React, { useState, useEffect } from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import auth from '../utils/auth';

import Spinner from '../components/Spinner';
import { ReactComponent as Key } from '../assets/icons/key.svg';

import 'react-notifications-component/dist/theme.css';
import 'animate.css';

export default function Authentication(props) {
  const [username, setUsername] = useState('');
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState('');
  const [pubKey, setPubKey] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated()) {
      props.history.push('/dashboard');
    }
    if (!auth.getContract()) {
      auth.init().then(() => {
        setContract(auth.getContract());
        setAddress(auth.getUser());
      });
    } else {
      setContract(auth.getContract());
      setAddress(auth.getUser());
    }
  }, [props.history]);

  useEffect(() => {
    if (contract) {
      initialize();
    }
  }, [contract]);

  const initialize = () => {
    window.ethereum.on('accountsChanged', async (accounts) => {
      window.location.reload();
    });

    contract.events.UserRegistered(
      { filter: { user: auth.getUser() } },
      (err, result) => {
        if (err) {
          return console.error(err);
        }
        notify('Register', 'Registration successful', 'success');
      }
    );
  };

  const getPubKey = () => {
    window.ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [address], // you must have access to the specified account
      })
      .then((result) => {
        setPubKey(result);
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          notify(
            'Access denied',
            'We cannot encrypt your documents without public encryption key',
            'danger'
          );
        } else {
          console.error(error);
        }
      });
  };

  const handleRegistration = () => {
    if (username === '') {
      notify('Invalid username', 'Username cannot be empty', 'danger');
    } else if (pubKey === '') {
      notify(
        'Invalid key',
        'We need your public encryption key to encrypt your documents',
        'danger'
      );
    } else {
      auth.register(pubKey, username);
    }
  };

  const handleLogin = () => {
    if (username === '') {
      notify('Invalid username', 'Username cannot be empty', 'danger');
    } else {
      auth.login(username).then((message) => {
        if (auth.isAuthenticated()) {
          props.history.push('/dashboard');
        } else {
          notify('Login failed', message, 'danger');
        }
      });
    }
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

  if (!contract) {
    return <Spinner />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-Poppins'>
      <ReactNotification />
      <div className='max-w-md w-full space-y-8'>
        <div>
          <img
            className='mx-auto h-12 w-auto'
            src='https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg'
            alt='Workflow'
          />
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <div className='shadow overflow-hidden rounded-md'>
          <div className='px-4 py-5 bg-white sm:p-10'>
            <div className='pb-7 border-b-2 border-gray-200'>
              <label className='block text-sm font-medium text-gray-700'>
                Address
              </label>
              <input
                type='text'
                disabled
                value={address}
                className='mt-1 select-none cursor-not-allowed disabled:opacity-50 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
              />
              <label className='mt-2 block text-sm font-medium text-gray-700'>
                Username<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                autoComplete='off'
                value={username}
                spellCheck={false}
                onChange={(e) => setUsername(e.target.value)}
                className='mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
              />
              <button
                name='login'
                onClick={handleLogin}
                className='mt-4 p-3 w-full shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Login
              </button>
            </div>
            <div className='pt-5'>
              <div className='flex'>
                <div className='w-full'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Public encryption key<span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='password'
                    disabled
                    value={pubKey}
                    className='mt-1 select-none cursor-not-allowed text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
                  />
                </div>
                <button
                  name='key'
                  onClick={getPubKey}
                  className='mt-6 ml-3 h-10 p-2 shadow-sm text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <Key className='h-6 w-6 text-white' />
                </button>
              </div>
              <button
                name='register'
                onClick={handleRegistration}
                className='mt-4 p-3 w-full shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
