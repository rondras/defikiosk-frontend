import React, { Component } from 'react';
import { Modal} from "react-bootstrap";
import arrowDownWhite from '../img/arrow-down-white.png';
import arrowDown from '../img/arrow-down.png';
import doubleArrow from '../img/doubleArrow.png';
import axios from "axios";
import Zoom from 'react-reveal/Zoom';
class Market extends Component {
    
    constructor(props){
        super(props)
        this.state = { 
            assets: [],
            filteredAssets: [],
            selectedAsset: "Select asset:",
            selectedAssetBalance: 0,
            chooseAssetModalOpen: false,
            selectedAssetPrice: 0,
            slectedAssetVolume: 0,
            selectedUSDTVolume: 0,
            priceDataVisible: false,
            slippage: 0.01,
            approvalButtonVisible: false,
            sellPartVisible: false,
            buyPartVisible: true,
            style1: "col text-center bg-darkpurple text-light py-2",
            style2: "col text-center bg-darkAccent text-light py-2",
            priceImpactBuy:0,
            sellButtonVisible: false,
            buyButtonVisible: false,
            warningButtonVisible: false,
            warningButtonMessage: "warning",

        }
    }

    async componentDidMount() {
        this.setState({
            assets: ['wait'],
            USDTBalance: this.props.USDTBalance,
        });
        //check if the USDC Approval button needs to be shown
        let approvalGiven = await this.checkApproval(this.props.USDT_Address, this.props.MarketRouter_Address)
        if (approvalGiven === true) {
            this.setState({"USDApprovalButtonVisible":false})
            
        }
        else {
            this.setState({"USDApprovalButtonVisible":true})

        }
    };

    roundDown = (n,d) => {
        n = Math.floor(n*(10**d))
    
        n = n/(10**d)
        return n
    }

    openChooseAssetModal=()=>{
        let assets = [];
        let assetBalances = {};
        let assetAddresses = {};
        assets.push(["IPT",this.props.GovernanceTokenBalance,"ISSUAA Protocol Token"]);
        assetBalances["IPT"]= this.props.GovernanceTokenBalance;
        assetAddresses["IPT"] = this.props.GovernanceToken_Address;

        for (let key in this.props.assetDetails) {
            console.log(key)
            console.log(this.props.assetDetails[key])
            assets.push([key,this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['name']])
            assetBalances[key] = this.props.assetDetails[key]['tokenBalance1']
            assets.push(["i"+key,this.props.assetDetails[key]['tokenBalance2'],"short".concat(this.props.assetDetails[key]['name'])])
            assetBalances["i"+key] = this.props.assetDetails[key]['tokenBalance2']

            assetAddresses[key] = this.props.assetDetails[key]['Token1']
            assetAddresses["i"+key] = this.props.assetDetails[key]['Token2']
        }
        
        this.setState({assets:assets})
        this.setState({filteredAssets:assets})
        this.setState({assetBalances:assetBalances})
        this.setState({assetAddresses})
        this.setState({ chooseAssetModalOpen: true })  
        console.log(this.state.assets)   
    };
    
    closeChooseAssetModal = () => this.setState({ chooseAssetModalOpen: false });

    openChooseAssetModalSell=()=>{
        let assets = [];
        let assetBalances = {};
        let assetAddresses = {};
        if (this.props.GovernanceTokenBalance > 0.001) {
            assets.push(["IPT",this.props.GovernanceTokenBalance,"ISSUAA Protocol Token"]);
            assetBalances["IPT"]= this.props.GovernanceTokenBalance;
            assetAddresses["IPT"] = this.props.GovernanceToken_Address;
        }
        else {
            console.log(this.props.GovernanceTokenBalance)
        }
        
        for (let key in this.props.assetDetails) {
            console.log(key)
            console.log(this.props.assetDetails[key])
            if (this.props.assetDetails[key]['tokenBalance1']>0.00001){
                assets.push([key,this.props.assetDetails[key]['tokenBalance1'],this.props.assetDetails[key]['name']])
                assetBalances[key] = this.props.assetDetails[key]['tokenBalance1']
            }
            if (this.props.assetDetails[key]['tokenBalance2']>0.00001){
                assets.push(["i"+key,this.props.assetDetails[key]['tokenBalance2'],"short".concat(this.props.assetDetails[key]['name'])])
                assetBalances["i"+key] = this.props.assetDetails[key]['tokenBalance2']
            }

            assetAddresses[key] = this.props.assetDetails[key]['Token1']
            assetAddresses["i"+key] = this.props.assetDetails[key]['Token2']
        }
        
        this.setState({assets:assets})
        this.setState({filteredAssets:assets})
        this.setState({assetBalances:assetBalances})
        this.setState({assetAddresses})
        this.setState({ chooseAssetModalOpen: true })  
        console.log(this.state.assets)   
    };
    
