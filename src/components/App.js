import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Payday from '../abis/Payday.json';
import NavBar from './NavBar';
import Main from './Main';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
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
      this.setState({ payday });

      const productCount = await payday.methods.productCount().call();
      this.setState({ productCount });

      // Load products
      for(let i = 1; i <= productCount; i++) {
        const product = await payday.methods.products(i).call();
        this.setState({ products: [...this.state.products, product] });
      }

      this.setState({ loading: false });
    } else {
      window.alert("The current network is not supported");
    }
  }

  createProduct(name, price) {
    this.setState({ loading: true });
    this.state.payday.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      });
  }

  purchaseProduct(id, price) {
    console.log("purchasing in progress...");
    this.setState({ loading: true });
    this.state.payday.methods
      .purchaseProduct(id)
      .send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <div className="col-lg-12 d-flex">
              { 
              
              this.state.loading
                ? 'Loading ...'
                : <Main 
                    products={this.state.products}
                    createProduct={this.createProduct}
                    purchaseProduct={this.purchaseProduct}
                />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
