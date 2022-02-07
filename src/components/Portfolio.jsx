import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import info from '../img/ISSUAA-i.png';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Zoom from 'react-reveal/Zoom';

class Portfolio extends Component {
    state = { 
    assetDetails: null,       
    };

    async componentDidMount() {
        this.setState({
            assets: ['wait'],
            freezeModalOpen: false,
            assetToFreeze: "",
            assetToVote: "",
            voteModalOpen: false,
            assetToClose: "",

            closeModalOpen: false,
            finalPriceModalOpen: false ,
            assetToVoteOnFinalPrice: "",
            initiateExpiryVoteModalOpen: false ,
            assetToInitiateExpiryVote: "",
            closeExpiryVoteModalOpen: false,
            assetToCloseExpiryVote: "",
            assetDetails: this.props.assetDetails,
           
        });
        console.log(this.props.assetDetails)
        console.log(Date.now())
        await this.loadPortfolio();
    };

    getAssets() {
        let assets = this.props.assets;
        return assets;
    };
    getAssetsAll() {
        let allAssets = [];
        let assets = this.props.assets;
        for (let i = 0; i < assets.length; ++i) {
            console.log(assets[i])
            //newAsset = this.props.assetDetails[]
            allAssets.push(assets[i])
            allAssets.push("i"+assets[i])
        }
        return allAssets;
    };

    
     loadPortfolio = async() => {
        var portfolio = {}
        var portfolioAssets =[]
        portfolio["IPT"] = {}
        if (this.props.GovernanceTokenTotalBalance >0.01){
            portfolio["IPT"]['name'] = "Issuaa Protocol Token"
            portfolio["IPT"]['balance'] = this.props.GovernanceTokenTotalBalance
            portfolio["IPT"]['expiryDate'] = ""
            portfolio["IPT"]['upperLimit'] = ""
            portfolio["IPT"]['isFrozen'] = ""
            portfolio["IPT"]['price'] = this.props.INTPrice
            portfolio["IPT"]['portfolioValue'] = this.props.INTPrice * this.props.GovernanceTokenTotalBalance
            portfolioAssets.push("IPT")
        }

        portfolio["USD"] = {}
        if (this.props.USDTBalance >0.01){
            portfolio["USD"]['name'] = "USDC"
            portfolio["USD"]['balance'] = this.props.USDTBalance
            portfolio["USD"]['expiryDate'] = ""
            portfolio["USD"]['upperLimit'] = ""
            portfolio["USD"]['isFrozen'] = ""
            portfolio["USD"]['price'] = 1
            portfolio["USD"]['portfolioValue'] = this.props.USDTBalance
            portfolioAssets.push("USD")
        }

        var assets = this.getAssets();
        
        if (typeof(this.props.assetDetails) != 'undefined' && typeof(this.props.assets) != 'undefined' && typeof(this.props.USDT_Address)){
            console.log(this.state.portfolio)
            console.log(this.state.portfolioAssets)
            for (let i = 0; i < assets.length; ++i) {
                
                console.log(assets[i]);
                let asset=assets[i]
                console.log(this.props.assetDetails[asset]['tokenBalance1'])
                if (parseFloat(this.props.assetDetails[asset]['tokenBalance1'])>0.0000001) {
                    // Get the token price
                    let tokenAddress = this.props.assetDetails[asset][0]
                    let pair = await this.props.MarketFactory.methods.getPair(tokenAddress,this.props.USDT_Address).call();
                    let MarketPair = new this.props.web3.eth.Contract(this.props.MarketPair_ABI,pair);
                    let reserves = await MarketPair.methods.getReserves().call();
                    let token0 = await MarketPair.methods.token0().call();
                    let tokenPrice
                    if (token0 === this.props.USDT_Address) {
                        tokenPrice = reserves[0]*(10**(18-this.props.USDDecimals))/reserves[1]
                    }
                    else{
                        tokenPrice = reserves[1]/reserves[0]*(10**(18-this.props.USDDecimals))
                    }


                    

                    portfolio[asset] = {}
                    portfolio[asset]['name'] = this.props.assetDetails[asset]['name']
                    portfolio[asset]['balance'] = this.props.assetDetails[asset]['tokenBalance1']
                    portfolio[asset]['expiryDate'] = this.props.assetDetails[asset]['expiryTime']
                    portfolio[asset]['upperLimit'] = this.props.assetDetails[asset]['upperLimit']
                    portfolio[asset]['isFrozen'] = this.props.assetDetails[asset]['frozen']
                    let price = tokenPrice
                    portfolio[asset]['price'] = price
                    portfolio[asset]['portfolioValue'] = parseFloat(this.props.assetDetails[asset]['tokenBalance1']) * price
                    portfolioAssets.push(assets[i])
                }
                if (parseFloat(this.props.assetDetails[asset]['tokenBalance2'])>0.0000001) {
                    // Get the token price
                    let tokenPrice1
                    let tokenAddress = this.props.assetDetails[asset][1]
                    let pair = await this.props.MarketFactory.methods.getPair(tokenAddress,this.props.USDT_Address).call();
                    let MarketPair = new this.props.web3.eth.Contract(this.props.MarketPair_ABI,pair);
                    let reserves = await MarketPair.methods.getReserves().call();
                    let token0 = await MarketPair.methods.token0().call();
                    if (token0 === this.props.USDT_Address) {
                        tokenPrice1 = reserves[0]*(10**(18-this.props.USDDecimals))/reserves[1]
                    }
                    else{
                        tokenPrice1 = reserves[1]/reserves[0]*(10**(18-this.props.USDDecimals))
                    }

                    portfolio["i"+asset] = {}
                    portfolio["i"+asset]['name'] = "Inverse "+this.props.assetDetails[asset]['name']
                    portfolio["i"+asset]['balance'] = this.props.assetDetails[asset]['tokenBalance2']
                    portfolio["i"+asset]['expiryDate'] = this.props.assetDetails[asset]['expiryTime']
                    portfolio["i"+asset]['upperLimit'] = this.props.assetDetails[asset]['upperLimit']
                    portfolio["i"+asset]['isFrozen'] = this.props.assetDetails[asset]['frozen']
                    let price = tokenPrice1
                    portfolio["i"+asset]['price'] = price
                    portfolio["i"+asset]['portfolioValue'] = parseFloat(this.props.assetDetails[asset]['tokenBalance2']) * price
                    portfolioAssets.push("i"+assets[i])
                }

            }
            console.log(portfolio)
            console.log(portfolioAssets)
            this.setState({portfolio})
            this.setState({portfolioAssets})
        }

        
    }

