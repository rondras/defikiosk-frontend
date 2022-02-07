import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import info from '../img/ISSUAA-i.png';
import coinLogoANI from '../img/ISSUAA-IPTani.gif'
import eye1 from '../img/ISSUAA_eye1.png'
import eye2 from '../img/ISSUAA_eye2.png'
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import Zoom from 'react-reveal/Zoom';


class GovernanceToken extends Component {
    state = { 
        assets: ['wait'],
        modalOpen: false,
        selectedAsset : '',
        vestingDetailsModalOpen: false,
        vestingSchedule: [],
    }
    async componentDidMount() {
        this.setState({
            GovernanceTokenBalance: this.props.GovernanceTokenBalance,
            GovernanceTokenStakeBalance: this.props.GovernanceTokenStakeBalance,
            stakeModalOpen: false,
            unstakeModalOpen: false,
            burnModalOpen: false,            
        });
        console.log(this.props.openRewards)
    }
    
    openStakeModal = async () => {
        console.log(this.props)
        this.setState({ stakeModalOpen: true })     
    };
    
    closeStakeModal = () => this.setState({ stakeModalOpen: false });

    confirmTransaction = async() => {
        this.closeStakeModal()
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        try{await this.stakeGovernmentToken(document.getElementById('amountToStake').value)}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return (false)
        }
        await this.props.checkRewards();
        this.props.closeMessageBox()
        
    }
    stakeGovernmentToken = async(stakingAmount) =>{  
        console.log("Staking Government Token",this)
        var amountRaw = this.props.web3.utils.toWei(stakingAmount.toString(), 'ether')
        var amount = this.props.web3.utils.toBN(amountRaw)
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
        const result = await this.props.GovernanceToken.methods.createStake(amount).send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
      }

    openUnstakeModal = async () => {
        this.setState({ unstakeModalOpen: true })     
    };
    
    closeUnstakeModal = () => this.setState({ unstakeModalOpen: false });

    openVestingDetailsModal = async () => {
        this.setState({ vestingDetailsModalOpen: true })
        let vestingSchedule = await this.props.GovernanceToken.methods.vestingSchedule(this.props.address).call()
        let cleanedVestingSchedule = []
        for (const x of vestingSchedule) {
            if (x[0] > Date.now()/1000 && x[1] > 0) {cleanedVestingSchedule.push(x)}
        }
        this.setState({vestingSchedule:cleanedVestingSchedule});
        console.log(this.state.vestingSchedule)
        let vestingOutput = cleanedVestingSchedule.map((x,index) =>
            <tr key ={index}>
                <td className="text-left">{this.props.timeStampToDate(x[0])}</td>
                <td className="text-left">{this.props.outputNumber(x[1]/1e18,0)}</td>
                
            </tr>

            );
        this.setState({vestingOutput}) 
        console.log(vestingOutput)
    };
    
    closeVestingDetailsModal = () => this.setState({ vestingDetailsModalOpen: false });

    openBurnModal = async () => {
        this.setState({ burnModalOpen: true })     
    };
    
    closeBurnModal = () => this.setState({ burnModalOpen: false });

    confirmUnstakeTransaction = async() => {
        this.closeUnstakeModal()
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        try{await this.unstakeGovernmentToken(document.getElementById('amountToUnStake').value)}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return (false)
        }
        await this.props.checkRewards();
        this.props.closeMessageBox()
        
    }
    roundDown = (n,d) => {
        n = Math.floor(n*(10**d))
    
        n = n/(10**d)
        return n
    }

    unstakeGovernmentToken = async(stakingAmount) =>{  
        console.log("Unstaking Government Token",this)
        var amountRaw = this.props.web3.utils.toWei(stakingAmount.toString(), 'ether')
        var amount = this.props.web3.utils.toBN(amountRaw)
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
        const result = await this.props.GovernanceToken.methods.removeStake(amount).send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
      }

    burnGovernanceToken = async(burnAmount) =>{  
        console.log("Burning Government Token",this)
        var amountRaw = this.props.web3.utils.toWei(burnAmount.toString(), 'ether')
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
        const result = await this.props.assetFactory.methods.burnGovernanceToken(amount).send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
        
      }
    confirmBurnGovernanceToken = async() => {
        let amountToBurn = document.getElementById('amountToBurn').value
        this.closeBurnModal()
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        let trx_result = await this.approveAccount()
        if (trx_result === false){
            message = "Error approving the account"
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return (false)
        }
        
        try{await this.burnGovernanceToken(amountToBurn)}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return (false)
        }
        await this.props.checkRewards();
        this.props.closeMessageBox()
    }

    setMaxStakeAmount = async() =>{
        let amount = 0
        if (typeof(this.props.GovernanceTokenBalance) != 'undefined'){ 
            amount = parseFloat(this.props.GovernanceTokenBalance)
        }
        document.getElementById('amountToStake').value = this.roundDown(amount,14);
        return
    }
    setMaxUnStakeAmount = async() =>{
        let amount = 0
        if (typeof(this.props.GovernanceTokenStakeBalance) != 'undefined' && typeof(this.props.GovernanceTokenVestedStakeBalance) != 'undefined'){ 
            amount = parseFloat(this.props.GovernanceTokenStakeBalance) - parseInt(this.props.GovernanceTokenVestedStakeBalance)
        }
        document.getElementById('amountToUnStake').value = this.roundDown(amount,14);
        return
    }

    setMaxBurnAmount = async() =>{
        let amount = 0
        if (typeof(this.props.GovernanceTokenBalance) != 'undefined'){ 
            amount = parseFloat(this.props.GovernanceTokenBalance)
        }
        document.getElementById('amountToBurn').value = this.roundDown(amount,14);
        return
    }


    approveAccount = async() =>{  
        console.log("Approving the AssetFactory contract to spend IPT",this)
        let message = "Approving to spend IPT Tokens"
        this.props.openMessageBox(message)
        const addressTo = this.props.assetFactory._address;
        const allowance = await this.props.GovernanceToken.methods.allowance(this.props.address, addressTo).call()
        
        if (parseInt(allowance) === 0){
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
            try{await this.props.GovernanceToken.methods.approve(addressTo,value).send({from: this.props.address, gasPrice: gasPrice})}
            catch(e){
                console.log(e['message'])
                message = e['message']
                this.props.openMessageBox(message)
                await this.props.sleep(5000)
                this.props.closeMessageBox();
                return (false)
            }            
        }
        this.props.closeMessageBox()
        return (true)
    };

    claim = async() =>{  
        console.log("Claiming rewards",this)
        let message = "Claiming rewards"
        this.props.openMessageBox(message)
        console.log(this.props.RewardsMachine)
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
        try{await this.props.RewardsMachine.methods.claimRewards().send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return (false)
        }   
        await this.props.checkRewards();
        this.props.closeMessageBox()
    };
    createRewards = async() =>{  
        console.log("Creating rewards",this)
        let message = "Minting the weekly rewards pool"
        this.props.openMessageBox(message)
        console.log(this.props.RewardsMachine)
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
        let result = await this.props.RewardsMachine.methods.createRewards().send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
        
        await this.props.checkRewards();
        this.props.closeMessageBox()
    };

    transferToMultisig = async() =>{  
        console.log("Creating rewards",this)
        let message = "Minting the weekly rewards pool"
        this.props.openMessageBox(message)
        console.log(this.props.RewardsMachine)
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
        let result = await this.props.Claim.methods.transferToMultisig().send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
        

        this.props.closeMessageBox()
    };


    claimTestingToken = async() =>{  
        console.log("Claiming the testing and angel rewards tokens",this)
        console.log(this.props.Claim)
        let message = "Claiming the testing and angel rewards tokens"
        this.props.openMessageBox(message)
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
        let result = await this.props.Claim.methods.claimAll().send({from: this.props.address, gasPrice: gasPrice})
        console.log(result)
        

        this.props.closeMessageBox()
    };

    render() { 
        const tooltip1 = props => (
            <Tooltip {...props}>
            IPT tokens must be staked in order to participate in governance votings. The staked IPT balance includes rewarded IPTs which are still vesting automatically. You may stake additional liquid/vested IPTs in order to enlarge your voting power in governance votings.
            </Tooltip>
        );
        const tooltip2 = props => (
            <Tooltip {...props}>
            Balance includes rewarded IPTs still vesting according to the IPT vesting schedule. IPTs still vesting are autoimatically staked and only unstakeable when the vesting period is over.
            </Tooltip>
        );
        const tooltip3 = props => (
            <Tooltip {...props}>
            Balance of liquid (i.e. vested and not staked) IPTs available for trading, providing liquidity, a.o.
            </Tooltip>
        );
        const tooltip4 = props => (
            <Tooltip {...props}>Amount of IPTs currently outstanding</Tooltip>
        );
        const tooltip5 = props => (
            <Tooltip {...props}>
            The maximum amount of IPTs is limited at 100m. 5% of the difference between the max. 100m IPTs and the amount of IPTs circulating are rewarded weekly to investors providing liquidity in pools and participating in governance votings.
            </Tooltip>
        );
        const tooltip6 = props => (
            <Tooltip {...props}>
            Total value of IPT circulating, i.e.: Amount of IPTs currently outstanding multiplied by current IPT price.
            </Tooltip>
        );
        const tooltip7 = props => (
            <Tooltip {...props}>
            Max. possible supply of IPT (@100m) multiplied by current IPT price.
            </Tooltip>
        );
        const tooltip8 = props => (
            <Tooltip {...props}>
            You can stake your liquid IPTs here in order to participate in (rewarded) governance votings.
            </Tooltip>
        );
        const tooltip9 = props => (
            <Tooltip {...props}>
            You can unstake your IPTs here (as far as those are vested) in order to have those IPTs available in your liquid balance for subsequent providing of liquidity in the IPT pool or trading.
            </Tooltip>
        );
        const tooltip10 = props => (
            <Tooltip {...props}>
            Claim your weekly IPT rewards for liquidity providing and participating in governance votes here (Function only available if rewards were earned).
            </Tooltip>
        );
        const tooltip11 = props => (
            <Tooltip {...props}>You may burn IPTs of your liquid IPT balance here.</Tooltip>
        );
        const tooltip12 = props => (
            <Tooltip {...props}>You may claim the IPT token, which you have been ewarded to for testing and your angel contributions here.</Tooltip>
        );

        return ( 
            



            <div className="container-fluid w-100">

                <Modal show={this.state.stakeModalOpen} onHide={this.closeStakeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Stake ISSUAA Protocol Token (IPT):</Modal.Title>
                    </Modal.Header>
                        <Modal.Body>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" for="amountToStake">Amount to stake:</label>
                            </div>
                            <input className="form-control" type='number' id='amountToStake'></input>
                            <div class="input-group-append">
                                <div onClick={this.setMaxStakeAmount} role="button" className="badge badge-accent" for="amountToStake">Max</div>
                            </div>
                        </div>
                        </Modal.Body>
                    <Modal.Footer>
                        <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.confirmTransaction}>Confirm</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.vestingDetailsModalOpen} onHide={this.closeVestingDetailsModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Vesting Details</Modal.Title>
                    </Modal.Header>
                        <Modal.Body className="bg-darkAccent" id="greyModal">
                        <div className="bg-darAccent" >
                            <table className="table">
                                <thead className="font-weight-bold">
                                    <td>Date</td>
                                    <td>IPT Amount</td>
                                </thead>
                                <tbody>
                                {this.state.vestingOutput}
                                </tbody>
                            </table>
                        </div>
                        </Modal.Body>
                    
                </Modal>


                <Modal show={this.state.burnModalOpen} onHide={this.closeBurnModal}>
                    <Modal.Header closeButton />
                    <Modal.Body>
                        Burn your IPT Token and redeem USDC
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" for="amountToBurn">Amount to burn:</label>
                            </div>
                            <input className="form-control" type='number' id='amountToBurn'></input>
                            <div class="input-group-append">
                                <div onClick={this.setMaxBurnAmount} role="button" className="badge badge-accent" for="amountToBurn">Max</div>
                            </div>
                        </div>
                        <div>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.confirmBurnGovernanceToken}>Confirm</Button>
                        </div>
                        </Modal.Body>
                    
                </Modal>




                <Modal show={this.state.unstakeModalOpen} onHide={this.closeUnstakeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Unstake ISSUAA Protocol Token (IPT):</Modal.Title>
                    </Modal.Header>
                        <Modal.Body>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" for="amountToUnStake">Amount to unstake:</label>
                            </div>
                            <input className="form-control" type='number' id='amountToUnStake'></input>
                            <div class="input-group-append">
                                <div onClick={this.setMaxUnStakeAmount} role="button" className="badge badge-accent" for="amountToUnStake">Max</div>
                            </div>
                        </div>
                        </Modal.Body>
                    <Modal.Footer>
                        <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.confirmUnstakeTransaction}>Confirm</Button>
                    </Modal.Footer>
                </Modal>

                <Zoom>
                <div className="row">
                    <div className="col"></div>
                    <div id="mainBox" className="col-6 container text-black p-2">
                        <div className="container p-3 text-light">
                            <div className="container px-4 pr-4 py-2">
                                <div className="h1 font-weight-bold text-center text-light pb-2 underlined-fuchsia">
                                    ISSUAA Protocol Token &nbsp;
                                    
                                </div>
                                <div id="largeIPT" className="display-3 font-weight-bold text-light text-center pb-2 ">$ {this.props.outputNumber(this.props.IPTPrice,3)}</div>
                                <div className="bg-innerBox text-black rounded m-2 mb-1 p-4" id="innerBox">
                                    <div className="h5 text-fuchsia row">
                                        <div className="col-7 text-black">Your total IPT balance:</div>
                                        <div className="col-5 text-right text-black">{this.props.outputNumber((parseFloat(this.props.GovernanceTokenBalance) + parseFloat(this.props.GovernanceTokenStakeBalance)),0)}</div>                                             
                                    </div>
                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip1}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            thereof staked
                                        </div>
                                        <div className="col-4 text-right">{this.props.outputNumber(this.props.GovernanceTokenStakeBalance,0)}</div>                                             
                                    </div>
                                    <div className="row justify-content-between align-middle">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip2}>
                                                <img className="mr-2 my-auto" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            thereof still vesting <span role="button" onClick={this.openVestingDetailsModal}> (Details)</span>
                                        </div>
                                        <div className="col-4 text-right">{this.props.outputNumber(this.props.GovernanceTokenVestedStakeBalance,0)}</div>                                             
                                    </div>

                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip3}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            thereof liquid
                                        </div>
                                        <div className="col-4 text-right">{this.props.outputNumber(this.props.GovernanceTokenBalance,0)}</div>                                             
                                    </div>
                                </div>

                                <div id="innerBox" className="bg-darkpurple m-2 p-2">
                                    <div className="h5 text-light row justify-content-between">
                                        
                                        <div className="col-7">Your unclaimed IPT balance:</div>
                                        <div className="col-4 text-right">{this.props.outputNumber(parseFloat(this.props.openRewards/1000000000000000000),0)}</div>                                             
                                    </div>
                                    
                                </div>

                                {(this.props.openRewards > 0 && this.props.openRewards !== 'undefined' 
                                    ?
                                    <div className="bg-darkpurple m-2">
                                        <button className="btn btn-fuchsia text-black w-100 md-1" id="buttonRounded" onClick={this.claim}>
                                            Claim IPT
                                            <OverlayTrigger placement="top" overlay={tooltip10}>
                                                <img className="mr-2 float-right" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                        </button>
                                    </div>
                                    :
                                    ''
                                    
                                )}

                                {(this.props.nextRewardsPayment > Date.now()/1000
                                    ?
                                    <div className="bg-darkpurple m-2 p-2">
                                        <div className="h5 text-light row justify-content-between">
                                            
                                            <div className="col-7">Next rewards payment:</div>
                                            <div className="col-4 text-right">{this.props.timeStampToDateAndTime(this.props.nextRewardsPayment)}</div>                                             
                                        </div>
                                        
                                    </div>
                                    :
                                    ''
                                )}

                                {(this.props.nextRewardsPayment < Date.now()/1000 && this.props.openRewards == 0
                                    ?
                                    <div className="bg-darkpurple m-2">
                                        <button className="btn btn-fuchsia text-black w-100 md-1" id="buttonRounded" onClick={this.createRewards}>CREATE Rewards</button>
                                    </div>
                                    :
                                    ''
                                )}

                                
                                    
                                
                                <div className="bg-innerBox text-black rounded m-2 p-4" id="innerBox">
                                    
                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip4}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            IPT circulating
                                        </div>
                                        <div className="col-4 text-right">{this.props.outputNumber(this.props.IPTSupply/1000000,1)}m</div>                                             
                                    </div>

                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip5}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            IPT total max. supply
                                        </div>
                                        <div className="col-4 text-right">{this.props.outputNumber(100,1)}m</div>                                             
                                    </div>

                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip6}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            Current IPT market cap
                                        </div>
                                        <div className="col-4 text-right">USDC {this.props.outputNumber(this.props.IPTPrice * this.props.IPTSupply/1000000,0)}m</div>                                             
                                    </div>
                                    <div className="row justify-content-between">
                                        <div className="col-7">
                                            <OverlayTrigger placement="top" overlay={tooltip7}>
                                                <img className="mr-2" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            Diluted IPT market cap
                                        </div>
                                        <div className="col-4 text-right">USDC {this.props.outputNumber(this.props.IPTPrice * 100000000/1000000,0)}m</div>                                             
                                    </div>
                                </div>
                                
                                <div className="bg-darkpurple m-1">

                                    <div className="text-black row">
                                        <div className="col rounded pr-md-1">
                                            <div className="btn btn-accent w-100" id="buttonRounded" onClick={this.openStakeModal} role="button">
                                                Stake IPT
                                                <OverlayTrigger placement="top" overlay={tooltip8}>
                                                <img className="mr-2 float-right" src={info} alt="Logo"/>
                                            </OverlayTrigger>                                                   
                                            </div>
                                        </div>

                                        <div className="col rounded pr-md-1">
                                            <div className="btn btn-accent w-100" id="buttonRounded" onClick={this.openUnstakeModal} role="button">
                                                Unstake IPT
                                                <OverlayTrigger placement="top" overlay={tooltip9}>
                                                <img className="mr-2 float-right" src={info} alt="Logo"/>
                                            </OverlayTrigger>
                                            </div>                                            
                                        </div>    

                                        
                                        <div className="col rounded pr-md-2 mr-2">
                                            <div className="btn btn-darkAccent text-black w-100" id="buttonRounded" onClick={this.openBurnModal}>
                                                Burn IPT
                                                <OverlayTrigger placement="top" overlay={tooltip11}>
                                                    <img className="mr-2 float-right" src={info} alt="Logo"/>
                                                </OverlayTrigger>
                                            </div>
                                        </div>   

                                    </div>
                                    
                                    
                                </div>

                                


                                

                                {(false)
                                    ?
                                    <button className="btn btn-primary text-light m-2" onClick={this.transferToMultisig}>Transfer to Multisig</button>
                                    :
                                    ''
                                }
                                
                            </div>
                        </div>
                        
                    </div>
                    
                    <div className="col"></div>
                </div>
                </Zoom>
            </div>

            
         );
    }
}
 
export default GovernanceToken;