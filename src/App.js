//import logo from './logo.svg';
import axios from "axios";
import metamaskLogo from '../src/img/metamaskLogo.svg'
import backgroundgraphic from '../src/img/Webdesign_background04.png'
import Web3 from 'web3';
import logo from './img/ISSUAA_Logo_grey2D2D2D.png';
//import './App.css';
import {Component} from 'react';
import React from 'react';
//import {useState} from 'react';
import { Modal} from "react-bootstrap";
import { OverlayTrigger, Overlay, Tooltip, Button, ToggleButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {USDC_h, HND_USDC_h} from './config';
import {ERC20_ABI, USDC_ABI, HNDFarm, listHarmony} from './config';
import Zoom from 'react-reveal/Zoom';

import Mainpage from './components/Mainpage';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer'; 
import MessageBox from './components/MessageBox';






class App extends Component{
  constructor(props) {
    super(props)
    this.changeView = this.changeView.bind(this)
    this.showAccount = this.showAccount.bind(this)
    this.loadBlockchainData = this.loadBlockchainData.bind(this)
    this.openMessageBox = this.openMessageBox.bind(this)
    this.closeMessageBox = this.closeMessageBox.bind(this)
    this.timeStampToDate = this.timeStampToDate.bind(this)
    this.timeStampToDateAndTime = this.timeStampToDateAndTime.bind(this)
    this.changeGlobalState = this.changeGlobalState.bind(this)
    this.outputNumber = this.outputNumber.bind(this)
    this.sleep = this.sleep.bind(this)
    this.roundDown = this.roundDown.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)

    
  }
  
  changeView(page) {
    this.setState({activePage:page})
  }

  showAccount(){
    this.setState({showAccount:true})
  }

  state = {
    activePage: 'mainpage',  
    messageBoxVisible: false,
    messageBoxContent: '',
    loggedOut: true,
    wrongNetworkMessage: false,
    showAccount: false,
    copyToClipboardText: "Copy to clipboard",
    v1ButtonColor: "fuchsia",
    v2ButtonColor: "accent",
  }

  async componentDidMount() {
    // Detect Metamask
    const metamaskInstalled = typeof window.web3 !== 'undefined'
    this.setState({ 
      metamaskInstalled,
      
    })
    //
    window.ethereum.on('chainChanged', (_chainId) => this.handleChainChanged());
    window.ethereum.on('accountsChanged', (_accounts) => this.loadBlockchainData());
  }

  changeGlobalState(_stateVariable, _state) {
    this.setState({_stateVariable:_state})
  }  

  handleChainChanged = async() => {
    window.location.reload();
  }

  timeStampToDate(timestamp) {
    var date = new Date(timestamp * 1000)
    const options = {year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = date.toLocaleDateString(options);
    return(formattedDate);
  }
  timeStampToDateAndTime(timestamp) {
    var date = new Date(timestamp * 1000)
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    let formattedDate = date.toLocaleDateString(options);
    const optionsTime = {hour: '2-digit', minute: '2-digit'};
    let formattedTime = date.toLocaleTimeString([],optionsTime);
    return(formattedDate+" "+formattedTime);
  }

  async getGasPrice() {
    let gasPrice = 300000000000;
    try {
      if (this.state.chain === 'Polygon'){
        let result = await axios.get("https://gasstation-mainnet.matic.network/");
        gasPrice = (parseInt(result.data['standard'])+2)*1000000000;
        return (gasPrice)
      }
      else if (this.state.chain === 'MaticTestnet'){
        let result = await axios.get("https://gasstation-mumbai.matic.today/");
        gasPrice = (parseInt(result.data['standard'])+2)*1000000000;
        return (gasPrice)
      }

      else {return (2000000000)}      
    } 
    catch (error) {
      console.error(error);
      return (gasPrice)
    }

      
    
  }

  outputNumber(number, digits){
    number = parseFloat(number) * (10**digits)
    number = Math.round(number) / (10**digits)
    let output = number.toLocaleString('en-US',{minimumFractionDigits: digits})
    return (output)
  }

  async sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  } 

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      // DO NOTHING...
      //this.loadBlockchainDataPreMM();
    }
    let chainId = (window.web3.givenProvider.chainId)
    console.log(chainId)
    /*if (chainId === "0x1") {
      this.setState({chain:"Mainnet"})
      return false
    }
    */
    if (chainId === "0x89") {
      this.setState({web3_nm: new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com/'))})
      this.setState({chain:"Polygon"})
      return true
    }

    else if (chainId === "0x63564c40") {
      this.setState({web3_nm: new Web3(new Web3.providers.HttpProvider('https://api.s0.t.hmny.io'))})
      this.setState({chain:"Harmony"})
      this.setState({farmList : listHarmony})
      console.log (this.state.farmList)
      return true
    }
    
        
    else  {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        });
        
        this.setState({web3_nm: new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com/'))})
        this.setState({chain:"Polygon"})
        return true;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        console.log(switchError)
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{ 
                chainId: '0x89', 
                chainName: 'Polygon',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'] 
              }],
            });
            
            this.setState({chain:"Polygon"})
            return true;
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }


      
    }
  }

  async loginWeb3() {
    if(this.state.metamaskInstalled) {
      let result = await this.loadWeb3();
      console.log("LOAD DEBUG 1")
      if (result) {
        this.setState({loggedOut: false});
        await this.loadBlockchainData();
      }
      else {
        console.log("Wrong Network")
        this.setState({wrongNetworkMessage: true})
        this.setState({loggedOut: false});
        console.log("Wrong network. Please switch to Polygon / Matic")
      }
      
    }
  }



  async loadBlockchainData() {
    const web3 = window.web3
    this.setState({web3})
    // Load account
    const account = await web3.eth.getCoinbase()
    this.setState({ account })
    const addressShort = account.slice(0,6)+"..."+account.slice(38-42)
    this.setState({addressShort})
    //const networkId = await web3.eth.net.getId()

    this.setState({loadingBlockchainData: true})

    this.setState({loadingBlockchainData: false})
    


    // Load the different contracts
    
    
    

    const web3_nm = await this.state.web3_nm;
    console.log(web3_nm)
    this.setState({web3_nm})
    console.log(this.state.chain)
    let farmList = this.state.farmList
    let enhancedFarmList = []
    
    for (let farmIndex in farmList) {
      let farm = farmList[farmIndex]
      let USDCBalance = 0;
      let farmAddress = farmList[farmIndex][3]
      let farmContract = new this.state.web3.eth.Contract(HNDFarm,farmAddress);
      let tokenContract = new this.state.web3.eth.Contract(HNDFarm,farmList[farmIndex][4]);
      console.log(farmAddress)
      
      USDCBalance = await farmContract.methods.USDBalanceOf(this.state.account).call();
      let decimals = await tokenContract.methods.decimals().call();
      console.log(parseInt(USDCBalance))
      
      farm.push(parseFloat(USDCBalance/(10**decimals-1)))
      enhancedFarmList.push(farm)
      console.log(enhancedFarmList)    
    };

    console.log(enhancedFarmList)
    console.log(this.state.farmList)
    this.setState({farmList: enhancedFarmList})  
    


    
  }

  addNetworkMaticTestnet = async() => {
    let result = await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
      chainId: '0x13881',
      chainName: 'Matic Testnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
      blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/']
      }]
    })
    .catch((error) => {
    console.log(error)
    return(false)
    }) 
    return (true)
  }

  openMessageBox(message){
    this.setState({messageBoxVisible: true, messageBoxContent:message})
  }

  closeMessageBox(){
    this.setState({messageBoxVisible: false})
  }

  closeAccountModal = () => this.setState({ showAccount: false });


  copyToClipboard(text){
    console.log("Debug")
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  };
 
  timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  };

  async copyAddress(){
    this.copyToClipboard(this.state.account)
    this.setState({copyToClipboardText: "Copied"})
    await this.timeout(1000)
    this.setState({copyToClipboardText: "Copy to clipboard"})

  }