    closeChooseAssetModal = () => this.setState({ chooseAssetModalOpen: false });
    
    filterAssets(){
        let filteredAssets =[];
        let searchTerm = document.getElementById('search').value.toLowerCase()
        for (let i = 0; i < this.state.assets.length; ++i) {
            if (this.state.assets[i][2].toLowerCase().includes(searchTerm) || this.state.assets[i][0].toLowerCase().includes(searchTerm)){
                filteredAssets.push(this.state.assets[i])
            }
            
        }
        this.setState({filteredAssets})

    }
    listAssets() {
        let assetOptions = this.state.filteredAssets.map((element,index) =>
                <li key={index} className="list-group-item selectAssetItem" role="button" onClick={()=>this.selectAsset(element[0])}>
                    <div className="row">
                        <div className="col-3"><b>{element[0]}</b></div>
                        <div className="col text-right"><b>{element[2]}</b></div>
                    </div>
                    <div className="row">
                        <div className="col">Balance: {this.props.outputNumber(element[1],6)}</div>
                    </div>
                </li>
        );
        return(assetOptions)
    }
     selectAsset = async(asset) =>{
        this.setState({"selectedAsset":asset});
        await this.setState({"selectedAssetAddress":this.state.assetAddresses[asset]})
        this.setState({"selectedAssetBalance": this.state.assetBalances[asset]});
        await this.setState({"selectedAssetAddress":this.state.assetAddresses[asset]})
        this.closeChooseAssetModal();
        
        let pair = await this.props.MarketFactory.methods.getPair(this.state.selectedAssetAddress,this.props.USDT_Address).call()
        await this.setState({"selectedLPPairAddress": pair});
        let MarketPair = new this.props.web3.eth.Contract(this.props.MarketPair_ABI,pair)
        let balanceWEI = await MarketPair.methods.balanceOf(this.props.address).call()
        var balance = parseFloat(this.props.web3.utils.fromWei(balanceWEI.toString(), 'ether'))
        let totalSupplyWEI = await MarketPair.methods.totalSupply().call();
        let reserves = await MarketPair.methods.getReserves().call();
        let token0 = await MarketPair.methods.token0().call();
        let token1 = await MarketPair.methods.token1().call();
        let kFactor = reserves[0] * reserves[1];
        this.setState({kFactor})
        this.setState({reserves0:reserves[0]})
        this.setState({reserves1:reserves[1]})
        this.setState({token0})
        this.setState({token1})
        this.setState({token1Balance: balanceWEI})
        console.log(reserves)
        let token1Ratio = parseInt(totalSupplyWEI) / reserves[0]
        let token2Ratio = parseInt(totalSupplyWEI) / reserves[1]
        this.setState({token1Ratio});
        this.setState({token2Ratio});
        let tokenPrice
        if (this.state.token0 === this.props.USDT_Address) {
            tokenPrice = reserves[0]/reserves[1]
        }
        else{
            tokenPrice = reserves[1]/reserves[0]
        }
        var tokenPriceUSD = tokenPrice * (10**(18-this.props.USDDecimals))
        this.setState({tokenPrice})
        this.setState({tokenPriceUSD})
        console.log(balance)
        console.log(token1Ratio)
        

        //check if the Approval button needs to be shown
        let approvalGiven = await this.checkApproval(this.state.selectedAssetAddress, this.props.MarketRouter_Address)
        console.log(approvalGiven)
        if (approvalGiven === true) {
            this.setState({"approvalButtonVisible":false})
            
        }
        else {
            this.setState({"approvalButtonVisible":true})

        }

        // set the input to zero and calculate freshly
        if (this.state.sellPartVisible) {
            document.getElementById('assetAmountIn').value = 0;
            this.calculateTradeResult()
        }
        else {
            document.getElementById('USDTAmountIn').value = 0;
            this.calculateBuyResult();
        }

        console.log(this.state)
        this.setState({priceDataVisible:false})
        
    }

