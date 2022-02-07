import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import arrowDown from '../img/arrow-down.png';  
import axios from "axios";
import Zoom from 'react-reveal/Zoom';


class Factory extends Component {
    

    state = { 
        assets: ['wait'],
        modalOpen: false,
        selectedAsset : 'Select an asset',
        submitButtonVisible: false,
        errorButtonVisible: false,
        errorButtonMessage:"",
        USDTBalance: 0,
        chooseAssetModalOpen: false,
        assets: [],
        filteredAssets: [],
    }

    async componentDidMount() {
        //if (this.props.USDTAllowance != 'undefined') {this.setState({USDTAllowance:this.props.USDTAllowance})}

        this.setState({
            USDTAllowance: this.props.USDTAllowance,
            assetDetails: this.props.assetDetails,
            USDTBalance: this.props.USDTBalance,
        });
        if (this.state.USDTAllowance != "0"){
            this.setState({approvalButtonVisible: false});
            this.setState({confirmButtonVisible: true});
            this.setState({confirmButtonBlockedVisible: false})
        }
        else {
            this.setState({approvalButtonVisible: true});
            this.setState({confirmButtonVisible: false});
            this.setState({confirmButtonBlockedVisible: true})
            }
    };




    openModal = async () => {
       
        if (this.props.USDTAllowance != "0"){
            this.setState({approvalButtonVisible: false});
            this.setState({confirmButtonVisible: true});
            this.setState({confirmButtonBlockedVisible: false})
        }
        else {
            this.setState({approvalButtonVisible: true});
            this.setState({confirmButtonVisible: false});
            this.setState({confirmButtonBlockedVisible: true})
            }
        
        let selectedAsset = this.state.selectedAsset;
        let investmentAmount = document.getElementById('amountToStake').value
        let AssetDetails  = await this.props.assetFactory.methods.getAsset(selectedAsset).call()
        let upperLimit = parseFloat(AssetDetails.upperLimit)/1000
        let tokenAmount = investmentAmount / upperLimit
        console.log("Token amount:",tokenAmount)
        console.log(AssetDetails)
        this.setState({ modalOpen: true })
        this.setState({ tokenAmount})
        
        this.setState({selectedAsset})
    };

    closeModal = () => this.setState({ modalOpen: false });

    confirmTransaction = async() => {
        this.closeModal()
        let result = await this.approveAccount()
        console.log(result)
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        await this.mintAssets(this.state.selectedAsset,document.getElementById('amountToStake').value)
        
        document.getElementById('amountToStake').value = 0
        //this.props.closeMessageBox()
        
    }