roundDown = (n,d) => {
        n = Math.floor(n*(10**d))
    
        n = n/(10**d)
        return n
    }

  render(){
    
    return (
      


      <div className="container-fluid bg-mainbackground h-100 p-0">
        <div className="image">
          <img src={backgroundgraphic} alt="ISSUAA" width="100%"/>
          <div className="row mainContent text-light">
            <Navbar 
              address={this.state.account}
              addressShort={this.state.addressShort}
              changeView ={this.changeView}
              chainName = {this.state.chain}
              showAccount = {this.showAccount}
              outputNumber = {this.outputNumber}
              sleep = {this.sleep}
              switchVersion = {this.switchVersion}
            />

            <Footer 
              address={this.state.account}
              changeView ={this.changeView}
            />

            {this.state.activePage === 'mainpage' 
              ? 
              <Mainpage
              address = {this.state.account}
              web3 = {this.state.web3}
              farmList = {this.state.farmList}
              ERC20_ABI = {ERC20_ABI}
              Farm_ABI = {HNDFarm}
              roundDown = {this.roundDown}
              
              openMessageBox = {this.openMessageBox}
              closeMessageBox = {this.closeMessageBox}
              outputNumber = {this.outputNumber}
              sleep = {this.sleep}
              getGasPrice = {this.state.getGasPrice}
              />
              :
              ''
            }
            
            {this.state.messageBoxVisible ? <MessageBox content={this.state.messageBoxContent}/> : ''}

            <div className="container">
            <div>&nbsp;</div> 
            <div>&nbsp;</div> 
            <div>&nbsp;</div> 
            <div>&nbsp;</div> 
            
          </div>
          </div>
        </div>

        
 
        <Modal show={this.state.showAccount} onHide={this.closeAccountModal} centered>
          <Modal.Header closeButton>
            <h5 className="align-middle">Account</h5>
          </Modal.Header>
          <Modal.Body closeButton>
            <div className="rounded-2">
              <div className="row">
                <div className="col">
                  <div className="h4">{this.state.addressShort}</div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="btn btn-accent" onClick={()=>this.copyAddress()}>
                        {this.state.copyToClipboardText}
                  </div>
                </div>
                <div className="col">
                  <a className="btn btn-fuchsia text-dark" href={''+(this.state.chain === "MaticTestnet" ? "https://mumbai." : "https://")+'polygonscan.com/address/'+this.state.account} target="_blank">
                    View on polygonscan
                  </a>
                </div>
              </div>
                 
                  
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={this.state.loggedOut} dialogClassName="mainModal">
          <Modal.Header>
            <Modal.Title>Log in please:</Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            <div id="selectMain">
              <a role="button" onClick={() =>this.loginWeb3()}>
                <img src={metamaskLogo} alt="Metamask" height="100"/>
              </a>
            </div>
          </Modal.Body>
          
          
        </Modal>  
        


        <Modal className ="rounded" show={this.state.loadingBlockchainData} centered>
          
          <div className="p-3 bg-nav text-light border border-accent">
            <div className="row">
              <div className="col">
                <img src={logo} alt="Logo" height="160"/>
              </div>
                
              <div className="row">
                <div className="col h5 m-5">
                  <div className="spinner-border text-accent m-3" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
                <div className="col h5 m-5">
                  Loading Blockchain data...
                </div>
                
              </div>
              
                
            </div>
          </div>
 
        </Modal>

        <Modal className = "rounded" show={this.state.wrongNetworkMessage}>
          
          <div className="p-3 bg-dark text-light border border-accent rounded">
            <div className="row m-4"></div>
            <div className="row">
              <div className="col text-center">
                <p>Wrong Network selected.</p>
                Please switch to Polygon or Polygon Mumbau Testnet.
              </div>
            </div>
            <div className="row m-4"></div>
          </div>
 
        </Modal>



        
    </div>
      
    )
    

  } 
}

export default App;