    timeStampToDate(timestamp) {
        var date = new Date(timestamp * 1000)
        const options = {year: '2-digit', month: '2-digit', day: '2-digit' };
        let formattedDate = date.toLocaleDateString(undefined,options);
        console.log(formattedDate)
        return(formattedDate);
    }

    render() { 

        const tooltip1 = props => (
            <Tooltip {...props}>
            Your liquidity provider tokens reflecting your assets and cash locked in the ISSUAA pools.
            </Tooltip>
        );
        const tooltip2 = props => (
            <Tooltip {...props}>
            Your ISSUAA Assets portfolio available for trading; the exception are your IPT tokens, which are staked or not vested yet.
            </Tooltip>
        );


        if (!this.state.assetDetails) {
            return <div />
        }
        //var AssetOptions = ['loading']
        var assets = this.getAssets();
        if (typeof(this.props.assets) !== 'undefined'){
            console.log(typeof(assets))
            console.log(assets)
            //AssetOptions = assets
        }

        

        let assetOutput
        if (typeof(this.props.assetDetails) !== 'undefined' && typeof(this.props.assets) != 'undefined'  && typeof(this.state.portfolio) != 'undefined' && typeof(this.state.portfolioAssets) != 'undefined'){
            console.log(this.state.portfolio)
            console.log(this.props.assetDetails);
            assets = this.getAssetsAll();
            console.log(assets);
            console.log(this.props.assets);
            console.log(this.state.portfolioAssets)
            
            assetOutput = this.state.portfolioAssets.map((asset,index) =>

                    
                        <tr key ={index}>
                            <td className="text-left">{asset}</td>
                            <td className="text-left">{this.state.portfolio[asset]['name']}</td>
                            <td className="text-right">{this.props.outputNumber(parseFloat(this.state.portfolio[asset]['price']),2)}</td>
                            <td className="text-right">{this.props.outputNumber(parseFloat(this.state.portfolio[asset]['balance']),6)}</td>
                            <td className="text-right">{(asset !== "IPT" & asset !== "USD") ? this.timeStampToDate(parseInt(this.state.portfolio[asset]['expiryDate'])):'n.a.'}</td>
                            <td className="text-right">{(asset !== "IPT" & asset !== "USD") ? this.props.outputNumber((parseFloat(this.state.portfolio[asset]['upperLimit'])/1000),2):'n.a.'}</td>
                            {this.state.portfolio[asset]['frozen']?<td className="text-right">frozen</td>:<td className="text-right">live</td>}
                            <td className="text-right">{this.props.outputNumber(parseFloat(this.state.portfolio[asset]['portfolioValue']),0)}</td>
                            
                        </tr>

                        
               
            );  
        } ;   

        let LPOutput
        let myPools = []
        console.log(this.props.pools)
        if (typeof(this.props.pools) !== 'undefined' & this.props.assetDetails !== 'undefined'){
            for (let i=0; i<this.props.pools.length; i++) {
                if (((this.props.pools[i][4]/this.props.pools[i][5])*this.props.pools[i][2])/10e18 >= 0.1){
                    myPools.push(this.props.pools[i])
                }
            console.log(myPools)

            LPOutput = myPools.map((pool,index) =>

                        
                        <tr key ={index}>
                            <td className="text-left">{pool[0]}</td>
                            <td className="text-left">{pool[3]}</td>
                            <td className="text-right">{this.props.outputNumber((parseFloat(pool[4])/1e18),8)}</td>
                            <td className="text-right">{this.props.outputNumber((((parseFloat(pool[4])/parseFloat(pool[5]))*pool[8])/1e18),3)} {pool[0]} & {this.props.outputNumber((((parseFloat(pool[4])/parseFloat(pool[5]))*pool[2]*0.5)/1e18),0)} USDC</td>
                            <td className="text-right">{((parseFloat(pool[4])/parseFloat(pool[5]))*100).toFixed(2)}%</td>
                            <td className="text-right">{this.props.outputNumber((((parseFloat(pool[4])/parseFloat(pool[5]))*parseFloat(pool[2])/1e18)),0)}</td>
                            
                        </tr>                        
            );  
            }        
        }    
        
       
        return ( 
            
                <div className="container-fluid">

                    <Modal show={this.state.closeModalOpen} onHide={this.closeCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Close the Vote on the following Asset?</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                               {this.state.assetToClose}
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={this.initiateClose}>Yes</Button>
                            <Button variant="warning" onClick={this.closeCloseModal}>No</Button>
                        </Modal.Footer>
                    </Modal>

                    <Zoom>
                    <div className="row">
                        <div className="col-0 col-xl-1"></div>
                        <div id="mainBox" className="col-8 container text-light p-4">
                            <div className="container" id="innerBox">
                                <div className="row">
                                    <div className="text-white h-5 p-3">
                                        <h3>Total portfolio value: {this.props.outputNumber(this.props.totalValue,0)} USDC</h3>
                                    </div>
                                    <p>&nbsp;</p>
                                </div>

                                <div className="row">
                                    <div className="text-light h-5 pl-3 py-0">
                                        <h5>
                                            <OverlayTrigger placement="right" overlay={tooltip2}>
                                                <img className="mr-2" src={info} alt="Info"/>
                                            </OverlayTrigger>
                                            Your Assets:
                                            
                                        </h5>
                                    </div>
                                </div>
                                <div className="row">    
                                    <div className="p-3 w-100">
                                        <table className="table  w-100">
                                            <thead className="">
                                                <th className="text-left" scope="col">Symbol</th>
                                                <th className="text-left" scope="col">Name</th>
                                                <th className="text-right" scope="col">Price</th>                                            
                                                <th className="text-right" scope="col">Position</th>
                                                <th className="text-right" scope="col">Expiry Date</th>
                                                <th className="text-right" scope="col">Upper limit</th>
                                                <th className="text-right" scope="col">Status?</th>
                                                <th className="text-right" scope="col">Value (USDC)</th>
                                            </thead>
                                        
                                            <tbody>
                                                
                                            {assetOutput}
                                            <tr>
                                                <td className="text-left"><b>Total</b></td>
                                                <td className="text-right"></td>
                                                <td></td>                                            
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="text-right"><b>{this.props.outputNumber(this.props.assetValue,0)}</b></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                                <div className="row">
                                    <div className="text-light h-5 pl-3 py-0">
                                        <h5>
                                            <OverlayTrigger placement="right" overlay={tooltip1}>
                                                <img className="mr-2" src={info} alt="Info"/>
                                            </OverlayTrigger>
                                            Your liquidity provider tokens:
                                            
                                        </h5>
                                        
                                    </div>
                                </div>
                                <div className="row">    
                                    <div className="p-3 w-100">
                                        <table className="table w-100">
                                            <thead className="">
                                                <th className="text-left" scope="col">Symbol</th>
                                                <th className="text-left" scope="col">Name</th>
                                                <th className="text-right" scope="col">LP-Balance</th>
                                                <th className="text-right" scope="col">Withdrawable Assets</th>                                            
                                                <th className="text-right" scope="col">Pool share</th>
                                                <th className="text-right" scope="col">Value (USDC)</th>
                                            </thead>
                                            <tbody>
                                            {LPOutput}
                                            <tr>
                                                <td className="text-left"><b>Total</b></td>
                                                <td></td>
                                                <td></td>                                            
                                                <td></td>
                                                <td></td>
                                                <td className="text-right"><b>{this.props.outputNumber(this.props.LPValue,0)}</b></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>  
                                </div>
                            </div>
                        </div>
                        <div className="col-0 col-xl-1"></div>
                    </div>
                    </Zoom>
                </div>
             


            
         );
    }
}
 
export default Portfolio;