    mintAssets = async(symbol,mintAmount) =>{  
        console.log("Minting assets",this)
        let decimals = this.props.web3.utils.toBN(parseInt(this.props.USDDecimals)-3);
        let amount = this.props.web3.utils.toBN(parseInt(mintAmount*1000));
        let value = amount.mul(this.props.web3.utils.toBN(10).pow(decimals));
        //value = this.props.web3.utils.toBN(parseInt(mintAmount*10e18));
        console.log(mintAmount)
        console.log(value)

        let gasPrice = 10000000000;
        try {
          const result = await axios.get("https://gasstation-mainnet.matic.network/");
          console.log(result.data);
          gasPrice = (parseInt(result.data['standard'])+2)*1000000000;
          console.log(gasPrice)
        } 
        catch (error) {
          console.error(error);
        }

        try{
            //const result = await this.props.assetFactory.methods.mintAssets(symbol,value).send({from: this.props.address, gasPrice: gasPrice,})
            this.props.assetFactory.methods.mintAssets(symbol,value).send({from: this.props.address, gasPrice: gasPrice,})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                if (receipt.status === true) {
                    await this.props.updateAssetBalance(symbol);
                    await this.props.loadUSDBalance();
                    this.props.closeMessageBox();   
                    }
                else {
                    this.props.closeMessageBox();
                    let message = "Transaction failed"
                    this.props.openMessageBox(message);
                    await this.props.sleep(5000)
                    this.props.closeMessageBox();   

                }
                   
            })
        }
        catch(e){
            console.log(e['message'])
            if (e['message'].includes('not mined within 50 blocks') ==!true) {
                let message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }  
        }
            

      }

    
    approveAccount = async() =>{  
        console.log("Approving USDC",this)
        let message = "Approving to spend Tokens"
        this.props.openMessageBox(message)
        const addressTo = this.props.assetFactory._address;
        let amount = this.props.web3.utils.toWei(document.getElementById('amountToStake').value);
        const allowance = await this.props.USDT.methods.allowance(this.props.address, addressTo).call()
        console.log('Allowance: ',allowance)
        if (parseInt(allowance) > parseInt(amount)){
            this.setState({approvalButtonVisible: false})
            this.setState({confirmButtonVisible: true});
            this.setState({confirmButtonBlockedVisible: false})
            this.props.closeMessageBox()
            return
        }
        

        let value = this.props.web3.utils.toBN(2).pow(this.props.web3.utils.toBN(256)).sub(this.props.web3.utils.toBN(2))
        
        let gasPrice = 10000000000;
        try {
          const result = await axios.get("https://gasstation-mainnet.matic.network/");
          console.log(result.data);
          gasPrice = (parseInt(result.data['standard'])+2)*1000000000;
          console.log(gasPrice)
        } 
        catch (error) {
          console.error(error);
        }
        try{
            await this.props.USDT.methods.approve(addressTo,value).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                this.setState({USDTAllowance: value});
                this.setState({approvalButtonVisible: false});
                this.setState({confirmButtonVisible: true});
                this.setState({confirmButtonBlockedVisible: false})
                this.props.closeMessageBox();      
            })
        }
        catch(e){
            console.log(e['message'])
            if (e['message'].includes('not mined within 50 blocks') ==!true) {
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }  
        }
        await this.props.checkUSDAllowanceAssetFactory()
        console.log(this.state)
        this.changeAmount();
        this.props.closeMessageBox()
        return ("Approved")
    };

    setMaxAmount = async() =>{
        let amount = 0
        if (typeof(this.props.USDTBalance) != 'undefined'){ 
            amount = parseInt(this.props.USDTBalance)
        }
        document.getElementById('amountToStake').value = amount
        this.changeAmount()
        return
    };

    changeAmount = async() =>{
        console.log("amount")
        let amount = document.getElementById('amountToStake').value;
        console.log(amount)
        console.log(parseInt(this.props.USDTAllowance))
        if (amount * (10**this.props.USDDecimals) < parseInt(this.props.USDTAllowance)) {
            this.setState({approvalButtonVisible: false})
        }
        else {
            this.setState({approvalButtonVisible: true})
        }
        if (amount <= parseInt(this.props.USDTBalance) && this.state.approvalButtonVisible===false && this.state.selectedAsset !== "Select an asset" && amount>0) {
            this.setState({submitButtonVisible: true})
            this.setState({errorButtonVisible: false})
        }
        else if (amount > parseInt(this.props.USDTBalance) && this.state.approvalButtonVisible===false) {
            this.setState({submitButtonVisible: false})
            this.setState({errorButtonVisible: true})
            this.setState({errorButtonMessage: "Balance too low"})
        }
        else {
            this.setState({submitButtonVisible: false})
        }

    }

    openChooseAssetModal=()=>{
        let assets = [];
        for (let key in this.props.assetDetails) {
            if (this.props.assetDetails[key]['frozen'] === false){

                let balance1 = this.props.assetDetails[key]['tokenBalance1'];
                let balance2 = this.props.assetDetails[key]['tokenBalance2'];
                let asset = [key,balance1,balance2, this.props.assetDetails[key]['name'], this.props.assetDetails[key]['upperLimit']];
                assets.push(asset);
                console.log(asset)
            }
            
        }

        this.setState({chooseAssetModalOpen: true })
        this.setState({assets:assets})
        this.setState({filteredAssets: assets})  

        
    };
    closeChooseAssetModal=()=>{
        this.setState({chooseAssetModalOpen: false })
    }

    listMintableAssets() {
        let assetOptions = this.state.filteredAssets.map((element,index) =>
                <li key={index} className="list-group-item selectAssetItem" role="button" onClick={()=>this.selectAsset(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[3]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Balance: {this.props.outputNumber(element[1],4)} (long) / {this.props.outputNumber(element[2],4)} (short)</div>
                        <div className="col text-right">UL: {this.props.outputNumber(element[4]/1000,0)} USDC</div>
                    </div>
                </li>
        );
        return(assetOptions)
    }

    filterAssets(){
        let filteredAssets =[];
        let searchTerm = document.getElementById('search').value.toLowerCase()
        for (let i = 0; i < this.state.assets.length; ++i) {
            if (this.state.assets[i][3].toLowerCase().includes(searchTerm) || this.state.assets[i][0].toLowerCase().includes(searchTerm)){
                filteredAssets.push(this.state.assets[i])
            }
            
        }
        this.setState({filteredAssets:filteredAssets})


    }

    selectAsset = async(asset) =>{
        document.getElementById('amountToStake').value = 0
        await this.setState({"selectedAsset":asset});
        this.closeChooseAssetModal();
    };

    render() { 
        
              
        return ( 
            
            <div className="row w-100">
                <div className="container-fluid m-3">

                    <Modal show={this.state.chooseAssetModalOpen} onHide={this.closeChooseAssetModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select ISSUAA Asset pair to mint</Modal.Title>   
                        </Modal.Header>
                        
                        <Modal.Body className="bg-tgrey" style={{
                          maxHeight: 'calc(100vh - 210px)',
                          overflowY: 'auto'
                         }} 
                        >
                            <div className="row p-3 pr-3 my-auto">
                                <input type="text" placeholder="0" className="col w-100 bg-innerBox" id="search" placeholder="Search" onChange={() =>this.filterAssets()}></input>
                                
                            </div>
                            <ul className="list-group">
                                {this.listMintableAssets()}
                            </ul>
                        </Modal.Body>                        
                    </Modal>

                    <Modal show={this.state.modalOpen} onHide={this.closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>You will receive:</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>{this.props.outputNumber(parseFloat(this.state.tokenAmount),4)} {this.state.selectedAsset} (long) and i{this.state.selectedAsset}(short) tokens.</Modal.Body>
                        <Modal.Footer>
                            {this.state.approvalButtonVisible ? <div><Button variant="accent" id="buttonRounded"onClick={this.approveAccount}>Approve</Button></div> : <div></div>}
                            {this.state.confirmButtonVisible ? <div><Button variant="fuchsia" id="buttonRounded"onClick={this.confirmTransaction}>Convert</Button></div> : <div></div>}
                            {this.state.confirmButtonBlockedVisible ? <div><Button variant="anthracite" id="buttonRounded">Convert</Button></div> : <div></div>}
                            
                        </Modal.Footer>
                    </Modal>

                    <Zoom>
                    <div className="row">
                        <div className="col"></div>
                        
                        <div id="mainBox" className="col-5 container text-light p-2">
                            <div id="innerBoxUp"  className="container p-4 text-light bg-darkpurple rounded-top border-top border-right border-left border-dark">
                                <div className="w-100 text-left pb-3">
                                    Pay in USDC and mint ISSUAA Asset tokens (long and short)
                                </div>
                                <div id="innerBox" className="container p-4 text-black bg-innerBox">                                
                                    <div className="row">
                                        <div className="col mb-2">Select an ISSUAA Asset pair to mint:</div>
                                        <Button className="btn my-auto btn-accent w-100 mx-3 my-2" id="buttonRounded" onClick={this.openChooseAssetModal}>
                                            <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                        </Button>
                                    </div>


                                </div>
                                <div className="container p-4 bg-darkpurple">
                                
                                </div>
                                
                                <div id="innerBox" className="container p-4 text-black bg-innerBox">  
                                    <div className="row">
                                        <div className="col">USDC amount to pay in:</div>
                                        <div onClick={this.setMaxAmount} role="button" className="col align-self-end textBalance" key={this.props.USDTBalance}>Balance: <span className="tradeBalance">{typeof(this.props.USDTBalance) != 'undefined' ? this.props.outputNumber(parseInt(this.props.USDTBalance),0)+" USDC (Max)" : ''}</span></div>
                                    </div>
                                    <div className="input-group mb-3">
                                        <input placeholder="0.00" className="form-control bg-innerBox" type='text' id='amountToStake' onChange={this.changeAmount}></input>
                                            
                                    </div>
                                    
                                </div>
                                
                            </div>    
                            
                            <div id="innerBoxDown"  className="container px-4 pr-4 pt-4 py-2 text-black bg-darkpurple rounded-bottom">
                                {this.state.approvalButtonVisible ? <Button className="btn btn-fuchsia w-100 mb-2" variant="warning" id="buttonRounded" onClick={this.approveAccount}>Approve</Button> : <div></div>}
                                {this.state.errorButtonVisible ? <Button className="btn btn-fuchsia w-100 mb-2" variant="warning" id="buttonRounded">{this.state.errorButtonMessage}</Button> : <div></div>}
                                {this.state.submitButtonVisible ? <Button className="btn btn-fuchsia w-100 mb-2" id="buttonRounded" onClick={this.openModal}>Submit</Button> : <div></div>}
                            </div>
                        </div>
                        <div className="col"></div>
                    </div>
                    </Zoom>
                    
                </div>
            </div>
            
         );
    }
}
 
export default Factory;