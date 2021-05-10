import React, { Component } from 'react';
import ReactNotification from 'react-notifications-component';

import auth from '../utils/auth';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import Navbar from './Navbar';
import Card from './Card';
import Spinner from './Spinner';
import { ReactComponent as NoDocs } from '../assets/no_docs.svg';

export default class Dashboard extends Component {
  state = {
    user: null,
    contract: null,
    documents: null,
  };

  componentDidMount() {
    if (!auth.getContract()) {
      auth.init().then(() => {
        this.initialize();
      });
    } else {
      this.initialize();
    }
  }

  initialize = () => {
    window.ethereum.on('accountsChanged', async function (accounts) {
      auth.logout(() => {
        this.props.history.push('/');
      });
    });

    this.setState(
      { user: auth.getUser(), contract: auth.getContract() },
      () => {
        this.fetchDocuments();
        this.state.contract.events.DocumentIssued(
          { filter: { owner: this.state.user }, fromBlock: 'latest' },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
            this.fetchDocuments();
          }
        );
      }
    );
  };

  fetchDocuments = async () => {
    // Get documents from contract.
    await this.state.contract.methods
      .getDocuments()
      .call({ from: this.state.user })
      .then(
        ({ 0: issuer, 1: issuerUname, 2: dateOfIssue, 3: name, 4: data }) => {
          const documents = [];
          for (let index = 0; index < issuer.length; index++) {
            let ele = [
              issuer[index],
              issuerUname[index],
              dateOfIssue[index],
              name[index],
              data[index],
            ];
            documents.push(ele);
          }
          this.setState({ documents });
        }
      );
  };

  render() {
    return (
      <div>
        <Navbar user={this.state.user} history={this.props.history} />
        <ReactNotification className='font-Poppins' />
        <div className='mt-6 flex flex-wrap max-w-7xl mx-auto font-Poppins'>
          {!this.state.documents ? (
            <Spinner />
          ) : this.state.documents.length === 0 ? (
            <div className='flex flex-col w-full items-center justify-center'>
              <NoDocs className='h-96 w-96' />
              <p className='p-5 text-4xl font-medium'>No documents found!</p>
              <p className='text-xl'>
                Visit issuer's website to issue your document
              </p>
            </div>
          ) : (
            this.state.documents.map((ele, i) => {
              return (
                <Card
                  key={i}
                  issuer={ele[0]}
                  issuerUname={ele[1]}
                  dateOfIssue={ele[2]}
                  name={ele[3]}
                  data={ele[4]}
                  user={this.state.user}
                />
              );
            })
          )}
        </div>
      </div>
    );
  }
}
