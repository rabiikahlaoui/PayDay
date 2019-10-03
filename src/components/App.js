import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Payday from '../abis/Payday.json';
import NavBar from './NavBar';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = Payday.networks[networkId];

    if (networkData) {
      const payday = web3.eth.Contract(Payday.abi, networkData.address);
    } else {
      window.alert("The current network is not supported");
    }
  }

  render() {
    return (
      <div>
        <NavBar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Welcome to Payday</h1>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
