import React, { Component } from 'react';
import Zoom from 'react-reveal/Zoom';
import { Modal,OverlayTrigger, Overlay, Tooltip, Button, ToggleButton } from 'react-bootstrap';

class Mainpage extends Component {
    state = { 
    assetDetails: null,       
    };

    async componentDidMount() {
        this.setState({
            NumberOfAssets: 10,
            assets: this.props.assets,
            poolList: '',
            depositModalOpen: false,
            depositButtonModalVisible: false,
            removalModalOpen: false,
            removalButtonModalVisible: true,
            approvalButtonModalVisible: false,
            errorButtonModalVisible: false,
            errorButtonMessage: "Error"


            
        });
    };

    

    openDepositModal= async (farmIndex) =>{
        
        await this.setState({selectedFarmIndex:farmIndex});
        this.setState({selectedFarmName: this.props.farmList[farmIndex][0]})
        this.setState({selectedFarmType: this.props.farmList[farmIndex][1]})
        this.setState({selectedFarmCoin: this.props.farmList[farmIndex][2]})
        this.setState({selectedFarmAddress: this.props.farmList[farmIndex][3]})
        await this.setState({selectedTokenAddress: this.props.farmList[farmIndex][4]})
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.selectedTokenAddress);
        let tokenBalance = await tokenContract.methods.balanceOf(this.props.address).call()
        let tokenDecimals = await tokenContract.methods.decimals().call()
        console.log (tokenBalance)
        await this.setState({selectedTokenBalance: tokenBalance})
        await this.setState({selectedTokenDecimals: tokenDecimals})
        let approvalGiven = await this.checkApproval(this.state.selectedTokenAddress,this.state.selectedFarmAddress)
        console.log(approvalGiven)
        if (approvalGiven) {
            this.setState({depositButtonModalVisible: true})
        }
        else {
            this.setState({approvalButtonVisible: true})
        }
        
