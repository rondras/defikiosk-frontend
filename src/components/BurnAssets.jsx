import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import arrowDown from '../img/arrow-down.png';
import info from '../img/ISSUAA-i.png';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import axios from "axios";

import Zoom from 'react-reveal/Zoom';

class BurnAssets extends Component {
    
    constructor(props){
        super(props)
        this.state = { 
            assets: ['wait'],
            maxBurnableAmount: this.props.maxBurnableAmount,
            
            burnAmount: 0,
            amountToGet:0,
            tokenToBurn: '',
            burnAmountLong: 0,
            burnAmountShort: 0,
            amountToGetExpired:0,
            expiredTokenToBurn: '',
            style1: "col text-center bg-darkpurple text-light py-2",
            style2: "col text-center bg-darkAccent text-light py-2",
            chooseAssetModalOpen: false,
            chooseExpiredAssetModalOpen: false,
            selectedAsset: "Select Asset",
            selectedAssetExpired: "Select Asset",
            approvalButtonVisible1:false,
            approvalButtonVisible2:false,
            submitButtonVisible: false,
            burnableBalanceVisible: false,
            burnableBalanceToken1Visible: false,
            burnableBalanceToken2Visible: false,
            burnableBalanceToken1: 0,
            burnableBalanceToken2: 0,
            submitButtonDeactivated: false,
            submitButtonDeactivatedMessage: "",
            filteredAssetBurnOptions: [],
            assetBurnOptions: [],
            filteredAssetBurnOptionsExpired : [],
            AssetBurnOptionsExpired : [],
            
        }
        this.changeBurnableAmount = this.changeBurnableAmount.bind(this)

    }

    async componentDidMount() {
        let maxBurnableAmountLong;
        try {maxBurnableAmountLong = this.props.burnableExpiredAssets[0][1]}
        catch {maxBurnableAmountLong = 0}


            this.setState({
            assets: ['wait'],
            maxBurnableAmount: this.props.maxBurnableAmount,
            maxBurnableAmountLong: maxBurnableAmountLong,
            view: 'live',

        });
        
    };

    switchView = async() =>{
        if (this.state.view === "expired") 
            {this.setState ({view:'live'})} 
        else 
            {this.setState ({view:'expired'})}
    };

    selectLiveView = async() =>{
        this.setState ({view:'live'});
        this.setState({style1: "col text-center bg-darkpurple text-light py-2"});
        this.setState({style2: "col text-center bg-darkAccent text-light py-2"});
    }
    selectExpiredView = async() =>{
        this.setState ({view:'expired'});
        this.setState({style2: "col text-center bg-darkpurple text-light py-2"});
        this.setState({style1: "col text-center bg-darkAccent text-light py-2"});
    }

    openModal = async () => {
        console.log(this.props)
        
        let amountToBurn = document.getElementById('amountToBurn').value
        this.setState({burnAmount:amountToBurn})
        let AssetDetails  = await this.props.assetFactory.methods.getAsset(this.state.selectedAsset).call()
        let upperLimit = parseFloat(AssetDetails.upperLimit)/1000
        console.log(upperLimit)
        let amountToGet = upperLimit * amountToBurn
        this.setState({amountToGet:amountToGet})
        this.setState({ modalOpen: true })
        
        
    };
    closeModal = () => this.setState({ modalOpen: false });


   openModalBurnExpiredAssets = async () => {
        console.log(this.props)
        let selectedAsset = this.state.selectedAssetExpired
        this.setState({tokenToBurn:selectedAsset})
        let amountToBurnLong = parseFloat(document.getElementById('amountToBurnToken1').value)
        let amountToBurnShort = parseFloat(document.getElementById('amountToBurnToken2').value)
        this.setState({amountToBurnLong:amountToBurnLong})
        this.setState({amountToBurnShort:amountToBurnShort})
        let AssetDetails  = await this.props.assetFactory.methods.getAsset(selectedAsset).call()
        let upperLimit = AssetDetails.upperLimit/1000
        let expiryValue = AssetDetails.endOfLifeValue/1000
        console.log(expiryValue)
        let amountToGetExpired = expiryValue * amountToBurnLong + (upperLimit - expiryValue)*amountToBurnShort
        this.setState({amountToGetExpired:amountToGetExpired})
        this.setState({ modalBurnExpiredAssetsOpen: true })
        
    };
    closeModalBurnExpiredAssets = () => this.setState({ modalBurnExpiredAssetsOpen: false });

