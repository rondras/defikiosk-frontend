import React, { Component } from 'react';
import { Modal} from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import info from '../img/ISSUAA-i.png';
import arrowDown from '../img/arrow-down.png';
import plusSignWhite from '../img/plussign-white.png';
import axios from "axios";
import Zoom from 'react-reveal/Zoom';



class Pool extends Component {
    
    constructor(props){
        super(props)
        this.state = { 
            assets: [],
            filteredAssets: [],
            filteredLPAssets: [],
            selectedAsset: "Select Asset",
            selectedAssetAddress: "",
            selectedAssetPrice: 0,
            selectedAssetBalance: 0,

            selectedLPToken: "Select Asset",

            selectedLPTokenBalance: 0,
            estimatedOutput1: 0,
            estimatedOutput2: 0,    

            chooseAssetModalOpen: false,
            USDTBalance:0,
            showAddLiquidyPart: true,
            showRemoveLiquidityPart: false,
            style1: "col text-center bg-darkpurple text-light py-2",
            style2: "col text-center bg-darkAccent text-light py-2",
            approvalButtonLPTokenVisible: false,
            approvalButtonUSDTVisible: false,
            approvalButtonTokenVisible: false,
            addLiquidityButtonVisible: false,
            removeLiquidityButtonVisible: false,
            buttonMessage: "Select an asset",
            expectedOutputVisible: false,

        }
        
    }

    async componentDidMount() {
        this.setState({
            //assets: ['wait'],
            USDTBalance: this.props.USDTBalance,
            //INTAddress: this.props.GovernanceToken_Address,
        });
    };