    calculateTradeResult = async() =>{
        var AssetAmountIn = parseFloat(document.getElementById('assetAmountIn').value)*1000000000000000000
        
        // Check if the input is >0
        if (AssetAmountIn < 0){
            AssetAmountIn = this.state.AssetAmountIn
            document.getElementById('assetAmountIn').value = AssetAmountIn/1000000000000000000
        }
        
        // Check if there is enough balance
        console.log("Tokenbalance:", this.state.selectedAssetBalance)
        console.log("Amount chosen: ", AssetAmountIn)
        if (AssetAmountIn > parseFloat(this.state.selectedAssetBalance)*1000000000000000000) {
            console.log("Not enough balance");
            this.setState({sellButtonVisible:false});
            this.setState({warningButtonVisible:true});
            this.setState({warningButtonMessage:"Balance too low"});
        }
        else {
            this.setState({sellButtonVisible: true})
            this.setState({warningButtonVisible:false})
        }        

        
        var USDTPayoutAmount
        var liquidityProviderFee
        var actualPrice
        if (this.state.token0 === this.props.USDT_Address) {
            
            let newTokenReserves = parseInt(this.state.reserves1) + AssetAmountIn
            let newUSDTPoolBalance = this.state.kFactor / newTokenReserves
            USDTPayoutAmount = (parseInt(this.state.reserves0) - newUSDTPoolBalance) * 0.997
            liquidityProviderFee = (parseInt(this.state.reserves0) - newUSDTPoolBalance) * 0.003
            actualPrice = USDTPayoutAmount / AssetAmountIn
            console.log(actualPrice)
            document.getElementById('USDTPayoutAmount').value = (USDTPayoutAmount/(10**(this.props.USDDecimals))).toFixed(2)
        }
        else {
            let newTokenReserves = parseInt(this.state.reserves0) + AssetAmountIn
            let newUSDTPoolBalance = this.state.kFactor / newTokenReserves
            USDTPayoutAmount = (parseInt(this.state.reserves1) - newUSDTPoolBalance) * 0.997
            liquidityProviderFee = (parseInt(this.state.reserves1) - newUSDTPoolBalance) * 0.003
            actualPrice = USDTPayoutAmount / AssetAmountIn
            console.log(actualPrice)
            document.getElementById('USDTPayoutAmount').value = (USDTPayoutAmount/(10**(this.props.USDDecimals))).toFixed(2)
        }
        this.setState({USDTPayoutAmount});
        let USDTPayoutAmountMin = USDTPayoutAmount * (1-parseFloat(this.state.slippage))
        this.setState({actualPrice})
        this.setState({USDTPayoutAmountMin});
        this.setState({AssetAmountIn});
        this.setState({liquidityProviderFee});
        console.log(actualPrice)
        
        let priceImpact = ((actualPrice - parseFloat(this.state.tokenPrice))/parseFloat(this.state.tokenPrice))*-100
        console.log("Price impact",priceImpact)
        this.setState({priceImpact})
        if (priceImpact>0){this.setState({priceDataVisible:true}) } else {this.setState({priceDataVisible:false}) }  
        //this.setState({priceDataVisible:true}) 
    }