    handleChange(field,value){
        this.setState({[field]:value});
        let maxBurnableAmount = this.getMaxBurnAmount()
        this.setState({maxBurnableAmount});
        console.log(this.state)
    }

    handleChangeExpired(field,value){
        this.setState({[field]:value});
        let maxBurnableAmountLong = this.getMaxBurnAmountLong()
        let maxBurnableAmountShort = this.getMaxBurnAmountShort()
        this.setState({maxBurnableAmountLong});
        this.setState({maxBurnableAmountShort});
        console.log(this.state)
    }
    
    changeBurnableAmount(event) {
        console.log("Click")
        console.log(event)
    }


    roundDown = (n,d) => {
        n = Math.floor(n*(10**d))
    
        n = n/(10**d)
        return n
    }
    

    getMaxBurnAmount(){
        let selectedAsset = "";
        let maxBurnableAmount = 0;
        if (document.getElementById('selectAsset') != null){
            selectedAsset = document.getElementById('selectAsset').value
        }

        if (typeof(this.props.burnableAssets)!='undefined'){
            this.props.burnableAssets.forEach(function(element,index){
                if (element[0] === selectedAsset) {maxBurnableAmount=element[1]}
            }
            )
        }
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy[maxBurnableAmount] = maxBurnableAmount
        
        return maxBurnableAmount
    };

    getMaxBurnAmountLong(){
        let selectedAsset = "";
        let maxBurnableAmountLong = 0;
        if (document.getElementById('selectAssetExpired') != null){
            selectedAsset = document.getElementById('selectAssetExpired').value
        }

        if (typeof(this.props.burnableExpiredAssets)!='undefined'){
            this.props.burnableExpiredAssets.forEach(function(element,index){
                if (element[0] === selectedAsset) {maxBurnableAmountLong=element[1]}
            }
            )
        }
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy[maxBurnableAmountLong] = maxBurnableAmountLong
        
        return maxBurnableAmountLong
    };
    getMaxBurnAmountShort(){
        let selectedAsset = "";
        let maxBurnableAmountShort = 0;
        if (document.getElementById('selectAssetExpired') != null){
            selectedAsset = document.getElementById('selectAssetExpired').value
        }

        if (typeof(this.props.burnableExpiredAssets)!='undefined'){
            this.props.burnableExpiredAssets.forEach(function(element,index){
                if (element[0] === selectedAsset) {maxBurnableAmountShort=element[2]}
            }
            )
        }
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy[maxBurnableAmountShort] = maxBurnableAmountShort
        
        return maxBurnableAmountShort
    };
    
    approveAccount = async(contractAddress,approvalAmount) =>{  
        console.log("Approving Token",this)
        let message = "Approving to spend tokens"
        this.props.openMessageBox(message)
        const addressTo = this.props.assetFactory._address;
        var amountRaw = this.props.web3.utils.toWei(approvalAmount.toString(), 'ether')
        var amount = this.props.web3.utils.toBN(amountRaw)
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,contractAddress)
        const allowance = await tokenContract.methods.allowance(this.props.address, addressTo).call()
        if (parseInt(allowance) < parseInt(amount)){
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
                await tokenContract.methods.approve(addressTo,value).send({from: this.props.address, gasPrice: gasPrice})
                .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
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
        this.props.closeMessageBox()
        return ("Already approved")
    };

    approveToken1 = async(tokenAddress,approvalAddress) =>{
        await this.approve(tokenAddress,approvalAddress);
        this.setState({allowanceButtonVisible1: false});
        if (this.state.approvalButtonVisible2 === false){
            this.setState({submitButtonVisible: true})
        }
        if (this.state.view === 'live'){
            this.checkInputLive();
        }
        else {
            this.checkInputExpired();
        }

    }

    approveToken2 = async(tokenAddress,approvalAddress) =>{
        await this.approve(tokenAddress,approvalAddress);
        this.setState({approvalButtonVisible2: false});
        if (this.state.allowanceButtonVisible1 === false){
            this.setState({submitButtonVisible: true})
        }
        if (this.state.view === 'live'){
            this.checkInputLive();
        }
        else {
            this.checkInputExpired();
        }
    }