        this.setState({depositModalOpen: true })  
        
    }

    closeDepositModal=()=>{
        this.setState({depositModalOpen: false })  
    };
    
    openRemovalModal= async (farmIndex) =>{
        this.setState({removalModalOpen: true })  
        await this.setState({selectedFarmIndex:farmIndex});
        this.setState({selectedFarmName: this.props.farmList[farmIndex][0]})
        this.setState({selectedFarmType: this.props.farmList[farmIndex][1]})
        this.setState({selectedFarmCoin: this.props.farmList[farmIndex][2]})
        this.setState({selectedFarmAddress: this.props.farmList[farmIndex][3]})
        await this.setState({selectedTokenAddress: this.props.farmList[farmIndex][4]})
        let farmContract = new this.props.web3.eth.Contract(this.props.Farm_ABI,this.state.selectedFarmAddress);
        let farmTokenBalance = await farmContract.methods.balanceOf(this.props.address).call()
        let farmTokenDecimals = await farmContract.methods.decimals().call()
        console.log (farmTokenBalance)
        console.log (farmTokenDecimals)
        await this.setState({selectedFarmTokenBalance: farmTokenBalance})
        await this.setState({selectedFarmTokenDecimals: farmTokenDecimals})
        
        
    }

    closeRemovalModal=()=>{
        this.setState({removalModalOpen: false })  
    };


    calculateDepositInput= async () =>{
        console.log("Calculating deposit input result")
        let selectedTokenAmount = document.getElementById('tokenAmountIn').value * (10**this.state.selectedTokenDecimals)
        await this.setState({selectedTokenAmount:selectedTokenAmount})
        console.log(selectedTokenAmount)

        
    };

    calculateRemovalInput= async () =>{
        console.log("Calculating removal input result")
        let selectedFarmTokenAmount = document.getElementById('tokenRemovalAmount').value * (10**this.state.selectedFarmTokenDecimals)
        await this.setState({selectedFarmTokenAmount:selectedFarmTokenAmount})
        console.log(selectedFarmTokenAmount)

        
    };

    setMaxDepositBalance = async() =>{
        console.log("Setting max amount")
        document.getElementById('tokenAmountIn').value = this.props.roundDown(this.state.selectedTokenBalance/(10**this.state.selectedTokenDecimals),14).toFixed(14).replace(/\.?0+$/,"");
        this.calculateDepositInput()
    }

    setMaxRemovalBalance = async() =>{
        console.log("Setting max amount")
        console.log(this.state.selectedFarmTokenBalance)
        document.getElementById('tokenRemovalAmount').value = this.props.roundDown(this.state.selectedFarmTokenBalance/(10**this.state.selectedFarmTokenDecimals),14).toFixed(14).replace(/\.?0+$/,"");
        this.calculateRemovalInput()
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

    approveAccount = async() =>{  
        
        let message = "Approving to spend Tokens"
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.selectedTokenAddress)
        this.props.openMessageBox(message)
        const addressTo = this.state.selectedFarmAddress
        let value = this.props.web3.utils.toBN(2).pow(this.props.web3.utils.toBN(256)).sub(this.props.web3.utils.toBN(2))
        
        try{
            await tokenContract.methods.approve(addressTo,value).send({from: this.props.address})
            .on('receipt', async (receipt) => {
                this.setState({approvalButtonModalVisible: false});
                this.setState({depositButtonModalVisible: true});
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
        
        this.calculateDepositInput();
        this.props.closeMessageBox()
        return ("Approved")
    };

    depositToken = async() =>{  
        
        let message = "Depositing tokens into a farm"
        this.closeDepositModal()
        this.props.openMessageBox(message)
        
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.selectedTokenAddress);
        let farmContract = new this.props.web3.eth.Contract(this.props.Farm_ABI,this.state.selectedFarmAddress);
        let value = this.props.web3.utils.toBN(this.state.selectedTokenAmount)
        
        try{
            await farmContract.methods.deposit(value).send({from: this.props.address})
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

    removeToken = async() =>{  
        
        let message = "Removing tokens from a farm"
        this.closeRemovalModal()
        this.props.openMessageBox(message)
        
        let tokenContract = new this.props.web3.eth.Contract(this.props.ERC20_ABI,this.state.selectedTokenAddress);
        let farmContract = new this.props.web3.eth.Contract(this.props.Farm_ABI,this.state.selectedFarmAddress);
        let value = this.props.web3.utils.toBN(this.state.selectedFarmTokenAmount)
        
        try{
            await farmContract.methods.redeem(value).send({from: this.props.address})
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

    render() { 
        let poolOutput = '';
        let farmList = this.props.farmList
        let enhancedFarmList = []
        if (typeof(this.props.farmList) != 'undefined'){
            
            
             
            console.log(this.props.farmList)
            poolOutput = this.props.farmList.map((farm,index) =>

                <tr key={index}>
                    <td className="text-left" scope="col">{farm[0]}</td>
                    <td className="text-right" scope="col">{farm[1]}</td>
                    <td className="text-right" scope="col">{farm[2]}</td>
                    <td className="text-right" scope="col">{farm[5]}%</td>  
                    <td className="text-right" scope="col">{this.props.outputNumber(farm[6]/1000000,0)}</td>                                           
                    <td className="text-right" scope="col"><Button className="btn btn-fuchsia w-100 mb-2" variant="warning" id="buttonRounded" onClick={()=>this.openDepositModal(index)}>Deposit</Button></td>
                    <td className="text-right" scope="col"><Button className="btn btn-fuchsia w-100 mb-2" variant="warning" id="buttonRounded" onClick={()=>this.openRemovalModal(index)}>Remove</Button></td>
                </tr>

                
            ); 
        }
        else {
            <div className="spinner-border text-accent m-3" role="status"></div>
        }  
        return ( 

                <Zoom>
                <div className="container-fluid p-4 m-4" id="mainBox">

                    <Modal show={this.state.depositModalOpen} onHide={this.closeDepositModal}>
                            <Modal.Header className="border" closeButton>
                                <Modal.Title>Deposit tokens into the following farm:</Modal.Title>   
                            </Modal.Header>
                            
                            <Modal.Body className="bg-tgrey" style={{
                              maxHeight: 'calc(100vh - 210px)',
                              overflowY: 'auto'
                             }} 
                            >
                                
                                <div>Protocol: <b>{this.state.selectedFarmName}</b></div>
                                <div>Farm type: <b>{this.state.selectedFarmType}</b></div>
                                <div>Coin: <b>{this.state.selectedFarmCoin}</b></div>
                                <div className="">
                                    Amount:
                                    <div className="row text-small">
                                        
                                        <div role="button" onClick={this.setMaxDepositBalance} className="col textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.state.selectedTokenBalance/(10**this.state.selectedTokenDecimals),10)} (Max)</span></div>
                                    </div>
                                    <input id="tokenAmountIn" onChange={() =>this.calculateDepositInput()} className="form-control mb-3" type="text" lang="en" placeholder="0"/>
                                </div>
                                {this.state.approvalButtonVisible ? <div><Button className="btn btn-fuchsia w-100 mb-2" id="buttonRounded" onClick={this.approveAccount}>Approve</Button></div> : <div></div>}
                                {this.state.depositButtonModalVisible ? <div><Button className="btn btn-fuchsia w-100 mb-2"  id="buttonRounded" onClick={this.depositToken}>Deposit</Button></div> : <div></div>}
                                
                            </Modal.Body>
                                
                            
                        </Modal>

                        <Modal show={this.state.removalModalOpen} onHide={this.closeRemovalModal}>
                            <Modal.Header className="border" closeButton>
                                <Modal.Title>Remove tokens from the following farm:</Modal.Title>   
                            </Modal.Header>
                            
                            <Modal.Body className="bg-tgrey" style={{
                              maxHeight: 'calc(100vh - 210px)',
                              overflowY: 'auto'
                             }} 
                            >
                                
                                <div>Protocol: <b>{this.state.selectedFarmName}</b></div>
                                <div>Farm type: <b>{this.state.selectedFarmType}</b></div>
                                <div>Coin: <b>{this.state.selectedFarmCoin}</b></div>
                                <div className="">
                                    Amount:
                                    <div className="row text-small">
                                        
                                        <div role="button" onClick={this.setMaxRemovalBalance} className="col textBalance">Balance: <span className="tradeBalance">{this.props.outputNumber(this.state.selectedFarmTokenBalance/(10**this.state.selectedFarmTokenDecimals),14)} (Max)</span></div>
                                    </div>
                                    <input id="tokenRemovalAmount" onChange={() =>this.calculateRemovalInput()} className="form-control mb-3" type="text" lang="en" placeholder="0"/>
                                </div>
                                {this.state.removalButtonModalVisible ? <div><Button className="btn btn-fuchsia w-100 mb-2"  id="buttonRounded" onClick={this.removeToken}>Remove</Button></div> : <div></div>}
                                
                            </Modal.Body>
                                
                            
                        </Modal>


                    <div className="row">
                        <div className="col w-100 container mx-3 my-0 rounded" id="innerBox">
                            <div className="row">                                
                                <div className="col-md-3 h-100 container text-black p-2">
                                    <div className="container p-4 text-black bg-innerBox rounded border border-dark" id="infoBox">
                                        Number of protocols supported: <b>1</b>
                                    </div>
                                </div>

                                <div className="col-md-3 h-100 container text-black p-2">
                                    <div className="container p-4 text-black bg-innerBox rounded border border-dark" id="infoBox">
                                        Current Number of Farms: <b>1</b>
                                    </div>
                                </div>
                                <div className="col-md-3 h-100 container text-black p-2">
                                    <div className="container p-4 text-black bg-innerBox rounded border border-dark" id="infoBox">
                                        Total value locked: <b>USDC {typeof(this.props.totalLockedValue)!== 'undefined' ? this.props.outputNumber(this.props.totalLockedValue/1e24,2):0}m</b>
                                    </div>
                                </div>  
                                <div className="col-md-3 h-100 container text-black p-2">
                                    <div className="container p-4 text-black bg-innerBox rounded border border-dark" id="infoBox">
                                        Number of chains supported: <b>1</b>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    
                    <div className="row m-2">
                       
                        
                            
                                <div className="col p-3 pl-4 pb-0">
                                    <h3 className="text-white">Supported farms:</h3>
                                    <br></br>
                                    <table className="table w-100">
                                    <thead>
                                        <tr>
                                            <th className="text-left" scope="col">Protocol</th>
                                            <th className="text-right" scope="col">Type</th>
                                            <th className="text-right" scope="col">Coin</th>
                                            <th className="text-right" scope="col">APR</th>
                                            <th className="text-right" scope="col">Your Balance (USD)</th>                                           
                                            <th className="text-right" scope="col"></th>
                                            <th className="text-right" scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {poolOutput}
                                    </tbody>
                                </table>
                                </div>
                            
                       

                        
                    </div>


                </div>
                </Zoom>
             


            
         );
    }
}
 
export default Mainpage;