    onlyNumberKey(e) {
         
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            this.setState({value: e.target.value})
      }
    }


    openChooseAssetModal=async()=>{
        let assets = [];
        let assetBalances = {};
        let assetAddresses = {};
        assets.push(["IPT",this.props.GovernanceTokenBalance,"ISSUAA Protocol Token",this.props.pools[0][4]]);
        assetBalances["IPT"]= this.props.GovernanceTokenBalance;
        assetAddresses["IPT"] = this.props.GovernanceToken_Address;
        for (let key in this.props.assetDetails) {
            console.log(key)
            console.log(this.props.assetDetails[key])
            assets.push([key,this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['name'],this.props.assetDetails[key]['poolBalanceLong']])
            assetBalances[key] = this.props.assetDetails[key]['tokenBalance1']
            assets.push(["i"+key,this.props.assetDetails[key]['tokenBalance2'],"short".concat(this.props.assetDetails[key]['name']),this.props.assetDetails[key]['poolBalanceLong']])
            assetBalances["i"+key] = this.props.assetDetails[key]['tokenBalance2']

            assetAddresses[key] = this.props.assetDetails[key]['Token1']
            assetAddresses["i"+key] = this.props.assetDetails[key]['Token2']
        }
        

        await this.setState({assets:assets})
        let filteredAssets =[];
        for (let i = 0; i < this.state.assets.length; ++i) {
            console.log(this.state.assets[i])
            if (this.state.assets[i][1] >0){
                filteredAssets.push(this.state.assets[i])
            }
            
        }
        this.setState({filteredAssets:filteredAssets})
        this.setState({assetBalances:assetBalances})
        this.setState({assetAddresses})
        this.setState({ chooseAssetModalOpen: true })  
        console.log(this.state.assets)   
    };


    
    closeChooseAssetModal = () => this.setState({ chooseAssetModalOpen: false });

    openChooseAssetModalAdd=async()=>{
        let assets = [];
        let assetBalances = {};
        let assetAddresses = {};
        if (this.props.GovernanceTokenBalance>0.0001){
            assets.push(["IPT",this.props.GovernanceTokenBalance,"ISSUAA Protocol Token",this.props.pools[0][4]]);
            assetBalances["IPT"]= this.props.GovernanceTokenBalance;
            assetAddresses["IPT"] = this.props.GovernanceToken_Address;
        }
        
        for (let key in this.props.assetDetails) {
            console.log(key)
            if (this.props.assetDetails[key]['tokenBalance1'] >0.001){
                assets.push([key,this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['name'],this.props.assetDetails[key]['poolBalanceLong']])
                assetBalances[key] = this.props.assetDetails[key]['tokenBalance1']
                console.log(this.props.assetDetails[key]['tokenBalance1'])
            }
            if (this.props.assetDetails[key]['tokenBalance2'] >0.001){
                assets.push(["i"+key,this.props.assetDetails[key]['tokenBalance2'],"short".concat(this.props.assetDetails[key]['name']),this.props.assetDetails[key]['poolBalanceLong']])
                assetBalances["i"+key] = this.props.assetDetails[key]['tokenBalance2']
            }
            assetAddresses[key] = this.props.assetDetails[key]['Token1']
            assetAddresses["i"+key] = this.props.assetDetails[key]['Token2']
        }
        

        await this.setState({assets:assets})
        let filteredAssets =[];
        for (let i = 0; i < this.state.assets.length; ++i) {
            console.log(this.state.assets[i])
            if (this.state.assets[i][1] >0){
                filteredAssets.push(this.state.assets[i])
            }
            
        }
        this.setState({filteredAssets:filteredAssets})
        this.setState({assetBalances:assetBalances})
        this.setState({assetAddresses})
        this.setState({ chooseAssetModalOpen: true })  
        console.log(this.state.assets)   
    };


    
    closeChooseAssetModal = () => this.setState({ chooseAssetModalOpen: false });

    filterAssets(){
        let availableAssets = []
        for (let i = 0; i < this.state.assets.length; ++i) {
            console.log(this.state.assets[i])
            if (this.state.assets[i][1] >0){
                availableAssets.push(this.state.assets[i])
            }
            
        }

        let filteredAssets =[];
        let searchTerm = document.getElementById('search').value.toLowerCase()
        for (let i = 0; i < availableAssets.length; ++i) {
            if (availableAssets[i][2].toLowerCase().includes(searchTerm) || availableAssets[i][0].toLowerCase().includes(searchTerm)){
                filteredAssets.push(availableAssets[i])
            }
            
        }
        this.setState({filteredAssets})

    }

    filterLPAssets(){
        let availableAssets = []
        for (let i = 0; i < this.state.assets.length; ++i) {
            console.log(this.state.assets[i])
            if (this.state.assets[i][1] >0){
                availableAssets.push(this.state.assets[i])
            }
            
        }

        let filteredLPAssets =[];
        let searchTerm = document.getElementById('search').value.toLowerCase()
        for (let i = 0; i < availableAssets.length; ++i) {
            if (availableAssets[i][2].toLowerCase().includes(searchTerm) || availableAssets[i][0].toLowerCase().includes(searchTerm)){
                filteredLPAssets.push(availableAssets[i])
            }
            
        }
        this.setState({filteredLPAssets})

    }

    

    roundDown = (n,d) => {
        n = Math.floor(n*(10**d))
    
        n = n/(10**d)
        return n
    }

    openChooseLPTokenModal= async()=>{
        let assets = [];
        let assetBalances = {};
        let assetAddresses = {};
        console.log("Debug")
        console.log(this.props.pools)
        await assets.push(["IPT",this.props.GovernanceTokenBalance,"ISSUAA Protocol Token",this.props.pools[0][4]]);
        assetBalances["IPT"]= this.props.GovernanceTokenBalance;
        assetAddresses["IPT"] = this.props.GovernanceToken_Address;
        console.log(assets)
        for (let key in this.props.assetDetails) {
            console.log(this.props.assetDetails[key])
            assets.push([key,this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['name'],this.props.assetDetails[key]['poolBalanceLong']])
            assetBalances[key] = this.props.assetDetails[key]['tokenBalance1']
            assets.push(["i"+key,this.props.assetDetails[key]['tokenBalance1'],"short".concat(this.props.assetDetails[key]['name']),this.props.assetDetails[key]['poolBalanceShort']])
            assetBalances["i"+key] = this.props.assetDetails[key]['tokenBalance2']

            assetAddresses[key] = this.props.assetDetails[key]['Token1']
            assetAddresses["i"+key] = this.props.assetDetails[key]['Token2']
        }
        
        await this.setState({assets:assets})
        console.log(this.state.assets)
        
        let filteredAssets =[];
        for (let i = 0; i < this.state.assets.length; ++i) {
            console.log(this.state.assets[i])
            if (this.state.assets[i][3] >9999){
                filteredAssets.push(this.state.assets[i])
            }
            
        }
        
        this.setState({filteredLPAssets:filteredAssets})
        this.setState({assetBalances:assetBalances})
        this.setState({assetAddresses})
        this.setState({chooseLPTokenModalOpen: true })  
        console.log(this.state.assets)   
    };

    closeChooseLPTokenModal = () => this.setState({ chooseLPTokenModalOpen: false });

    listLPTokens() {
        if (this.state.filteredLPAssets.length === 0) {
            return (<div className="row"><div className="col p-4">You currently own no LP tokens.</div></div>)
        }

        let assetOptions = this.state.filteredLPAssets.map((element,index) =>
                <li key={index} className="list-group-item selectAssetItem"  role="button" onClick={()=>this.selectLPToken(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[2]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Balance: {this.props.outputNumber(element[1],4)}</div>
                        <div className="col text-right">LP Balance: {this.props.outputNumber(element[3]/(10**18),6)}</div>
                    </div>

                </li>
        );
        return(assetOptions)
    }
    
    listAssets() {
        if (this.state.filteredAssets.length === 0) {
            return (<div className="row"><div className="col p-4">You currently own no assets.</div></div>)
        }
        let assetOptions = this.state.filteredAssets.map((element,index) =>
                <li key={index} className="list-group-item selectAssetItem" role="button" onClick={()=>this.selectAsset(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[2]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Balance: {this.props.outputNumber(element[1],4)}</div>
                        <div className="col text-right">LP Balance: {element[3] > 0 ? this.props.outputNumber(element[3]/(10**18),8):this.props.outputNumber(0,8)}</div>
                    </div>
                </li>
        );
        return(assetOptions)
    }
    
    selectAsset = async(asset) =>{
        document.getElementById('tokenAmountA').value = 0;
        document.getElementById('tokenAmountB').value = 0;
        console.log(asset)
        await this.setState({"selectedAsset":asset});
        console.log(this.state.assetAddresses)
        await this.setState({"selectedAssetAddress":this.state.assetAddresses[asset]})
        
        console.log(this.state.selectedAssetAddress)
        
        console.log(this.props.USDT_Address)

        this.closeChooseAssetModal();
        
        let pair = await this.props.MarketFactory.methods.getPair(this.state.selectedAssetAddress,this.props.USDT_Address).call()
        let MarketPair = new this.props.web3.eth.Contract(this.props.MarketPair_ABI,pair)
        
        let token0 = await MarketPair.methods.token0().call();
        console.log(token0)
        this.setState({token0})

        let balanceWEI = await MarketPair.methods.balanceOf(this.props.address).call()
        var balance = parseFloat(this.props.web3.utils.fromWei(balanceWEI.toString(), 'ether'))
        console.log(balance)
        await this.setState({"selectedLPTokenBalance": balance})
        console.log(this.state.selectedLPTokenBalance)


        await this.setState({"selectedAssetBalance": this.state.assetBalances[asset]});
        console.log(this.state)
        console.log(pair)
        
        let reserves = await MarketPair.methods.getReserves().call()
        console.log(reserves)
        let price
        if (this.state.token0 === this.props.USDT_Address) {
            price = reserves[0]/reserves[1]
        }
        else{
            price = reserves[1]/reserves[0]
        }
        this.setState({selectedAssetPrice:price})


        //check if the Approval button needs to be shown for token 1
        console.log(this.props.MarketRouter_Address)
        let approvalGivenToken = await this.checkApproval(this.state.selectedAssetAddress, this.props.MarketRouter_Address)
        console.log(approvalGivenToken)
        if (approvalGivenToken === true) {
            this.setState({"approvalButtonTokenVisible":false})

        }
        else {
            this.setState({"approvalButtonTokenVisible":true})
        };

        //check if the Approval button needs to be shown for USDC
        let approvalGivenUSDT = await this.checkApproval(this.props.USDT_Address, this.props.MarketRouter_Address)
        console.log(approvalGivenUSDT)
        if (approvalGivenUSDT === true) {
            this.setState({"approvalButtonUSDTVisible":false})
        }
        else{
            this.setState({"approvalButtonUSDTVisible":true})
        };
        
        //check if the Add liquidity button is shown
        if (approvalGivenUSDT === true && approvalGivenToken === true){
            this.setState({"addLiquidityButtonVisible": true})
        }
        else {
            this.setState({
                "addLiquidityButtonVisible": false,
                "buttonMessage": "Waiting for approval..."
            })
        };
        this.checkButtons();
        
        
    }

    selectLPToken = async(asset) =>{
        console.log(asset)
        document.getElementById('LPTokenAmount').value = 0
        await this.setState({"selectedLPToken":asset});
        await this.setState({"selectedAsset":asset});
        await this.setState({"selectedLPTokenAddress":this.state.assetAddresses[asset]})
        let pair = await this.props.MarketFactory.methods.getPair(this.state.selectedLPTokenAddress,this.props.USDT_Address).call()
        await this.setState({"selectedLPPairAddress": pair});
        let MarketPair = new this.props.web3.eth.Contract(this.props.MarketPair_ABI,pair)
        let token0 = await MarketPair.methods.token0().call();
        console.log(token0)
        this.setState({token0})

        let balanceWEI = await MarketPair.methods.balanceOf(this.props.address).call()
        console.log(balanceWEI)
        var balance = parseFloat(this.props.web3.utils.fromWei(balanceWEI.toString(), 'ether'))
        let totalSupplyWEI = await MarketPair.methods.totalSupply().call()
        let reserves = await MarketPair.methods.getReserves().call()
        console.log(reserves)
        let token1Ratio = parseInt(totalSupplyWEI) / reserves[0]
        let token2Ratio = parseInt(totalSupplyWEI) / reserves[1]
        this.setState({token1Ratio});
        this.setState({token2Ratio});
        console.log(balance)
        console.log(token1Ratio)
    
        await this.setState({"selectedLPTokenBalance": balance})
        console.log(this.state.selectedLPTokenBalance)
        await this.setState({"selectedAssetBalance": this.state.assetBalances[asset]});
        
        console.log(this.state)
        console.log(pair)
        
        let r = await MarketPair.methods.getReserves().call()
        let price
        if (token0 === this.props.USDTAddress){
            price = r[0]/r[1]
        }
        else {
            price = r[1]/r[0]
        }
        this.setState({selectedAssetPrice:price})

        console.log(r)

        //check if the Approval button needs to be shown
        let approvalGiven = await this.checkApproval(pair, this.props.MarketRouter_Address)
        console.log(approvalGiven)
        if (approvalGiven === true) {
            this.setState({
                "approvalButtonLPTokenVisible":false,
                "removeLiquidityButtonVisible": true,
            })
            
        }
        else {
            this.setState({
                "approvalButtonLPTokenVisible":true,
                "removeLiquidityButtonVisible": false,
                "buttonMessage": "Waiting for approval..."
            })

        };
        this.calculateTokenOutput();
        this.closeChooseLPTokenModal();
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
                await tokenContract.methods.approve(addressTo,value).send({from: this.props.address, gasPrice:gasPrice})
                .on('receipt', async (receipt) => {
                console.log(receipt)
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
                if (e['message'].includes('not mined within 50 blocks') !==true) {
                    message = e['message']
                    this.props.openMessageBox(message)
                    await this.props.sleep(5000)
                    this.props.closeMessageBox();
                    return
                }            
            }
        }
        return (true)
    };


    
    approveMarketRouterToken = async() =>{
        let tokenAddress = await this.state.selectedAssetAddress;
        let trx_status = await this.approveAccount1(tokenAddress,this.props.MarketRouter_Address)
        console.log(trx_status)
        if (trx_status){await this.setState({approvalButtonTokenVisible: false})}
        this.props.sleep(500)
        await this.checkButtons()
    }


    checkButtons = async() => {
        if (this.state.showAddLiquidyPart) {
            console.log(this.state)
            let tokenVolume = parseFloat(document.getElementById('tokenAmountA').value)
            if (Number.isNaN(tokenVolume)){tokenVolume = 0};
            let USDVolume = parseFloat(document.getElementById('tokenAmountB').value)
            if (Number.isNaN(USDVolume)){USDVolume = 0};
            
            if (this.state.approvalButtonTokenVisible) {
            this.setState({
                "addLiquidityButtonVisible":false,
                "buttonMessage": "Waiting for approval..."
            })
            }
            else if (this.state.approvalButtonUSDTVisible) {
                this.setState({
                    "addLiquidityButtonVisible":false,
                    "buttonMessage": "Waiting for approval..."
                })
            }            
            else if(Number.isNaN(tokenVolume) === true || 
                Number.isNaN(USDVolume) === true ||
                tokenVolume === 0 ||
                USDVolume === 0){
                console.log(tokenVolume)
                this.setState({
                    addLiquidityButtonVisible:false,
                    "buttonMessage": "Enter valid amount"
                })
            }
            else if (this.state.selectedAssetBalance < tokenVolume) {
                this.setState({
                    addLiquidityButtonVisible:false,
                    "buttonMessage": "Balance too low"
                })
            }
            else if (this.props.USDTBalance < USDVolume) {
                console.log(USDVolume * 10**this.props.USDDecimals)
                console.log(this.props.USDTBalance)
                this.setState({
                    addLiquidityButtonVisible:false,
                    "buttonMessage": "USDC Balance too low"
                })
            }

            else {
                this.setState({
                    "addLiquidityButtonVisible": true,                
                })
            };
        }
        else {
            var LPTokenAmount = parseFloat(document.getElementById('LPTokenAmount').value)
            if (Number.isNaN(LPTokenAmount)){LPTokenAmount = 0};
            console.log(LPTokenAmount)
            console.log(this.state.selectedLPTokenBalance)

            if (this.state.approvalButtonLPTokenVisible) {
                this.setState({
                    "removeLiquidityButtonVisible":false,
                    "buttonMessage": "Waiting for approval..."
                })
            }
            // Check if the balance is too high
            
            else if (this.state.selectedLPTokenBalance < LPTokenAmount) {
                this.setState({
                    removeLiquidityButtonVisible:false,
                    "buttonMessage": "Balance too low"
                })
            }
            else if(Number.isNaN(LPTokenAmount) === true ||
                LPTokenAmount === 0){
                this.setState({
                    removeLiquidityButtonVisible:false,
                    "buttonMessage": "Enter valid amount"
                })
            }
            else {
                this.setState({
                    "removeLiquidityButtonVisible": true,                
                })
            };

        }
    }


    

    approveMarketRouterUSDT = async() =>{
        let trx_status = await this.approveAccount1(this.props.USDT_Address,this.props.MarketRouter_Address)
        //this.props.loadBlockchainData();
        if (trx_status) {this.setState({approvalButtonUSDTVisible: false})}
        await this.checkButtons()

    }

    approveRouter = async() =>{  
        console.log("Approving Token",this)
        let message = "Approving to spend tokens"
        this.props.openMessageBox(message);
        var approvalAddress = this.props.MarketRouter_Address;
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.selectedAssetAddress)
        var amountRaw = this.props.web3.utils.toWei(this.state.selectedAssetBalance.toString(), 'ether')
        var amount = this.props.web3.utils.toBN(amountRaw)
        
        console.log(approvalAddress)
        console.log(this.props.address)
        let allowance = await tokenContract.methods.allowance(this.props.address, approvalAddress).call()
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

            try{await tokenContract.methods.approve(approvalAddress,value).send({from: this.props.address, gasPrice:gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
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
                if (e['message'].includes('not mined within 50 blocks') !==true) {
                    message = e['message']
                    this.props.openMessageBox(message)
                    await this.props.sleep(5000)
                    this.props.closeMessageBox();
                    return
                }            
            }   
        }
        allowance = await this.props.USDT.methods.allowance(this.props.address, approvalAddress).call()
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
                await this.props.USDT.methods.approve(approvalAddress,value).send({from: this.props.address, gasPrice: gasPrice})
                .on('receipt', async (receipt) => {
                    console.log(receipt)
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
                if (e['message'].includes('not mined within 50 blocks') !==true) {
                    message = e['message']
                    this.props.openMessageBox(message)
                    await this.props.sleep(5000)
                    this.props.closeMessageBox();
                    return
                }            
            }
        }
        this.props.closeMessageBox()
        return (true)
    };
    
    checkApproval = async(tokenAddress, approvalAddress) =>{  
        console.log(approvalAddress)
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddress)
        var amountRaw = "100000000000000000000000000000"
        var amount = this.props.web3.utils.toBN(amountRaw)
        console.log(this.props.address)
        console.log(approvalAddress)
        let allowance = await tokenContract.methods.allowance(this.props.address, approvalAddress).call()

        if (parseInt(allowance) < parseInt(amount)){
            return(false)
        }
        else {return (true)}
    };

    approveAccount1 = async(tokenAddress,approvalAddress) =>{  
        console.log(tokenAddress)
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
            await tokenContract.methods.approve(approvalAddress,value).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt)
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
            if (e['message'].includes('not mined within 50 blocks') !==true) {
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }            
        }
        
        this.props.closeMessageBox()
        return (true)
    };

    approveLPToken = async() =>{
        console.log("Here")
        let tokenAddress = await this.state.selectedLPPairAddress;
        console.log(tokenAddress)
        let trx_status = await this.approveAccount1(tokenAddress,this.props.MarketRouter_Address)
        if (trx_status){await this.setState({approvalButtonLPTokenVisible:false})}
        this.checkButtons()
    }

    addLiquidity = async () =>{
        let message = "Adding liquidity"
        this.props.openMessageBox(message)

        let tokenA = this.state.selectedAssetAddress;
        let tokenB = this.props.USDT_Address;
        
        console.log(tokenA)
        let tokenAmtA = parseFloat(document.getElementById('tokenAmountA').value).toFixed(15)
        let amountADesiredRaw = this.props.web3.utils.toWei(tokenAmtA,'ether')
        let amountBDesiredRaw = 0
         if (this.props.USDDecimals === "6"){
            amountBDesiredRaw =  this.props.web3.utils.toWei((document.getElementById('tokenAmountB').value).toString(),'mwei')
            console.log("correct")
            console.log(amountBDesiredRaw)
        }
        else{
            let amountBDesiredRaw =  this.props.web3.utils.toWei((document.getElementById('tokenAmountB').value).toFixed(16).toString(),'ether')
            console.log(amountBDesiredRaw)
            console.log("wrong")
        }
        let amountADesired = this.props.web3.utils.toBN(amountADesiredRaw)
        let amountBDesired = this.props.web3.utils.toBN(amountBDesiredRaw)
        console.log(amountBDesired)  
        let amountAMin = amountADesired.mul(this.props.web3.utils.toBN(9)).div(this.props.web3.utils.toBN(100))
        let amountBMin = amountBDesired.mul(this.props.web3.utils.toBN(9)).div(this.props.web3.utils.toBN(100))

        let to = this.props.address;
        let deadline = Math.round(+new Date()/1000) + (60*10)
        console.log(tokenA)
        console.log(tokenB)
        console.log(parseInt(amountADesired))
        console.log(parseInt(amountBDesired))
        console.log(parseInt(amountAMin))
        console.log(parseInt(amountBMin))
        console.log(deadline)
        console.log(to)
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
                    await this.setState({selectedAsset: "Select Asset"})
                    await this.setState({selectedAssetBalance: 0})
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
            if (e['message'].includes('not mined within 50 blocks') !==true) {
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }            
        }
        
        document.getElementById('tokenAmountA').value = 0
        document.getElementById('tokenAmountB').value = 0
        
    }
    
    removeLiquidity = async () =>{        
        let message = "Removing liquidity"
        this.props.openMessageBox(message)
        let tokenB = this.props.USDT_Address;
        let tokenA = this.state.selectedLPTokenAddress;
        
        let liquidity = this.props.web3.utils.toWei((document.getElementById('LPTokenAmount').value).toString(),'ether');
        let amount1Raw
        let amount2Raw

        if (this.props.USDDecimals === "6"){
            amount2Raw = this.props.web3.utils.toWei(this.roundDown(this.state.estimatedOutput2,6).toString(),'mwei'); 
            console.log("Correct decimals") 
        }
        else {
            amount2Raw = this.props.web3.utils.toWei(parseFloat(this.state.estimatedOutput2).toFixed(11).toString(),'ether'); 
            console.log("Wrong decimals") 
        }
        amount1Raw = this.props.web3.utils.toWei(parseFloat(this.state.estimatedOutput1).toFixed(11).toString(),'ether'); 
        

        
        console.log("USDC Amount:",amount1Raw)
        console.log("Token Amount:", amount2Raw)

        let amount1 = this.props.web3.utils.toBN(amount1Raw)
        let amount2 = this.props.web3.utils.toBN(amount2Raw)

        let amountAMin = amount1.mul(this.props.web3.utils.toBN(95)).div(this.props.web3.utils.toBN(100))

        let amountBMin = amount2.mul(this.props.web3.utils.toBN(95)).div(this.props.web3.utils.toBN(100))
        console.log((amountAMin).toString())
        console.log((amountBMin).toString())
        //amountAMin = 0
        //amountBMin = 0


        let to = this.props.address;
        let deadline = Math.round(+new Date()/1000) + (60*10)
        console.log(deadline)
        console.log(to)
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
            await this.props.MarketRouter.methods.removeLiquidity(tokenA, tokenB, liquidity, amountAMin,amountBMin, to, deadline).send({from: this.props.address, gasPrice: gasPrice})
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
                    
                    this.setState({buttonMessage:"Select an asset"});
                    await this.setState({"selectedLPTokenBalance": 0})

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
            if (e['message'].includes('not mined within 50 blocks') !==true) {
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return
            }            
        }
        //await this.props.loadBlockchainData();
        
        

        


        
        document.getElementById('LPTokenAmount').value = 0
        this.props.closeMessageBox()
    }

    calculateUSDVolume = async() =>{
        let tokenVolume = parseFloat(document.getElementById('tokenAmountA').value)
        if (tokenVolume < 0){
            tokenVolume = this.state.tokenAmountA
            document.getElementById('tokenAmountA').value = tokenVolume
        }

        let USDTVolume
        if(Number.isNaN(this.state.selectedAssetPrice) !== true){
            this.setState({expectedOutputVisible: true})
            if (this.props.USDDecimals === "6"){
                USDTVolume = parseFloat(tokenVolume * this.state.selectedAssetPrice*(10**12)).toFixed(6)
            }
            else{
                USDTVolume = parseFloat(tokenVolume * this.state.selectedAssetPrice).toFixed(3)
            }
            
            document.getElementById('tokenAmountB').value = USDTVolume
        }
        
        this.setState({"tokenAmountA":tokenVolume})
        this.setState({"tokenAmountB":USDTVolume})
        this.checkButtons()

    }

    calculateTokenVolume = async() =>{
        let USDTVolume = parseFloat(document.getElementById('tokenAmountB').value)
        if (USDTVolume < 0){
            USDTVolume = this.state.tokenAmountB
            document.getElementById('tokenAmountB').value = USDTVolume
        }
       let TokenVolume
        if(Number.isNaN(this.state.selectedAssetPrice) !== true){
            TokenVolume = USDTVolume / this.state.selectedAssetPrice / (10**12)
            document.getElementById('tokenAmountA').value = this.props.outputNumber(TokenVolume,2)
        }
        this.setState({"tokenAmountA":TokenVolume})
        this.setState({"tokenAmountB":USDTVolume})
        this.checkButtons()
    }
    
    calculateTokenOutput = async() =>{
        let LPTokenAmount = parseFloat(document.getElementById('LPTokenAmount').value)
        console.log(this.state.token0)
        console.log(this.props.USDT_Address)
        let tokenVolume
        let USDTVolume

        if (this.state.token0 === this.props.USDT_Address) {
            tokenVolume = LPTokenAmount * this.state.token1Ratio
            USDTVolume = LPTokenAmount * this.state.token2Ratio *(10**(18-this.props.USDDecimals))
        } 
        else {
            tokenVolume = LPTokenAmount * this.state.token2Ratio
            USDTVolume = LPTokenAmount * this.state.token1Ratio *(10**(18-this.props.USDDecimals))
        }

        this.setState({estimatedOutput1: tokenVolume});
        this.setState({estimatedOutput2: USDTVolume});
        if (Number.isNaN(USDTVolume) || Number.isNaN(tokenVolume)){
            this.setState({expectedOutputVisible: false})
        }
        else {
            this.setState({expectedOutputVisible: true})
        }
        this.checkButtons();
    }

    showRemoveLiquidity = async() =>{
        this.setState({selectedLPToken: "Select Asset"})
        this.setState({showAddLiquidyPart: false});
        this.setState({showRemoveLiquidyPart: true});
        this.setState({buttonMessage:"Select an asset"});
        this.setState({approvalButtonLPTokenVisible: false});
        this.setState({style2: "col text-center bg-darkpurple text-light py-2"});
        this.setState({style1: "col text-center bg-darkAccent text-light py-2"});
        await this.setState({"selectedLPTokenBalance": 0})

    }

    showAddLiquidity = async() =>{
        this.setState({selectedAsset: "Select Asset"})
        this.setState({showAddLiquidyPart: true});
        this.setState({selectedLPToken:"Select asset"});
        this.setState({buttonMessage:"Select an asset"});
        this.setState({showRemoveLiquidyPart: false});
        this.setState({style2: "col text-center bg-nav text-light py-2"});
        this.setState({style1: "col text-center bg-darkpurple text-light py-2"});


    }

    setMaxBalanceToken = async() =>{
        document.getElementById('tokenAmountA').value = this.roundDown(this.state.selectedAssetBalance,14).toFixed(14).replace(/\.?0+$/,"");
        this.calculateUSDVolume()
    }
    setMaxBalanceUSD = async() =>{
        document.getElementById('tokenAmountB').value = this.roundDown(this.props.USDTBalance,6);
        this.calculateTokenVolume()
    }
    setMaxBalanceLPToken = async() =>{
        document.getElementById('LPTokenAmount').value = this.roundDown(this.state.selectedLPTokenBalance,14).toFixed(14).replace(/\.?0+$/,"");
        this.calculateTokenOutput()
    }


    render() { 
        
        const tooltip1 = props => (
            <Tooltip {...props}>
            Each ISSUAA Asset has it´s own pool, so there are seperate pools for each ISSUAA long and each ISSUAA short Asset. For providing liquidity of long and short ISSUAA Asset (pair) you need to provide liquidity (ISSUAA Asset tokens and equal amount of USDC stable coin) seperately in the corresponding pools.
            </Tooltip>
        );
        const tooltip2 = props => (
            <Tooltip {...props}>
            You can always remove liquidity (ISSUAA Assets and USDC stable coins) you provided earlier in the ISSUAA pools. Please note that the number of your liquidity provider tokens is shown in the balance (as also in your LP tokens portfolio section) and that it is this number (or part of this amount) which needs to be input in the Pool tokens field to remove liquidity.
            </Tooltip>
        );
        
        return ( 
            <div className="row w-100">
                <div className="container-fluid m-3">

                    <Modal show={this.state.chooseAssetModalOpen} onHide={this.closeChooseAssetModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select a token</Modal.Title>   
                        </Modal.Header>
                        <Modal.Body className="bg-tgrey" style={{
                          maxHeight: 'calc(100vh - 210px)',
                          overflowY: 'auto'
                         }} 
                        >
                            <div className="row p-3 pr-3 my-auto">
                                <input className="col w-100" id="search" placeholder="Search" onChange={() =>this.filterAssets()}></input>
                                
                            </div>
                            <ul className="list-group border border-nav">
                                {this.listAssets()}
                            </ul>
                        </Modal.Body>
                            
                        
                    </Modal>


                    <Modal show={this.state.chooseLPTokenModalOpen} onHide={this.closeChooseLPTokenModal}>
                        <Modal.Header className="border" closeButton>
                            <Modal.Title>Select a liquidity pool</Modal.Title>   
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
                                {this.listLPTokens()}
                            </ul>
                        </Modal.Body>
                        
                    </Modal>

                    <Zoom>
                    <div className="row">
                        <div className="col"></div>
                        <div id="mainBox" className="col-5 container bg-darkpurple text-light p-0 rounded">
                            <div className="container">
                                <div className="row">
                                    <div  id="mainBoxUpLeft" className={this.state.style1} onClick={this.showAddLiquidity} role="button">
                                        <OverlayTrigger placement="right" overlay={tooltip1}>
                                            <img className="mr-2 my-auto" src={info} alt="Info"/>
                                        </OverlayTrigger>
                                        Add liquidity
                                        
                                    </div>
                                    <div  id="mainBoxUpRight" className={this.state.style2} onClick={this.showRemoveLiquidity} role="button">
                                        <OverlayTrigger placement="right" overlay={tooltip2}>
                                            <img className="mr-2 my-auto" src={info} alt="Info"/>
                                        </OverlayTrigger>
                                        Remove liquidity
                                        
                                    </div>
                                </div>
                            </div>

                            
                            <div id="mainBoxDown" className="px-4 py-4">
                                

                                {this.state.showAddLiquidyPart 
                                ?
                                    <div className="container px-0 text-light">
                                        <div id="innerBox" className="container px-4 py-4 text-black bg-innerBox">
                                            <div className="row">
                                                <div className="col align-self-start"> </div>
                                                <div onClick={this.setMaxBalanceToken} id="buttonRounded" role="button" className="col align-self-end text-lg-right textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.state.selectedAssetBalance,8)} (Max)</span></div>
                                            </div>
                                            <div className="row">
                                                <div className="col">
                                                    <input id="tokenAmountA" onChange={() =>this.calculateUSDVolume()} className="form-control form-control-lg bg-innerBox" type="text" lang="en" placeholder="0"/>
                                                </div>
                                                <div className="btn my-auto btn-accent mx-2" id="buttonRounded" onClick={this.openChooseAssetModal}>
                                                    <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                                </div>
                                        </div>       
                                            </div>
                                        <div>
                                            <div className="d-flex align-items-center justify-content-center h-100 py-4">
                                                <img src={plusSignWhite} alt="switch" height="30"/>   
                                            </div>
                                        </div>
                                        

                                        <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                            <div className="row">
                                                <div className="col align-self-start"> </div>
                                                <div id="buttonRounded" onClick={this.setMaxBalanceUSD} role="button" className="col align-self-end text-lg-right textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.props.USDTBalance,2)} (Max)</span></div>
                                            </div>

                                        
                                            <div className="row">
                                                <div className="col-sm-9">
                                                    <input id="tokenAmountB" onChange={() =>this.calculateTokenVolume()} className="form-control form-control-lg bg-innerBox" type="text" lang="en" placeholder="0"/>
                                                </div>
                                                <div className="col align-self-end text-lg-right my-auto">
                                                    <div id="tradeBoxText" className="my-auto col text-right">USDC</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row"></div>                                
                                        <div className="row">
                                            
                                                {this.state.approvalButtonTokenVisible
                                                ?
                                                    <div className="w-100 px-3 py-3">
                                                        <div className="btn btn-fuchsia text-black w-100" id="buttonRounded" onClick={() =>this.approveMarketRouterToken()}>Approve Token</div>
                                                    </div>
                                                :
                                                    ''
                                                }
                                                {this.state.approvalButtonUSDTVisible
                                                ?
                                                    <div className="w-100 px-3 py-3">
                                                        <div className="btn btn-fuchsia text-black w-100" id="buttonRounded" onClick={() =>this.approveMarketRouterUSDT()}>Approve USDC</div>
                                                    </div>
                                                :
                                                    ''
                                                }
                                                
                                                {this.state.addLiquidityButtonVisible 
                                                    ?
                                                    <div className="w-100 px-3 py-3">
                                                        <div className="align-right btn btn-fuchsia text-black w-100" id="buttonRounded" onClick={() =>this.addLiquidity()}>Add liquidity</div>
                                                    </div>
                                                    :
                                                    <div className="w-100 px-3 py-3">
                                                        <div className="self-align-rigt btn btn-accent w-100" id="buttonRounded" >{this.state.buttonMessage}</div>
                                                    </div>
                                                }
                                            
                                        </div>
                                    </div>
                                    : ''
                                }
                                {this.state.showRemoveLiquidyPart 
                                    ?
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div className="row">
                                            <div className="col align-self-start"> </div>
                                            <div onClick={this.setMaxBalanceLPToken} role="button" className="col align-self-end text-lg-right textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.state.selectedLPTokenBalance,8)} (Max)</span></div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <input id="LPTokenAmount" onChange={() =>this.calculateTokenOutput()} className="form-control form-control-lg bg-innerBox text-black" type="text" lang="en" placeholder="0"/>
                                            </div>
                                            <div className="btn my-auto btn-accent mx-2" id="buttonRounded"  onClick={this.openChooseLPTokenModal}>
                                                <div>{this.state.selectedLPToken} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                            </div>
                                        </div>
                                        <div className="w-12">&nbsp;</div>
                                        {this.state.expectedOutputVisible
                                        ?
                                        <div>
                                            <div>
                                                Estimated Output:
                                            </div>
                                            <div>
                                                {this.props.outputNumber(this.state.estimatedOutput1,4)} {this.state.selectedLPToken} + {this.props.outputNumber(this.state.estimatedOutput2,2)} USDC.
                                            </div>
                                        </div>
                                        :
                                            ''
                                        }                                        

                                        <div className="row"></div>                                
                                        <div className="row">
                                            <div className="col">
                                                {this.state.approvalButtonLPTokenVisible
                                                ?
                                                    <div className="py-3">
                                                        <div className="btn btn-fuchsia text-black w-100" id="buttonRounded" onClick={() =>this.approveLPToken()}>Approve LP-Token</div>
                                                    </div>
                                                :
                                                    ''
                                                }
                                                
                                                {this.state.removeLiquidityButtonVisible 
                                                    ?
                                                    <div className="py-3">
                                                        <button className="align-right btn btn-fuchsia text-black w-100" id="buttonRounded" role="button" onClick={() =>this.removeLiquidity()}>Remove liquidity</button>
                                                    </div>
                                                    :<div className="py-3">
                                                        <div className="self-align-rigt btn btn-accent w-100" id="buttonRounded">{this.state.buttonMessage}</div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : ''
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
 
export default Pool;