    approve = async(tokenAddress,approvalAddress) =>{  
        
        let message = "Approving to spend tokens"
        this.props.openMessageBox(message)
        
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddress)
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
            await tokenContract.methods.approve(approvalAddress,value).send({from: this.props.address, gasPrice:gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
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
    };

    setMaxAmount = async() =>{
        let amount = this.state.selectedAssetBurnableBalance / 1e18;
        console.log(amount);
        amount = this.roundDown(amount,14);
        document.getElementById('amountToBurn').value = amount;
        console.log(amount);
        this.checkInputLive();
        return
    }

    setMaxAmountToken1 = async() =>{
        let amount = this.state.burnableBalanceToken1 / 1e18;
        amount = this.roundDown(amount,14);
        //console.log(amount)
        document.getElementById('amountToBurnToken1').value = amount
        return
    }
    setMaxAmountToken2 = async() =>{
        let amount = this.state.burnableBalanceToken2 / 1e18;
        amount = this.roundDown(amount,14);
        
        document.getElementById('amountToBurnToken2').value = amount
        return
    }

    burnAssets = async(symbol,mintAmount) =>{  
        console.log("Burning assets",this)
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        console.log(mintAmount)
        this.props.openMessageBox(message)
        var amountRaw = this.props.web3.utils.toWei(mintAmount.toString(), 'ether')
        console.log(amountRaw)

        var amount = this.props.web3.utils.toBN(amountRaw)
        console.log(amount)
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
            await this.props.assetFactory.methods.burnAssets(symbol,amount).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
                    let newBalance = this.state.selectedAssetBurnableBalance - parseInt(amountRaw)
                    this.setState({selectedAssetBurnableBalance:newBalance})
                    await this.props.updateAssetBalance(symbol);
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
                if (e['message'].includes('not mined within 50 blocks') ==!true) {
                    message = e['message']
                    this.props.openMessageBox(message)
                    await this.props.sleep(5000)
                    this.props.closeMessageBox();
                    return
                }  
            }  
        }
        
    };

    confirmBurnTransaction = async() => {
        this.setState({ modalOpen: false })
        
        console.log(this.state)
        let burnAmount = document.getElementById('amountToBurn').value
        let token1Address = this.props.assetDetails[this.state.selectedAsset][0]
        let token2Address = this.props.assetDetails[this.state.selectedAsset][1]
        
        await this.approveAccount(token1Address,burnAmount)

        await this.approveAccount(token2Address,burnAmount)

        await this.burnAssets(this.state.tokenToBurn,burnAmount)

        await this.props.loadUSDBalance();
        await this.props.updateAssetBalanceWithAddress(token1Address);
        await this.props.updatePortfolioValue();

        document.getElementById('amountToBurn').value = 0
        this.setState({selectedAsset: "Select Asset"})
        
    }      
    burnExpiredAssets = async(symbol,amountLong, amountShort) =>{  
        console.log("Burning assets",this)
        console.log("Short amount", amountShort)
        console.log("Long amount", amountLong)

        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        var amountRawLong = this.props.web3.utils.toWei(amountLong.toString(), 'ether')
        var amountLongFinal = this.props.web3.utils.toBN(amountRawLong)
        let newBalanceLong = this.state.burnableBalanceToken1 - parseInt(amountRawLong)
        this.setState({burnableBalanceToken1:newBalanceLong})

        var amountRawShort = this.props.web3.utils.toWei(amountShort.toString(), 'ether')
        var amountShortFinal = this.props.web3.utils.toBN(amountRawShort)
        let newBalanceShort = this.state.burnableBalanceToken2 - parseInt(amountRawShort)
        this.setState({burnableBalanceToken2:newBalanceShort})

        console.log("Short amount", amountShortFinal)
        console.log("Long amount", amountLongFinal)
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
            await this.props.assetFactory.methods.burnExpiredAssets(symbol,amountLongFinal,amountShortFinal).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
                    await this.props.loadUSDBalance()
                    await this.props.updateAssetBalance(symbol)  
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
                
    };
    confirmBurnTransactionExpired = async() => {
        this.setState({ modalBurnExpiredAssetsOpen: false })
        
        let symbol = this.state.selectedAssetExpired
        let burnAmountLong = document.getElementById('amountToBurnToken1').value
        let burnAmountShort = document.getElementById('amountToBurnToken2').value
        let token1Address = this.props.assetDetails[symbol][0]
        let token2Address = this.props.assetDetails[symbol][1]
        
        await this.approveAccount(token1Address,burnAmountLong)
        await this.approveAccount(token2Address,burnAmountShort)

        await this.burnExpiredAssets(symbol,burnAmountLong, burnAmountShort)
    }  

    openChooseAssetModal=async()=>{
        let assets = [];

        for (let key in this.props.assetDetails) {
            if (this.props.assetDetails[key]['frozen'] === false) {
                let burnableBalance = Math.min(this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['tokenBalance2'])
                if (this.props.assetDetails[key].expiryTime > Date.now()/1000){
                    assets.push([key,burnableBalance,this.props.assetDetails[key]['name'],this.props.assetDetails[key]['upperLimit']])
                }
            }
            else{
                let burnableBalance = this.props.assetDetails[key]['tokenBalance1']
                assets.push([key,burnableBalance,this.props.assetDetails[key]['name'],this.props.assetDetails[key]['upperLimit']])
            }
        }

        await this.setState({ chooseAssetModalOpen: true })
        await this.setState({assetBurnOptions:assets})
        this.filterAssets();
        
        


        
    };

    closeChooseAssetModal=()=>{
        this.setState({ chooseAssetModalOpen: false })
    }  

    openChooseExpiredAssetModal=async()=>{
        let assets = [];
        for (let key in this.props.assetDetails) {
            let burnableBalance1 = this.props.assetDetails[key]['tokenBalance1']
            let burnableBalance2 = this.props.assetDetails[key]['tokenBalance2']
            if (this.props.assetDetails[key].expiryTime < Date.now()/1000){
                assets.push([key,burnableBalance1,burnableBalance2,this.props.assetDetails[key]['name'],this.props.assetDetails[key]['upperLimit']])
            }
        }
        await this.setState({ chooseExpiredAssetModalOpen: true })
        await this.setState({assetBurnOptionsExpired:assets})
        this.filterAssetsExpired()
        
        
    };

    closeChooseExpiredAssetModal=()=>{
        this.setState({ chooseExpiredAssetModalOpen: false })
    }  

    checkInputLive = async() =>{
        let amt = document.getElementById('amountToBurn').value*10e17;
        if (amt > this.state.selectedAssetBurnableBalance) {
            this.setState({
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Balance too low",
            });
        }
        else if (this.state.allowanceButtonVisible1 || this.state.approvalButtonVisible2){
            this.setState({
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Waiting for approval",
            });
        }
        else if (amt === 0){
            this.setState({
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Select an amount greater than 0",
            });
        }

        else {
            this.setState({
                submitButtonVisible: true,
                submitButtonDeactivated: false,
                
            });
        }
    }

    checkInputExpired = async() =>{
        let amt1 = document.getElementById('amountToBurnToken1').value*1e18;
        let amt2 = document.getElementById('amountToBurnToken2').value*1e18;

        if (amt1 > this.state.burnableBalanceToken1 || amt2 > this.state.burnableBalanceToken2) {
            this.setState({
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Balance too low",
            });
        }
        else if (this.state.allowanceButtonVisible1 || this.state.approvalButtonVisible2){
            this.setState({
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Waiting for approval",
            });
        }

        else {
            this.setState({
                submitButtonVisible: true,
                submitButtonDeactivated: false,
                
            });
        }
    }

    assetOutput() {
        if (this.state.view === "live") {
            return(
                <div id="innerBox" className="container pl-4 pr-4 py-2 text-black bg-innerBox">
                    <div className="row">
                        <div className="col-4 align-self-start">Input:</div>
                        <div className="col align-self-end text-lg-right">
                            {this.state.burnableBalanceVisible ? 
                                <div role="button">Balance available: <span className="tradeBalance textBalance" onClick={this.setMaxAmount}>{this.props.outputNumber(this.state.selectedAssetBurnableBalance/1e18,8)} (Max)</span></div>
                                :
                                <div></div>
                            }
                        </div>
                    </div>
                    <div className="row pr-3">
                        <div className="col">
                            <input id="amountToBurn" onChange={() =>this.checkInputLive()} className="form-control form-control-lg bg-innerBox text-black" type="number" placeholder="0"/>
                        </div>

                        <div className="btn my-auto btn-accent" id="buttonRounded" onClick={this.openChooseAssetModal}>
                            <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col align-self-start py-4">
                            {this.state.allowanceButtonVisible1 ? 
                                <button className="btn btn-fuchsia w-100 my-2" id="buttonRounded" onClick={()=>this.approveToken1(this.props.assetDetails[this.state.selectedAsset][0],this.props.assetFactory._address)}>Approve {this.state.selectedAsset}</button>
                                :
                                <div></div>
                            }
                            {this.state.approvalButtonVisible2 ? 
                                <button className="btn btn-fuchsia w-100 my-2" id="buttonRounded" onClick={()=>this.approveToken2(this.props.assetDetails[this.state.selectedAsset][1],this.props.assetFactory._address)}>Approve i{this.state.selectedAsset}</button>
                                :
                                <div></div>
                            }
                            {this.state.submitButtonDeactivated ? 
                                <button className="btn btn-nav w-100 my-2" id="buttonRounded">{this.state.submitButtonDeactivatedMessage}</button>
                                :
                                <div></div>
                            }
                            {this.state.submitButtonVisible ? 
                                <button className="btn btn-fuchsia w-100 my-2" id="buttonRounded" onClick={this.openModal}>Submit</button>
                                :
                                <div></div>
                            }

                        </div>    
                    </div> 
                    <p></p>
                </div>
                
            )
        }
        else {
            return(
                
                <div id="innerBox" className="container px-4 pr-4 py-2 text-black bg-innerBox">
                    <div className="row">
                        
                    </div>


                    <div className="row my-2">


                        <div className="btn my-auto btn-accent w-100 mx-3 my-2" id="buttonRounded" onClick={this.openChooseExpiredAssetModal}>
                            <div>{this.state.selectedAssetExpired} <img src={arrowDown} alt="switch" height="15"/>   </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col align-self-end text-lg-right textBalance">
                            {this.state.burnableBalanceToken1Visible ? 
                                <div>Balance available to burn: <span role="button" onClick={this.setMaxAmountToken1}>{this.props.outputNumber(this.state.burnableBalanceToken1/1e18,8)}</span></div>
                                :
                                <div></div>
                            }
                        </div>
                    </div>
                
                    {this.state.selectedAssetExpired !== "Select Asset" ?
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" for="amountToBurnToken1">Amount to convert {this.state.selectedAssetExpired}:</label>
                        </div>
                        <input className="form-control bg-innerBox" onChange={() =>this.checkInputExpired()} type='number' id='amountToBurnToken1' defaultValue={0}></input>
                        
                    </div>
                    :
                    ''
                    }   
                    
                    <div className="row">
                        <div className="col align-self-end text-lg-right textBalance">
                            {this.state.burnableBalanceToken1Visible ? 
                                <div>Balance available to burn: <span role="button" onClick={this.setMaxAmountToken2}>{this.props.outputNumber(this.state.burnableBalanceToken2/1e18,8)}</span></div>
                                :
                                <div></div>
                            }
                        </div>
                    </div>
                    
                    {this.state.selectedAssetExpired !== "Select Asset" ?
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" for="amountToBurnToken2">Amount to convert i{this.state.selectedAssetExpired}:</label>
                        </div>
                        <input className="form-control bg-innerBox" onChange={() =>this.checkInputExpired()} type='number' id='amountToBurnToken2' defaultValue={0}></input>
                        
                    </div>
                    :
                    ''
                    }   

                    
                    <div className="row">
                        <div className="col align-self-start py-4">
                            {this.state.allowanceButtonVisible1 ? 
                                <div id="buttonRounded"><button className="btn btn-fuchsia w-100 my-2" onClick={()=>this.approveToken1(this.props.assetDetails[this.state.selectedAssetExpired][0],this.props.assetFactory._address)}>Approve {this.state.selectedAssetExpired}</button></div>
                                :
                                <div></div>
                            }
                            {this.state.approvalButtonVisible2 ? 
                                <div id="buttonRounded"><button className="btn btn-fuchsia w-100 my-2" onClick={()=>this.approveToken2(this.props.assetDetails[this.state.selectedAssetExpired][1],this.props.assetFactory._address)}>Approve i{this.state.selectedAssetExpired}</button></div>
                                :
                                <div></div>
                            }
                            {this.state.submitButtonDeactivated ? 
                                <div id="buttonRounded"><button className="btn btn-accent w-100 my-2" id="submit">{this.state.submitButtonDeactivatedMessage}</button></div>
                                :
                                <div></div>
                            }
                            {this.state.submitButtonVisible ? 
                                <div id="buttonRounded"><button className="btn btn-fuchsia w-100 my-2" id="submit" onClick={this.openModalBurnExpiredAssets}>Submit</button></div>
                                :
                                <div></div>
                            }

                        </div>    
                    </div> 

                       
                </div>
                )
        }
        };     

    listBurnableAssets() {
        
        let burnableAssets = this.state.filteredAssetBurnOptions.map((element,index) =>
                <li key={index} className="list-group-item selectAssetItem" role="button" onClick={()=>this.selectAssetLive(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[2]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Burnable balance: {this.props.outputNumber(element[1],4)}</div>
                        <div className="col text-right">UL: {this.props.outputNumber(element[3]/1000,0)}</div>
                    </div>
                </li>
        );
        return(burnableAssets)
    }


    filterAssets(){
        let filteredAssets =[];
        let searchTerm ='_';
        try{searchTerm = document.getElementById('search').value.toLowerCase()} catch {searchTerm ='_'}

        for (let i = 0; i < this.state.assetBurnOptions.length; ++i){
            console.log(this.state.assetBurnOptions[i])
            if ((this.state.assetBurnOptions[i][2].toLowerCase().includes(searchTerm) || this.state.assetBurnOptions[i][0].toLowerCase().includes(searchTerm))&&this.state.assetBurnOptions[i][1]>0.0000001){
                filteredAssets.push(this.state.assetBurnOptions[i])
            }
            
        }
        this.setState({filteredAssetBurnOptions:filteredAssets})

    }
    filterAssetsExpired(){
        let filteredAssets =[];
        let searchTerm = document.getElementById('search').value.toLowerCase()
        for (let i = 0; i < this.state.assetBurnOptionsExpired.length; ++i) {
            if ((this.state.assetBurnOptionsExpired[i][3].toLowerCase().includes(searchTerm) || this.state.assetBurnOptionsExpired[i][0].toLowerCase().includes(searchTerm))&&this.state.assetBurnOptionsExpired[i][1]>0.0000001){
                filteredAssets.push(this.state.assetBurnOptionsExpired[i])
            }
            
        }
        this.setState({filteredAssetBurnOptionsExpired:filteredAssets})

    }

    selectAssetLive = async(asset) =>{
        console.log(asset)
        document.getElementById('amountToBurn').value = 0
        await this.setState({"selectedAsset":asset});
        await this.setState({"tokenToBurn":asset});
        let token1Address = this.props.assetDetails[this.state.selectedAsset][0]
        let token2Address = this.props.assetDetails[this.state.selectedAsset][1]
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,token1Address)
        let balanceToken1 = await tokenContract.methods.balanceOf(this.props.address).call()
        await this.setState({selectedAssetToken1Balance: balanceToken1})
        console.log(balanceToken1)
        var amountRaw = "100000000000000000000000000000"
        var amount = this.props.web3.utils.toBN(amountRaw)
        let allowance = await tokenContract.methods.allowance(this.props.address, this.props.assetFactory._address).call()
        if (parseInt(allowance) < parseInt(amount)){
            this.setState({
                allowanceButtonVisible1:true,
                submitButtonVisible: false,
            })
        }
        else {
            this.setState({
                allowanceButtonVisible1:false,
                submitButtonVisible: true,
            })
        }
        tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,token2Address)
        let balanceToken2 = await tokenContract.methods.balanceOf(this.props.address).call()
        await this.setState({selectedAssetToken2Balance: balanceToken2})
        if ((parseInt(this.state.selectedAssetToken2Balance) >= parseInt(this.state.selectedAssetToken1Balance)) || this.props.assetDetails[this.state.selectedAsset]['frozen'] === true){
            this.setState({selectedAssetBurnableBalance:parseInt(this.state.selectedAssetToken1Balance)})
        }
        else {
            this.setState({selectedAssetBurnableBalance:parseInt(this.state.selectedAssetToken2Balance)})
            console.log(this.props.assetDetails[this.state.selectedAsset]['frozen'])
        }
        this.setState({burnableBalanceVisible:true})
        allowance = await tokenContract.methods.allowance(this.props.address, this.props.assetFactory._address).call()
        
        if (parseInt(allowance) < parseInt(amount)){
            this.setState({
                approvalButtonVisible2:true,
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Waiting for approval",
            })
        }
        else {
            this.setState({
                approvalButtonVisible2:false,
                submitButtonVisible: true,
                submitButtonDeactivated: false,

            })
        }

        await this.checkInputLive()
        this.closeChooseAssetModal();
    };


    listBurnableExpiredAssets() {
        let burnableAssets = this.state.filteredAssetBurnOptionsExpired.map((element,index) =>
                
                <li key={index} className="list-group-item selectAssetItem" role="button" onClick={()=>this.selectAssetExpired(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[3]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Burnable balance: {this.props.outputNumber(element[1],4)}(long) / {this.props.outputNumber(element[2],4)}(short)</div>
                        <div className="col text-right">UL: {this.props.outputNumber(element[3]/1000,0)}</div>
                    </div>
                </li>
        );
        return(burnableAssets)
    }

    

    selectAssetExpired = async(asset) =>{
        console.log(asset)
        await this.setState({"selectedAssetExpired":asset});
        let token1Address = this.props.assetDetails[this.state.selectedAssetExpired][0]
        let token2Address = this.props.assetDetails[this.state.selectedAssetExpired][1]
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,token1Address)
        let balanceToken1 = await tokenContract.methods.balanceOf(this.props.address).call()
        await this.setState({burnableBalanceToken1: balanceToken1})
        await this.setState({burnableBalanceToken1Visible: true})
        console.log(balanceToken1)
        var amountRaw = "100000000000000000000000000000"
        var amount = this.props.web3.utils.toBN(amountRaw)
        this.checkInputExpired()
        
        let allowance = await tokenContract.methods.allowance(this.props.address, this.props.assetFactory._address).call()
        if (parseInt(allowance) < parseInt(amount)){
            this.setState({
                allowanceButtonVisible1:true,
                submitButtonVisible: false,
            })
        }
        else {
            this.setState({
                allowanceButtonVisible1:false,
                submitButtonVisible: true,
            })
        }
        tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,token2Address)
        let balanceToken2 = await tokenContract.methods.balanceOf(this.props.address).call()
        await this.setState({burnableBalanceToken2: balanceToken2})
        await this.setState({burnableBalanceToken2Visible: true})
        allowance = await tokenContract.methods.allowance(this.props.address, this.props.assetFactory._address).call()
        this.checkInputExpired()
        if (parseInt(allowance) < parseInt(amount)){
            this.setState({
                approvalButtonVisible2:true,
                submitButtonVisible: false,
                submitButtonDeactivated: true,
                submitButtonDeactivatedMessage: "Waiting for approval",
            })
        }
        else {
            this.setState({
                approvalButtonVisible2:false,
                submitButtonVisible: true,
                submitButtonDeactivated: false,

            })
        }
        
        this.closeChooseExpiredAssetModal();
    }

    approvalButton(){
        let approvalButton = <div></div>;
        if (this.state.USDTAllowance === 0){
            approvalButton = <div><Button variant="accent" onClick={this.approveAccount}>Approve</Button></div>;
        };
        return(approvalButton)   
    }

    render() { 
        
        const tooltip1 = props => (
            <Tooltip {...props}>
            You can "burn" ISSUAA Asset Tokens and redeem those against USDC stable coins at any time, if you provide an equal amount of long amd short tokens (from your liquid portfolio positions). The amount of USDC stable coins you will receive is the (equal) amount of long and short tokens burned multiplied by the upper limit of the respective ISSUAA Asset.</Tooltip>
        );
        const tooltip2 = props => (
            <Tooltip {...props}>
            When an asset is expired, you can burn your long and short token balance also after the expiry date and redeem USDC stable coins. The amount of USDC stable coins you will receive ist the amount of long tokens multiplied with the asset price at expiry time plus the amount of short tokens multiplied with the difference of the upper limit of the asset and the asset price at expiry.</Tooltip>
        );
        
        return ( 
            <div className="row w-100">
                <div className="container-fluid m-3">
                    <Modal show={this.state.chooseAssetModalOpen} onHide={this.closeChooseAssetModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select ISSUAA Asset pair to burn</Modal.Title>   
                        </Modal.Header>
                        
                        <Modal.Body className="bg-tgrey" style={{
                          maxHeight: 'calc(100vh - 210px)',
                          overflowY: 'auto'
                         }} 
                        >
                            <div className="row p-3 pr-3 my-auto">
                                <input className="col w-100" id="search" placeholder="Search" onChange={() =>this.filterAssets()}></input>
                                
                            </div>
                            <ul className="list-group">
                                {this.listBurnableAssets()}
                            </ul>
                        </Modal.Body>
                        
                    </Modal>

                    <Modal show={this.state.chooseExpiredAssetModalOpen} onHide={this.closeChooseExpiredAssetModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select ISSUAA Asset pair to burn</Modal.Title>   
                        </Modal.Header>
                        
                        <Modal.Body className="bg-tgrey" style={{
                          maxHeight: 'calc(100vh - 210px)',
                          overflowY: 'auto'
                         }} 
                        >
                            <div className="row p-3 pr-3 my-auto">
                                <input className="col w-100" id="search" placeholder="Search" onChange={() =>this.filterAssets()}></input>
                                
                            </div>
                            <ul className="list-group">
                                {this.listBurnableExpiredAssets()}
                            </ul>
                        </Modal.Body>
                        
                    </Modal>


                    <Modal show={this.state.modalOpen} onHide={this.closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Burn assets and redeem USDC:</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>You will burn {this.state.burnAmount} {this.state.tokenToBurn} and i{this.state.tokenToBurn} token.</Modal.Body>
                            <Modal.Body>You will receive {this.props.outputNumber(this.state.amountToGet*0.99,2)} USDC</Modal.Body>
                        <Modal.Footer>
                            <div id="buttonRounded"><Button variant="fuchsia" onClick={this.confirmBurnTransaction}>Confirm</Button></div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalBurnExpiredAssetsOpen} onHide={this.closeModalBurnExpiredAssets}>
                        <Modal.Header closeButton>
                            <Modal.Title>Burn assets and redeem USDC:</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>You will burn {this.state.amountToBurnLong} {this.state.tokenToBurn} and {this.state.amountToBurnShort} i{this.state.tokenToBurn} token.</Modal.Body>
                            <Modal.Body>You will receive {this.props.outputNumber(this.state.amountToGetExpired,2)} USDC</Modal.Body>
                        <Modal.Footer>
                            {this.approvalButton()}
                            <div id="buttonRounded"><Button variant="fuchsia" onClick={this.confirmBurnTransactionExpired}>Confirm</Button></div>
                        </Modal.Footer>
                    </Modal>

                    <Zoom>
                        <div className="row">
                            <div className="col"></div>
                            <div id="mainBox" className="col-5 container bg-darkpurple text-light p-0 rounded">
                                <div className="container">
                                    <div className="row">
                                    <div id="mainBoxUpLeft" className={this.state.style1} role="button" onClick={this.selectLiveView}>
                                        Live
                                        <OverlayTrigger placement="right" overlay={tooltip1}>
                                            <img className="mr-2" src={info} alt="Logo"/>
                                        </OverlayTrigger>
                                    </div>
                                    <div id="mainBoxUpRight" className={this.state.style2} role="button" onClick={this.selectExpiredView}>
                                        Expired
                                        <OverlayTrigger placement="right" overlay={tooltip2}>
                                            <img className="mr-2" src={info} alt="Logo"/>
                                        </OverlayTrigger>
                                    </div>
                                </div>
                            </div>
                                <div id="mainBoxDown" className="bg-darkpurple px-4 py-4">
                                    {this.assetOutput()}
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
 
export default BurnAssets;