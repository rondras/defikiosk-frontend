import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import arrowDown from '../img/arrow-down.png';  
import axios from "axios";

import Zoom from 'react-reveal/Zoom';

class EasyFarm extends Component {
    

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
        successButton1: false,
        step3Visible: false,
        step4Visible: false,
        approveButtonRouterLongToken: false,
        approveButtonRouterShortToken: false,
        approveButtonRouterUSDC: false,
        poolLongTokenButton:false,
        poolShortTokenButton:false,
        poolLongSuccessButton: false,            
        poolShortSuccessButton: false,
        selectAssetButtonVisible: true,
        inputFieldVisible: true,
        refreshButtonVisible: false,

    }

    async componentDidMount() {
        
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

    mintAssets = async() =>{  
        console.log("Minting assets",this)
        let symbol = this.state.selectedAsset;
        let mintAmount = parseFloat(document.getElementById('amountToStake').value)*this.state.upperLimit/(this.state.upperLimit + this.state.priceLong + this.state.priceShort);
        let decimals = this.props.web3.utils.toBN(parseInt(this.props.USDDecimals)-3);
        let amount = this.props.web3.utils.toBN(parseInt(mintAmount*1000));
        let value = amount.mul(this.props.web3.utils.toBN(10).pow(decimals));
        let farmAmount = parseFloat(document.getElementById('amountToStake').value)
        this.setState({farmAmount})

        let assetTokenAmt = this.props.roundDown(mintAmount/this.state.upperLimit,14);
        this.setState({assetTokenAmt})
        //let poolAmountLong = assetTokenAmt * this.state.priceLong;
        //await this.setState({poolAmountLong});
        
        //value = this.props.web3.utils.toBN(parseInt(mintAmount*10e18));
        console.log(mintAmount)
        console.log(value)

        let gasPrice = await this.props.getGasPrice();
        console.log(gasPrice)
        

        try{
            let message = "Minting long and short assets";
            this.props.openMessageBox(message)
            //const result = await this.props.assetFactory.methods.mintAssets(symbol,value).send({from: this.props.address, gasPrice: gasPrice,})
            this.props.assetFactory.methods.mintAssets(symbol,value).send({from: this.props.address, gasPrice: gasPrice,})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                if (receipt.status === true) {
                    await this.props.updateAssetBalance(symbol);
                    await this.props.loadUSDBalance();
                    this.setState({successButton1:true});
                    this.setState({submitButtonVisible:false});
                    this.setState({step3Visible:true});
                    this.setState({selectAssetButtonVisible:false});
                    this.setState({inputFieldVisible:false});
                    
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
              
        
        
        
        //let result = await this.props.loadBlockchainData()
        
        await this.props.checkUSDAllowanceAssetFactory()
        console.log(this.state)
        this.changeAmount();
        this.props.closeMessageBox()
        return ("Approved")
    };

    approveRouterLongToken = async() =>{  
        let message = "Approving to spend your long Tokens"
        console.log(this.props.address)
        this.props.openMessageBox(message)
        const addressTo = this.props.MarketRouter_Address;

        let tokenAddressLong = await this.state.tokenAddressLong;
        let tokenContract = await new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddressLong);
        await this.setState({tokenContract})
        //console.log(this.state.tokenContract);
        //console.log(this.props.USDT)
        
        
        let value = this.props.web3.utils.toBN(2).pow(this.props.web3.utils.toBN(256)).sub(this.props.web3.utils.toBN(2))
        
        let gasPrice = 300000000000;
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
            console.log(addressTo);
            console.log(this.props.address);
            let addressFrom = this.props.address;
            console.log(addressFrom)

            //await this.props.USDT.methods.approve(addressTo,value).send({from: addressFrom, gasPrice: gasPrice})
            await this.state.tokenContract.methods.approve(addressTo,value).send({from: addressFrom, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                this.setState({approveButtonRouterLongToken: false});
                if (this.state.approveButtonRouterUSDC === false) {this.setState({poolLongTokenButton:true})};
                
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
        this.props.closeMessageBox()
        return ("Approved")
    };

    approveRouterShortToken = async() =>{  
        let message = "Approving to spend your short Tokens"
        this.props.openMessageBox(message)
        const addressTo = this.props.MarketRouter_Address;

        let tokenAddressShort = await this.state.tokenAddressShort;
        let tokenContract = await new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddressShort);
        //await this.setState({tokenContract})
        
        
        let value = this.props.web3.utils.toBN(2).pow(this.props.web3.utils.toBN(256)).sub(this.props.web3.utils.toBN(2))
        
        let gasPrice = 300000000000;
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
            console.log(addressTo);
            console.log(this.props.address);
            let addressFrom = this.props.address;
            console.log(addressFrom)

            //await this.props.USDT.methods.approve(addressTo,value).send({from: addressFrom, gasPrice: gasPrice})
            await tokenContract.methods.approve(addressTo,value).send({from: addressFrom, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                this.setState({approveButtonRouterShortToken: false});
                if (this.state.approveButtonRouterUSDC === false) {this.setState({poolShortTokenButton:true})};
                
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
        this.props.closeMessageBox()
        return ("Approved")
    };

    approveRouterUSDC = async() =>{  
        let message = "Approving to spend your USDC Tokens"
        this.props.openMessageBox(message)
        const addressTo = this.props.MarketRouter_Address;
        let value = this.props.web3.utils.toBN(2).pow(this.props.web3.utils.toBN(256)).sub(this.props.web3.utils.toBN(2))
        
        let gasPrice = 300000000000;
        try {
          const result = await axios.get("https://gasstation-mainnet.matic.network/");
          gasPrice = (parseInt(result.data['standard'])+2)*1000000000;
                  } 
        catch (error) {
          console.error(error);
        }
        try{
            let addressFrom = this.props.address;
            await this.props.USDT.methods.approve(addressTo,value).send({from: this.props.address, gasPrice: gasPrice})

            .on('receipt', async (receipt) => {
                console.log(receipt)
                this.setState({approveButtonRouterUSDC: false});
                if (this.state.approveButtonRouterShortToken === false) {this.setState({poolLongTokenButton:true})};                
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
        this.props.closeMessageBox()
        return ("Approved")
    };

    getAssets() {
        let assets = this.props.assets;
        console.log(assets)
        //this.setState({assets: assets})
        return assets;

    }

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
        this.changeAmount();
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
        await this.setState({"selectedAsset":asset});
        console.log(this.props.assetDetails[asset]);
        let tokenAddressLong = this.props.assetDetails[asset]['Token1'];
        this.setState({tokenAddressLong});      
        let tokenAddressShort = this.props.assetDetails[asset]['Token2'];
        this.setState({tokenAddressShort});     

        let upperLimit = this.props.assetDetails[asset]['upperLimit']/1000;
        this.setState({upperLimit}); 

        let priceLong = this.props.assetDetails[asset]['priceLong'];
        this.setState({priceLong}); 
        let priceShort = this.props.assetDetails[asset]['priceShort'];
        this.setState({priceShort}); 

        let approvalRouterUSDC = await this.checkApproval(this.props.MarketRouter_Address,this.props.USDT_Address);
        if (approvalRouterUSDC === false) {this.setState({approveButtonRouterUSDC:true})}
        
        let approvalRouterLongToken = await this.checkApproval(this.props.MarketRouter_Address,tokenAddressLong);
        if (approvalRouterLongToken === false) {this.setState({approveButtonRouterLongToken:true})}
        
        let approvalRouterShortToken = await this.checkApproval(this.props.MarketRouter_Address,tokenAddressShort);
        if (approvalRouterShortToken === false) {this.setState({approveButtonRouterShortToken:true})};
        
        if (approvalRouterUSDC && approvalRouterLongToken) {this.setState({poolLongTokenButton:true})};
        if (approvalRouterUSDC && approvalRouterShortToken) {this.setState({poolShortTokenButton:true})};
        this.closeChooseAssetModal();
    };

    checkApproval = async(_address, tokenAddress) =>{
        console.log(_address);
        console.log(this.props.address)
        let tokenContract = await new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddress);
        let allowance = await tokenContract.methods.allowance(this.props.address, _address).call();
        //console.log(allowance);
        if (allowance > 9999999 * 10e18) {return true}
        else {return (false)};
    };

    reset = async() =>{
        this.setState({
            selectedAsset : 'Select an asset',
            successButton1: false,
            step3Visible: false,
            step4Visible: false,
            approveButtonRouterLongToken: false,
            approveButtonRouterShortToken: false,
            approveButtonRouterUSDC: false,
            poolLongTokenButton:false,
            poolShortTokenButton:false,
            poolLongSuccessButton: false,            
            poolShortSuccessButton: false,
            selectAssetButtonVisible: true,
            inputFieldVisible: true,
            refreshButtonVisible: false,
        })
    };

    addLiquidity = async (tokenA,tokenB,longSide) =>{
        let message = "Adding liquidity"
        this.props.openMessageBox(message)
        let tokenAmtA = 0
        let tokenAmtB = 0

        if (longSide) {
            tokenAmtA = this.state.assetTokenAmt
            let tokenContractA = await new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.tokenAddressLong);
            let balanceA = await tokenContractA.methods.balanceOf(this.props.address).call();
            tokenAmtA = Math.min(tokenAmtA,this.props.roundDown(balanceA / 1e18,14))

            console.log(this.state.priceLong)
            console.log(this.state.priceLong * tokenAmtA)
            tokenAmtB = this.state.priceLong * tokenAmtA
        }
        else{
            tokenAmtA = this.state.assetTokenAmt
            let tokenContractA = await new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.tokenAddressShort);
            let balanceA = await tokenContractA.methods.balanceOf(this.props.address).call();
            tokenAmtA = Math.min(tokenAmtA,this.props.roundDown(balanceA / 1e18,14))
            tokenAmtB = this.props.roundDown(this.state.priceShort * tokenAmtA, 14)
        }

        console.log(tokenAmtA)
        console.log(tokenAmtB)
        
        let amountADesiredRaw = this.props.web3.utils.toWei(tokenAmtA.toString(),'ether')
        let amountBDesiredRaw = 0
         if (this.props.USDDecimals === "6"){
            amountBDesiredRaw =  this.props.web3.utils.toWei(this.props.roundDown(tokenAmtB,6).toString(),'mwei')
            
        }
        else{
            let amountBDesiredRaw =  this.props.web3.utils.toWei(this.props.roundDown(tokenAmtB,14).toLocaleString(),'ether')
            
        }
        let amountADesired = this.props.web3.utils.toBN(amountADesiredRaw)
        let amountBDesired = this.props.web3.utils.toBN(amountBDesiredRaw)
        console.log(amountBDesired)  
        let amountAMin = amountADesired.mul(this.props.web3.utils.toBN(9)).div(this.props.web3.utils.toBN(100))

        let amountBMin = amountBDesired.mul(this.props.web3.utils.toBN(9)).div(this.props.web3.utils.toBN(100))
        console.log(amountBMin+'')

        let to = this.props.address;
        let deadline = Math.round(+new Date()/1000) + (60*10)

        try{
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
            await this.props.MarketRouter.methods.addLiquidity(tokenA, tokenB, amountADesired, amountBDesired,amountAMin,amountBMin, to, deadline).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
                if (receipt.status === true) {
                    console.log("Updating LP pair")
                    await this.props.updateAssetBalanceWithAddress(tokenA);
                    console.log("Balance updated")
                    await this.props.loadUSDBalance()
                    await this.props.updatePortfolioValue()
                    console.log("Portfolio value updated")
                    await this.props.updateLPPair(tokenA)
                    console.log("LP pair updated")
                    
                    if (longSide) {
                        await this.setState({step4Visible:true});
                        await this.setState({poolLongTokenButton:false})
                        await this.setState({poolLongSuccessButton:true})                      
                    }
                    else {
                        await this.setState({poolShortTokenButton:false})
                        await this.setState({poolShortSuccessButton:true})
                        await this.setState({refreshButtonVisible:true})
                    }
                    
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
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }            
        }
        
        
        
    }

    render() { 
        var AssetOptions = ['loading']
        var assets = this.getAssets();

        
        console.log(this.props)
        if (typeof(this.props.assets) != 'undefined'){
            console.log(typeof(assets))
            console.log(assets)
            AssetOptions = this.props.liveAssets
           
        }
        var listAssets = AssetOptions.map((asset,index) =>
            <option key={index} value={asset}>{asset}</option>
        );
              
        return ( 
            
            <div className="row w-100">
                <div className="container-fluid m-3">

                    <Modal show={this.state.chooseAssetModalOpen} onHide={this.closeChooseAssetModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select ISSUAA Asset pair to farm</Modal.Title>   
                        </Modal.Header>
                        
                        <Modal.Body className="bg-tgrey" style={{
                          maxHeight: 'calc(100vh - 210px)',
                          overflowY: 'auto'
                         }} 
                        >
                            <div className="row p-3 pr-3 my-auto">
                                <input type="text" placeholder="0" className="col w-100" id="search" placeholder="Search" onChange={() =>this.filterAssets()}></input>
                                
                            </div>
                            <ul className="list-group">
                                {this.listMintableAssets()}
                            </ul>
                        </Modal.Body>                        
                    </Modal>

                    
                    <Zoom>
                    <div className="row">
                        <div className="col"></div>
                        
                        <div id="mainBox" className="col-5 container text-light p-2">
                            <div id="innerBox"  className="container p-4 text-light bg-darkpurple border border-accent">
                                <div className="w-100 text-left pb-1">
                                    Step 1: Select an amount to invest into farming
                                </div>
                                {this.state.inputFieldVisible ?
                                    <div id="innerBox" className="container p-1 px-4 bg-innerBox border-right border-left rounded-bottom border-darkAccentx">  
                                        <div className="row">
                                            
                                            <div onClick={this.setMaxAmount}  role="button" className="col align-self-end textBalance" key={this.props.USDTBalance}>Balance: <span className="tradeBalance">{typeof(this.props.USDTBalance) != 'undefined' ? this.props.outputNumber(parseInt(this.props.USDTBalance),0)+" USDC (Max)" : ''}</span></div>
                                        </div>
                                        <div className="input-group mb-3 rounded">
                                            <input placeholder="0.00" className="form-control bg-innerBox " autoComplete="off" type='text' id='amountToStake' onChange={this.changeAmount}></input>
                                            <div style={{textAlign: 'right'}} className="pt-2 text-black">USDC</div>
                                        </div>
                                    </div>
                                    :
                                    <div id="innerBox" className="container p-1 px-4 text-black bg-innerBox border-right border-left rounded-bottom border-darkAccent">  
                                        <div className="row">
                                            
                                            <div className="col align-self-end text-black pt-2 pb-2">{this.state.farmAmount} USDC</div>
                                        </div>

                                    </div>
                                }
                                        

                                    
                                <div className="w-100 text-left p-2"></div>
                                <div className="w-100 text-left pb-1">
                                    Step 2: Select an ISSUAA Asset
                                </div>
                                <div id="innerBox" className="container p-1 pt-4 px-4 text-black bg-innerBox border-right border-left rounded-bottom border-darkAccent">  
                                    
                                    
                                                          
                                    {this.state.selectAssetButtonVisible ?
                                        <div className="row">
                                            <div className="btn my-auto btn-accent w-100 mx-3 my-1" id="buttonRounded" onClick={this.openChooseAssetModal}>
                                                <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                            </div>
                                        </div>
                                        :
                                        ''
                                    }
                                    <div className="row p-2"></div>
                                    
                                    
                                    <div className="row">
                                        {this.state.approvalButtonVisible ? <Button className="btn btn-fuchsia w-100 mb-2" id="buttonRounded" variant="warning" onClick={this.approveAccount}>Approve</Button> : <div></div>}
                                        {this.state.errorButtonVisible ? <Button className="btn btn-fuchsia w-100 mb-2" id="buttonRounded" variant="warning">{this.state.errorButtonMessage}</Button> : <div></div>}
                                        {this.state.submitButtonVisible ?<Button className="btn btn-fuchsia w-100 mb-2 mx-2" id="buttonRounded" onClick={this.mintAssets}>Mint Assets</Button> : <div></div>}
                                        {this.state.successButton1 ? <Button className="btn btn-accent w-100 mb-2" id="buttonRounded" variant="warning">Success!</Button> : <div></div>}
                                    </div>

                                </div>
                                {this.state.step3Visible ?
                                    <div className="w-100 text-left pt-3 pb-2">
                                        <div className="w-100 text-left pb-1">
                                            Step 3: Pool the long Asset token
                                        </div>
                                        <div id="innerBox" className="container p-1 px-4 text-black bg-innerBox border-right border-left rounded-bottom border-darkAccent">  
                                            
                                            
                                                                  
                                            
                                            <div className="row">
                                                {this.state.errorButton ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" id="buttonRounded" variant="warning">{this.state.errorButtonMessage}</Button> : <div></div>}
                                                {this.state.approveButtonRouterUSDC ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" id="buttonRounded" variant="warning" onClick={this.approveRouterUSDC}>Approve USDC</Button> : <div></div>}
                                                {this.state.approveButtonRouterLongToken ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" id="buttonRounded" variant="warning" onClick={this.approveRouterLongToken}>Approve long token</Button> : <div></div>}
                                                {this.state.poolLongTokenButton ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" id="buttonRounded" variant="warning" onClick={()=>this.addLiquidity(this.state.tokenAddressLong,this.props.USDT_Address,true)}>Pool the long token</Button> : <div></div>}
                                                {this.state.poolLongSuccessButton ? <Button className="btn btn-accent w-100 mb-2 mt-2" id="buttonRounded" variant="warning">Success!</Button> : <div></div>}
                                            </div>

                                        </div>
                                    </div>
                                    :
                                    ''
                                }
                                {this.state.step4Visible ?
                                    <div className="w-100 text-left pt-3 pb-2">
                                        <div className="w-100 text-left pb-1">
                                            Step 4: Pool the short Asset token
                                        </div>
                                        <div id="innerBox" className="container p-1 px-4 text-black bg-innerBox border-right border-left rounded-bottom border-darkAccent">  
                                            
                                            
                                                                  
                                            
                                            <div className="row">
                                                {this.state.errorButton ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" variant="warning">{this.state.errorButtonMessage}</Button> : <div></div>}
                                                {this.state.approveButtonRouterUSDC ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" variant="warning" onClick={this.approveAccount}>Approve USDC</Button> : <div></div>}
                                                {this.state.approveButtonRouterShortToken ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" variant="warning" onClick={this.approveRouterShortToken}>Approve short token</Button> : <div></div>}
                                                {this.state.poolShortTokenButton ? <Button className="btn btn-fuchsia w-100 mb-2 mt-2" variant="warning" onClick={()=>this.addLiquidity(this.state.tokenAddressShort,this.props.USDT_Address,false)}>Pool the short token</Button> : <div></div>}
                                                {this.state.poolShortSuccessButton ? <Button className="btn btn-accent w-100 mb-2 mt-2" variant="warning">Success!</Button> : <div></div>}
                                            </div>

                                        </div>
                                    </div>
                                    :
                                    ''
                                }

                                {this.state.refreshButtonVisible ?
                                    <div className="w-100 text-left pt-3 pb-2">
                                        
                                        <div id="innerBox" className="container p-1 px-4 text-black bg-innerBox border-right border-left rounded-bottom border-darkAccent">  
                                            
                                            
                                                                  
                                            
                                            <div className="row">
                                                <Button className="btn btn-fuchsia w-100 mb-2 mt-2" id="buttonRounded" variant="warning" onClick={this.reset}>Farm another asset!</Button>
                                                
                                            </div>

                                        </div>
                                    </div>
                                    :
                                    ''
                                }
                                
                                                                
                                
                                
                                
                                
                                
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
 
export default EasyFarm;