    calculateSellResultUSD = async() =>{
        var USDTPayoutAmount = parseFloat(document.getElementById('USDTPayoutAmount').value)*(10**(this.props.USDDecimals))
        
        // Check if the input is >0
        if (USDTPayoutAmount < 0){
            USDTPayoutAmount = this.state.USDTPayoutAmount // CHECK
            document.getElementById('USDTPayoutAmount').value = USDTPayoutAmount/-(10**this.props.USDDecimals)
        }
        
        var liquidityProviderFee
        var actualPrice
        var AssetAmountIn

        if (this.state.token0 === this.props.USDT_Address) {
            let newUSDTPoolBalance = parseInt(this.state.reserves0) - USDTPayoutAmount 
            let newTokenReserves = this.state.kFactor / newUSDTPoolBalance
            AssetAmountIn = -(this.state.reserves1 - newTokenReserves)/0.997
            document.getElementById('assetAmountIn').value = (AssetAmountIn/(1000000000000000000)).toFixed(9)
            liquidityProviderFee = (parseInt(this.state.reserves0) - newUSDTPoolBalance) * 0.003
            actualPrice = USDTPayoutAmount / AssetAmountIn
            
        }
        else {
            let newUSDTPoolBalance = parseInt(this.state.reserves1) - USDTPayoutAmount 
            let newTokenReserves = this.state.kFactor / newUSDTPoolBalance
            AssetAmountIn = -(this.state.reserves0 - newTokenReserves)/0.997
            document.getElementById('assetAmountIn').value = (AssetAmountIn/(1000000000000000000)).toFixed(9)
            liquidityProviderFee = (parseInt(this.state.reserves1) - newUSDTPoolBalance) * 0.003
            actualPrice = USDTPayoutAmount / AssetAmountIn
        }

        // Check if there is enough balance
        console.log("USD balance:", this.props.USDTBalance)
        console.log("Amount chosen: ", AssetAmountIn)
        if (AssetAmountIn > parseFloat(this.state.selectedAssetBalance)*1000000000000000000) {
            console.log("Not enough balance");
            this.setState({sellButtonVisible:false});
            this.setState({warningButtonVisible:true});
            this.setState({warningButtonMessage:"Balance too low"});
        }
        else {
            this.setState({sellButtonVisible: true})
            this.setState({warningButtonVisible:false})
        }

        this.setState({USDTPayoutAmount});
        let USDTPayoutAmountMin = USDTPayoutAmount * (1-parseFloat(this.state.slippage))
        this.setState({USDTPayoutAmountMin});
        this.setState({AssetAmountIn});
        this.setState({liquidityProviderFee});
        this.setState({actualPrice})
        console.log(this.state.actualPrice)
        console.log(parseFloat(this.state.tokenPrice))
        let priceImpact = ((actualPrice - parseFloat(this.state.tokenPrice))/parseFloat(this.state.tokenPrice))*-100
        console.log("Price impact",priceImpact)
        this.setState({priceImpact})
        if (priceImpact>0){this.setState({priceDataVisible:true}) } else {this.setState({priceDataVisible:false}) }  
        //this.setState({priceDataVisible:true}) 
    }

    calculateBuyResult = async() =>{
        // Check if the input is greater zero
        var USDTAmountIn = parseFloat(document.getElementById('USDTAmountIn').value)*(10**this.props.USDDecimals)
        if (USDTAmountIn < 0){
            USDTAmountIn = this.state.USDTAmountIn
            document.getElementById('USDTAmountIn').value = USDTAmountIn/(10**this.props.USDDecimals)
        }
        
        // Check if there is enough balance
        console.log("USDbalance:", this.props.USDTBalance)
        console.log("Amount chosen: ", USDTAmountIn)
        if (USDTAmountIn > parseFloat(this.props.USDTBalance)*(10**this.props.USDDecimals)) {
            console.log("Not enough balance");
            this.setState({buyButtonVisible:false});
            this.setState({warningButtonVisible:true});
            this.setState({warningButtonMessage:"Balance too low"});
        }
        else {
            this.setState({buyButtonVisible: true})
            this.setState({warningButtonVisible:false})
        }  

        console.log(USDTAmountIn)
        var TokenPayoutAmount
        var liquidityProviderFee = USDTAmountIn * 0.003
        var actualPrice
        if (this.state.token1 === this.props.USDT_Address) {
            let newUSDTPoolBalance = parseInt(this.state.reserves1) + USDTAmountIn
            let newTokenReserves = this.state.kFactor / newUSDTPoolBalance
            TokenPayoutAmount = (parseInt(this.state.reserves0) - newTokenReserves) * 0.997
            
            actualPrice = USDTAmountIn / TokenPayoutAmount
            document.getElementById('TokenPayoutAmount').value = (TokenPayoutAmount/(1000000000000000000)).toFixed(6)
        }
        else if (this.state.token0 === this.props.USDT_Address){
            let newUSDTPoolBalance = parseInt(this.state.reserves0) + USDTAmountIn
            let newTokenReserves = this.state.kFactor / newUSDTPoolBalance
            console.log(newTokenReserves)
            TokenPayoutAmount = (parseInt(this.state.reserves1) - newTokenReserves) * 0.997
            actualPrice = USDTAmountIn / TokenPayoutAmount
            document.getElementById('TokenPayoutAmount').value = (TokenPayoutAmount/(1000000000000000000)).toFixed(6)
        }
        this.setState({TokenPayoutAmount});
        let TokenPayoutAmountMin = TokenPayoutAmount * (1-parseFloat(this.state.slippage))
        this.setState({TokenPayoutAmountMin});
        this.setState({USDTAmountIn});
        this.setState({liquidityProviderFee});
        this.setState({actualPrice})
        console.log(actualPrice)
        console.log(parseFloat(this.state.tokenPrice))
        let priceImpactBuy = ((actualPrice - parseFloat(this.state.tokenPrice))/parseFloat(this.state.tokenPrice))*100
        console.log("Price impact",priceImpactBuy)
        this.setState({priceImpactBuy})   
        if (priceImpactBuy>0){this.setState({priceDataVisible:true}) } else {this.setState({priceDataVisible:false}) }  
    }

    calculateBuyResultToken = async() =>{
        // Check if the input is greater zero
        var TokenPayoutAmount = parseFloat(document.getElementById('TokenPayoutAmount').value)*1000000000000000000
        if (TokenPayoutAmount < 0){
            TokenPayoutAmount = this.state.TokenPayoutAmount
            document.getElementById('TokenPayoutAmount').value = TokenPayoutAmount/-1000000000000000000
        }
        var actualPrice
        var USDTAmountIn

        if (this.state.token0 === this.props.USDT_Address) {
            let newTokenReserves = parseInt(this.state.reserves1) - TokenPayoutAmount
            let newUSDTPoolBalance = this.state.kFactor / newTokenReserves
            USDTAmountIn = (newUSDTPoolBalance - parseInt(this.state.reserves0))/0.997
            actualPrice = USDTAmountIn / TokenPayoutAmount
            document.getElementById('USDTAmountIn').value = (USDTAmountIn/(10**this.props.USDDecimals)).toFixed(2)
        }
        else if (this.state.token1 === this.props.USDT_Address){
            let newTokenReserves = parseInt(this.state.reserves0) - TokenPayoutAmount
            let newUSDTPoolBalance = this.state.kFactor / newTokenReserves
            USDTAmountIn = ((newUSDTPoolBalance - parseInt(this.state.reserves1)))/0.997
            actualPrice = USDTAmountIn / TokenPayoutAmount
            document.getElementById('USDTAmountIn').value = (USDTAmountIn/(10**this.props.USDDecimals)).toFixed(2)
            
        }

        // Check if there is enough balance
        console.log("USDbalance:", this.props.USDTBalance)
        console.log("Amount chosen: ", USDTAmountIn)
        if (USDTAmountIn > parseFloat(this.props.USDTBalance)*1000000000000000000) {
            console.log("Not enough balance");
            this.setState({buyButtonVisible:false});
            this.setState({warningButtonVisible:true});
            this.setState({warningButtonMessage:"Balance too low"});
        }
        else {
            this.setState({buyButtonVisible: true})
            this.setState({warningButtonVisible:false})
        }  

        var liquidityProviderFee = USDTAmountIn * 0.003
        
        this.setState({TokenPayoutAmount});
        let TokenPayoutAmountMin = TokenPayoutAmount * (1-parseFloat(this.state.slippage))
        TokenPayoutAmountMin = this.roundDown(TokenPayoutAmountMin,14).toFixed(14).replace(/\.?0+$/,"");
        

        this.setState({TokenPayoutAmountMin});
        this.setState({USDTAmountIn});
        this.setState({liquidityProviderFee});
        console.log(actualPrice)
        
        let priceImpactBuy = ((actualPrice - parseFloat(this.state.tokenPrice))/parseFloat(this.state.tokenPrice))*100
        console.log("Price impact",priceImpactBuy)
        this.setState({priceImpactBuy})   
        if (priceImpactBuy>0){this.setState({priceDataVisible:true}) } else {this.setState({priceDataVisible:false}) }  
    }



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
                    return(false)
                }  
            }
            
        }
        this.props.closeMessageBox()
        return (true)
    };

    sell = async() =>{
        console.log("Starting to trade")
        let message = "Selling tokens"
        this.props.openMessageBox(message)
        let MarketRouter = this.props.MarketRouter;

        
        var amountInRaw = (parseFloat(this.state.AssetAmountIn)).toLocaleString('fullwide', {useGrouping:false})
        console.log(amountInRaw)
        var amountIn = this.props.web3.utils.toBN(amountInRaw)
                
        let amountOutMinRaw = parseInt(this.state.USDTPayoutAmountMin).toLocaleString('fullwide', {useGrouping:false})
        console.log(amountOutMinRaw)
        let amountOutMin = this.props.web3.utils.toBN(amountOutMinRaw)

        let path = [this.state.selectedAssetAddress,this.props.USDT_Address]
        let to = this.props.address;
        let deadline = Math.round(+new Date()/1000) + (60*10)
        console.log(amountIn)
        console.log(amountOutMin)
        console.log(deadline)
        console.log(path)
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
            await MarketRouter.methods.swapExactTokensForTokens(amountIn,amountOutMin,path,to,deadline).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
                    await this.props.loadUSDBalance();
                    await this.props.updateAssetBalanceWithAddress(this.state.selectedAssetAddress);
                    await this.props.updatePortfolioValue();
                    document.getElementById('assetAmountIn').value = 0;
                    
                    console.log(this)
                    let newBalance = parseFloat(this.state.selectedAssetBalance) -parseFloat(this.state.AssetAmountIn/1e18);
                    this.setState({selectedAssetBalance: newBalance});
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



    buy = async() =>{
        console.log("Starting to buy assets")
        let message = "Buying tokens"
        this.props.openMessageBox(message)
        let MarketRouter = this.props.MarketRouter;

        
        var amountInRaw = (parseInt(this.state.USDTAmountIn)).toLocaleString('fullwide', {useGrouping:false})
        console.log(amountInRaw)
        var amountIn = this.props.web3.utils.toBN(amountInRaw)
                
        let amountOutMinRaw = parseInt(this.state.TokenPayoutAmountMin).toLocaleString('fullwide', {useGrouping:false})
        console.log(amountOutMinRaw)
        let amountOutMin = this.props.web3.utils.toBN(amountOutMinRaw)


        let path = [this.props.USDT_Address,this.state.selectedAssetAddress]
        let to = this.props.address;
        let deadline = Math.round(+new Date()/1000) + (60*10)
        console.log(amountIn)
        console.log(amountOutMin)
        console.log(deadline)
        console.log(path)
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
            await MarketRouter.methods.swapExactTokensForTokens(amountIn,amountOutMin,path,to,deadline).send({from: this.props.address, gasPrice: gasPrice})
            .on('receipt', async (receipt) => {
                console.log(receipt);
                if (receipt.status === true) {
                    let newBalance = parseFloat(this.state.TokenPayoutAmount/1e18) + parseFloat(this.state.selectedAssetBalance);
                    this.setState({selectedAssetBalance: newBalance});
                    await this.props.loadUSDBalance();
                    await this.props.updateAssetBalanceWithAddress(this.state.selectedAssetAddress);
                    let assetDetails = this.props.assetDetails;
                    console.log(assetDetails)
                    console.log(assetDetails.length)
                    console.log(typeof(assetDetails))
                    document.getElementById('USDTAmountIn').value = 0;
                    
                    await this.props.updatePortfolioValue()
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

    checkApproval = async(tokenAddress, approvalAddress) =>{  
        
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,tokenAddress)
        var amountRaw = "100000000000000000000000000000"
        var amount = this.props.web3.utils.toBN(amountRaw)
        
        let allowance = await tokenContract.methods.allowance(this.props.address, approvalAddress).call()

        if (parseInt(allowance) < parseInt(amount)){
            return(false)
        }
        else {return (true)}
    };

    approveAccount1 = async(tokenAddress,approvalAddress) =>{  
        
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
                return(false)
            }  
        }
        this.props.closeMessageBox()
        return (true)
    };

    approveMarketRouter = async() =>{
        let trx_status = await this.approveAccount1(this.state.selectedAssetAddress,this.props.MarketRouter_Address)
        if (trx_status){this.setState({approvalButtonVisible: false})}
    }

    approveMarketRouterUSD = async() =>{
        let trx_status = await this.approveAccount1(this.props.USDT_Address,this.props.MarketRouter_Address);
        if (trx_status) {this.setState({USDApprovalButtonVisible: false})}

        
    }

    showSell = async() =>{
        await this.setState({
            style1: "col text-center bg-darkAccent text-light py-2",
            style2: "col text-center bg-darkpurple text-light py-2",

            sellPartVisible: true,
            buyPartVisible: false,
        })
        document.getElementById('assetAmountIn').value = 0;
        this.calculateTradeResult()
    }

    showBuy = async() =>{
        await this.setState({
            style1: "col text-center bg-darkpurple text-light py-2",
            style2: "col text-center bg-darkAccent text-light py-2",
            sellPartVisible: false,
            buyPartVisible: true,
            
        })
        document.getElementById('USDTAmountIn').value = 0;
        this.calculateBuyResult();

    }

    setMaxSellBalanceToken = async() =>{
        //document.getElementById('assetAmountIn').value = this.state.selectedAssetBalance;
        document.getElementById('assetAmountIn').value = this.roundDown(this.state.selectedAssetBalance,14).toFixed(14).replace(/\.?0+$/,"");
        this.calculateTradeResult()
    }

    setMaxBuyBalanceUSD = async() =>{
        document.getElementById('USDTAmountIn').value = this.roundDown(this.props.USDTBalance,6).toFixed(14).replace(/\.?0+$/,"");
        this.calculateBuyResult()
    }

    render() { 
        console.log(this.state)
        
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
                            <ul className="list-group">
                                {this.listAssets()}
                            </ul>
                        </Modal.Body>
                            
                        
                    </Modal>

                    <Zoom>
                        <div className="row">
                            <div className="col"></div>
                            <div id="mainBox" className="col-5 container text-light p-0">
                                <div className="container">
                                    <div className="row">
                                        <div id="mainBoxUpLeft" className={this.state.style1} role="button" onClick={this.showBuy}>Buy</div>
                                        <div id="mainBoxUpRight" className={this.state.style2} role="button" onClick={this.showSell}>Sell</div>
                                    </div>
                                </div>
                                {this.state.sellPartVisible 
                                ?
                                <div id="mainBoxDown" className="px-4 py-4">
                                
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div className="row text-small">
                                            <div className="col align-self-start">You are selling:</div>
                                            <div role="button" onClick={this.setMaxSellBalanceToken} className="col textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.state.selectedAssetBalance,6)} (Max)</span></div>
                                        </div>

                                        
                                        <div className="row">
                                            <div className="col">
                                                <input id="assetAmountIn" onChange={() =>this.calculateTradeResult()} className="form-control form-control-lg bg-innerBox " type="text" lang="en" placeholder="0"/>
                                            </div>
                                            <div className="col text-right my-auto">
                                                <div className="btn my-auto btn-accent" id="buttonRounded" onClick={this.openChooseAssetModalSell}>
                                                    <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center justify-content-center h-100 py-4">
                                            <img src={doubleArrow} alt="switch" height="30"/> 
                                        </div>
                                         
                                    </div>
                                    
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div className="row">
                                            <div className="col align-self-start">You are receiving:</div>
                                            <div className="col align-self-end text-lg-right">Balance: {this.props.outputNumber(this.props.USDTBalance,2)}</div>
                                        </div>

                                        
                                        <div className="row">
                                            <div className="col">
                                                <input id="USDTPayoutAmount" onChange={() =>this.calculateSellResultUSD()} className="form-control form-control-lg bg-innerBox" type="text" lang="en" placeholder="0"/>
                                            </div>
                                            <div id="tradeBoxText" className="my-auto col text-right">USDC</div>
                                        </div>
                                    </div>
                                    {this.state.priceDataVisible 
                                        ?
                                        <div className="container  py-4 pr-4 bg-darkpurple">
                                            <div className="row text-light">
                                                <div className="col align-self-start">Price:</div>
                                                <div className="col align-self-end text-lg-right">USDC per {this.state.selectedAsset}: {parseFloat(this.state.actualPrice*10e11).toFixed(3)}</div>
                                            </div>
                                        </div>

                                        : ''
                                    }
                                    {this.state.approvalButtonVisible && this.state.priceDataVisible
                                    ?
                                        <div className="py-3">
                                            <div className="btn btn-fuchsia w-100" id="buttonRounded" onClick={() =>this.approveMarketRouter()}>Approve</div>
                                        </div>
                                    :
                                        ''
                                    }
                                    
                                    {this.state.approvalButtonVisible === false && this.state.priceDataVisible && this.state.sellButtonVisible
                                        ?
                                        <div className="py-3">
                                            <div className="btn btn-fuchsia w-100" id="buttonRounded" onClick={this.sell}>Trade</div>
                                        </div>
                                        :
                                        ''
                                    }
                                    {this.state.warningButtonVisible
                                        ?
                                        <div className="py-3">
                                            <div className="btn btn-nav w-100" id="buttonRounded">{this.state.warningButtonMessage}</div>
                                        </div>
                                        :
                                        ''
                                    }


                                    {this.state.priceDataVisible 
                                    ?
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div>Minimum to receive: {this.props.outputNumber(parseFloat(this.state.USDTPayoutAmountMin/(10**this.props.USDDecimals)),2)}</div>
                                        <div>Price impact: {this.props.outputNumber(this.state.priceImpact,2)}%</div>
                                        <div>Liquidity Provide Fee: {this.props.outputNumber(parseFloat(this.state.liquidityProviderFee)/(10**this.props.USDDecimals),2)} USDC</div>
                                    </div>
                                    :
                                    ''
                                    }
                                </div>
                                :
                                ''
                            }


                                {this.state.buyPartVisible
                                ?
                                <div id="mainBoxDown" className="bg-darkpurple px-4 py-4 border">
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div className="row">
                                            <div className="col align-self-start">You are paying:</div>
                                            <div role="button" id="buttonRounded" onClick={this.setMaxBuyBalanceUSD} className="col textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(parseFloat(this.props.USDTBalance),4)} (Max)</span></div>
                                        </div>

                                        
                                        <div className="row">
                                            <div className="col">
                                                <input className="bg-innerBox" id="USDTAmountIn" onChange={() =>this.calculateBuyResult()} className="form-control form-control-lg bg-innerBox" type="text" lang="en" placeholder="0"/>
                                            </div>

                                            <div id="tradeBoxText" className="my-auto col text-right">USDC</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-flex align-items-center justify-content-center h-100 py-4">
                                            <img src={doubleArrow} alt="switch" height="30"/>   
                                        </div>
                                         
                                    </div>    

                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div className="row text-small">
                                            <div className="col align-self-start">You are buying:</div>
                                            <div className="col align-self-end text-lg-right">Balance: {this.props.outputNumber(parseFloat(this.state.selectedAssetBalance),4)}</div>
                                        </div>

                                    

                                        <div className="row">
                                            <div className="col">
                                                <input id="TokenPayoutAmount" onChange={() =>this.calculateBuyResultToken()} className="form-control form-control-lg bg-innerBox" type="text" lang="en" placeholder="0"/>
                                            </div>
                                            <div className="col text-right my-auto">
                                                <div className="btn my-auto btn-accent" id="buttonRounded" onClick={this.openChooseAssetModal}>
                                                    <div>{this.state.selectedAsset} <img src={arrowDown} alt="switch" height="15"/>   </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    
                                    
                                    {this.state.priceDataVisible 
                                        ?
                                        <div className="container  py-4 pr-4 bg-darkpurple">
                                            <div className="row text-light">
                                                <div className="col align-self-start">Price:</div>
                                                <div className="col align-self-end text-lg-right">USDC per {this.state.selectedAsset}: {this.props.outputNumber(parseFloat(this.state.actualPrice*10e11),3)}</div>
                                            </div>
                                        </div>

                                        : ''
                                    }
                                    {this.state.USDApprovalButtonVisible && this.state.priceDataVisible
                                    ?
                                        <div className="py-3">
                                            <div className="btn btn-fuchsia w-100" id="buttonRounded" onClick={() =>this.approveMarketRouterUSD()}>Approve</div>
                                        </div>
                                    :
                                        ''
                                    }
                                    
                                    {this.state.USDApprovalButtonVisible === false && this.state.priceDataVisible && this.state.buyButtonVisible
                                        ?
                                        <div className="py-3">
                                            <div className="btn btn-fuchsia w-100" id="buttonRounded" onClick={this.buy}>Trade</div>
                                        </div>
                                        :
                                        ''
                                    }
                                    {this.state.warningButtonVisible
                                        ?
                                        <div className="py-3">
                                            <div className="btn btn-warningButton w-100" id="buttonRounded">{this.state.warningButtonMessage}</div>
                                        </div>
                                        :
                                        ''
                                    }

                                    {this.state.priceDataVisible 
                                    ?
                                    <div id="subBox" className="container px-4 py-4 text-black bg-innerBox">
                                        <div>Minimum to receive: {this.props.outputNumber(parseFloat(this.state.TokenPayoutAmountMin/1000000000000000000),6)}</div>
                                        <div>Price impact: {parseFloat(this.state.priceImpactBuy).toFixed(2)}%</div>
                                        <div>Liquidity Provider Trading Fee: {this.props.outputNumber(parseFloat(this.state.liquidityProviderFee/(10**this.props.USDDecimals)),2)} USDC</div>
                                    </div>
                                    :
                                    ''
                                    }
                                </div>
                                :
                                ''
                            }    

                            </div>
                            


                            <div className="col"></div>
                        </div>
                    </Zoom>
                </div>
                        
                        
            </div>
        );
    }
}
 
export default Market;