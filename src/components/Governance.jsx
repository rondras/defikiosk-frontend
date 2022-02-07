import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import eye1 from '../img/ISSUAA_eye1.png';
import info from '../img/ISSUAA-i.png';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import Zoom from 'react-reveal/Zoom';

class Governance extends Component {
    state = { 
    assetDetails: null,   
    view: "assets",
    styleCSS1: "governanceBoxClicked",
    styleCSS2: "governanceBox",
    styleCSS3: "governanceBox",
    styleCSS4: "governanceBox",
    bgColor1: "bg-lightgray"    
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
            initiateGrantProposal: false,
            assetToCloseExpiryVote: "",
            assetDetails: this.props.assetDetails,
            voteOnGrantProposalModal: false,
            selectedGrantVote: "",
            requestGrantButtonVisible: true,
            proposeNewAssetButtonVisible: false,
            initiateNewAssetProposal: false,
            proposeUgradeButtonVisible: true, 

        });

        console.log(this.props.assetDetails)
        console.log(Date.now())

        this.loadNewAssetProposals();
        this.loadGrantRequests();
        this.loadUpgradeVotes();
    };

    loadNewAssetProposals = async() =>{
        let numberOfNewAssetProposals = await this.props.DAO.methods.numberOfNewAssetVotes().call();
        console.log(numberOfNewAssetProposals)
        var newAssetVotesDetailsOpen = [];
        var newAssetVotesDetailsClosed = [];
        for (let i = 0; i < numberOfNewAssetProposals; ++i) {
            let proposedSymbol = await this.props.DAO.methods.newAssetVoteSymbols(i).call()
            console.log(proposedSymbol)
            
            let result = await this.props.DAO.methods.getNewAssetVotes(proposedSymbol).call()
            console.log(result)
            let hasVoted = await this.props.DAO.methods.checkIfVotedNewAsset(this.props.address,proposedSymbol).call()
            console.log(hasVoted)
            if (result['open']){
                newAssetVotesDetailsOpen.push([proposedSymbol,result['name'],result['description'],result['upperLimit'],result['endingTime'],result['yesVotes'],result['noVotes'],hasVoted])
            }
            else {
                newAssetVotesDetailsClosed.push([proposedSymbol,result['name'],result['description'],result['upperLimit'],result['endingTime'],result['yesVotes'],result['noVotes'],hasVoted])
            }
            
            
        }
        if (parseFloat(this.props.GovernanceTokenStakeBalance) > 100000) {this.setState({proposeNewAssetButtonVisible:true});console.log("Button Visible")} else {console.log(this.props.GovernanceTokenStakeBalance)};
            
        this.setState({newAssetVotesDetailsOpen})
        this.setState({newAssetVotesDetailsClosed})
        console.log(newAssetVotesDetailsOpen) 
        console.log(newAssetVotesDetailsClosed)      

    } 

    loadGrantRequests = async() =>{
        let result = await this.props.DAO.methods.getGrantVoteDetails(this.props.address).call()
        console.log(result);
        if (result[5] === true){
            this.setState({requestGrantButtonVisible: false})
        }
        else{console.log("Button visible")};
        console.log(result)
        let numberOfGrantVotes = await this.props.DAO.methods.numberOfGrantVotes().call();
        console.log(numberOfGrantVotes)
        

        var grantVotesDetailsOpen = [];
        var grantVotesDetailsClosed = [];
        for (let i = 0; i < numberOfGrantVotes; ++i) {
            console.log(i)
            let receivingAddress = await this.props.DAO.methods.grantVoteAddresses(i).call()
            console.log(receivingAddress)
            
            let result = await this.props.DAO.methods.getGrantVoteDetails(receivingAddress).call()
            console.log(result)
            let hasVoted = await this.props.DAO.methods.checkIfVotedGrantFunding(this.props.address,receivingAddress).call()
            console.log(hasVoted)
            console.log(result);
            if (result[5]){
                grantVotesDetailsOpen.push([receivingAddress,result[0],result[1],result[2],result[3],result[4],result[5],hasVoted])

            }
            else {
                grantVotesDetailsClosed.push([receivingAddress,result[0],result[1],result[2],result[3],result[4],result[5],hasVoted])
            }
        }
        if (this.props.GovernanceTokenStakeBalance < 100000) {this.setState({requestGrantButtonVisible:false})}
        else {this.setState({requestGrantButtonVisible:true})};

        this.setState({grantVotesDetailsOpen})
        this.setState({grantVotesDetailsClosed})
        console.log(grantVotesDetailsOpen) 
        console.log(grantVotesDetailsClosed)
        console.log(this.state.requestGrantButtonVisible)      

    }

    loadUpgradeVotes = async() =>{
        
        let result = await this.props.Upgrader.methods.getUpgradeVoteDetails(this.props.address).call()
        console.log(result);
        if (result[5] === true){
            this.setState({proposeUgradeButtonVisible: false})
        }
        else{console.log("Button visible")};
        console.log(result)
        let numberOfUpgradeVotes = await this.props.Upgrader.methods.numberOfUpgradeVotes().call();
        console.log(numberOfUpgradeVotes)
        

        var upgradeVotesDetailsOpen = [];
        var upgradeVotesDetailsClosed = [];
        for (let i = 0; i < numberOfUpgradeVotes; ++i) {
            console.log(i)
            let newContractAddress = await this.props.Upgrader.methods.upgradeVoteAddresses(i).call()
            console.log(newContractAddress)
            
            let result = await this.props.Upgrader.methods.getUpgradeVoteDetails(newContractAddress).call()
            console.log(result)
            let hasVoted = await this.props.Upgrader.methods.checkIfVotedUpgrade(this.props.address,newContractAddress).call()
            console.log(hasVoted)
            console.log(result);
            if (result[4]){
                upgradeVotesDetailsOpen.push([newContractAddress,result[0],result[1],result[2],result[3],result[4],result[5],hasVoted])

            }
            else {
                upgradeVotesDetailsClosed.push([newContractAddress,result[0],result[1],result[2],result[3],result[4],result[5],hasVoted])
            }
        }
        if (this.props.GovernanceTokenStakeBalance < 100000) {this.setState({requestGrantButtonVisible:false})}
        else {this.setState({requestGrantButtonVisible:true})};

        this.setState({upgradeVotesDetailsOpen})
        this.setState({upgradeVotesDetailsClosed})
        console.log(upgradeVotesDetailsOpen) 
        console.log(upgradeVotesDetailsClosed)
        console.log(this.state.requestGrantButtonVisible)      

    }     

    getAssets() {
        let assets = this.props.assets;
        return assets;
    };

    openFreezeModal=(asset)=>{
        console.log(asset)
        this.setState({assetToFreeze:asset})
        this.setState({ freezeModalOpen: true })     
    };
    
    closeFreezeModal = () => this.setState({ freezeModalOpen: false });

    openVoteModal=(asset)=>{
        console.log(asset)
        console.log("Click")
        this.setState({assetToVote: asset})
        this.setState({ voteModalOpen: true })     
    };
    
    closeVoteModal = () => this.setState({ voteModalOpen: false });

    openCloseModal=(asset)=>{
        console.log(asset)
        console.log("Click")
        this.setState({assetToClose: asset})
        this.setState({ closeModalOpen: true })     
    };
    
    closeCloseModal = () => this.setState({ closeModalOpen: false });

    openFinalPriceModal =(asset)=>{
        this.setState({assetToVoteOnFinalPrice: asset})
        this.setState({ finalPriceModalOpen: true })     
    };
    closeFinalPriceModal = () => this.setState({ finalPriceModalOpen: false });


    openCloseExpiryVoteModal =(asset)=>{
        this.setState({assetToCloseExpiryVote: asset})
        this.setState({ closeExpiryVoteModalOpen: true })     
    };
    closeCloseExpiryVoteModal = () => this.setState({ closeExpiryVoteModalOpen: false });


    openInitiateExpiryVoteModal =(asset)=>{
        this.setState({assetToInitiateExpiryVote: asset})
        this.setState({ initiateExpiryVoteModalOpen: true });
    };
    
    openGrantPropsal = () => this.setState({ initiateGrantProposal: true });
    closeGrantPropsal = () => this.setState({ initiateGrantProposal: false });

    openUpgradePropsal = () => this.setState({ initiateUpgradeProposal: true });
    closeUpgradePropsal = () => this.setState({ initiateUpgradeProposal: false });

    closeInitiateExpiryVoteModal = () => this.setState({ initiateExpiryVoteModalOpen: false });

    initiateCloseExpiryVote     = async() => {
        console.log("Closing the expiry vote")
        this.setState({ closeExpiryVoteModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.closeEndOfLifeVote(this.state.assetToCloseExpiryVote).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateExpiryVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    } 
    
    initiateFreeze = async() => {
        console.log("Initiating the request to freeze an asset")
        this.setState({ freezeModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.initiateFreezeVote(this.state.assetToFreeze).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateFreezeVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    }

    initiateYesVote     = async() => {
        console.log("Initiating the vote that an asset has breached its upper limit")
        this.setState({ voteModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.voteFreezeVote(this.state.assetToVote,true).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateFreezeVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    }

    initiateNoVote     = async() => {
        console.log("Initiating the vote that an asset has breached its upper limit")
        this.setState({ voteModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.voteFreezeVote(this.state.assetToVote,false).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateFreezeVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    }

    initiateClose     = async() => {
        console.log("Closing the vote")
        this.setState({ closeModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.closeFreezeVote(this.state.assetToClose).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateFreezeVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    }

    initiateExpiryPriceVote     = async() => {
        console.log("Initiating the voting process on the expiry price")
        this.setState({ initiateExpiryVoteModalOpen: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.initiateEndOfLifeVote(this.state.assetToInitiateExpiryVote).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateExpiryVotes()
        this.setState({assetDetails: this.props.assetDetails})
        
        this.props.closeMessageBox()
    }

    submitGrantProposal = async()=>{
        console.log("Submitting a new grant proposal")
        this.setState({initiateGrantProposal:false})
        let message = "Transmitting a new grant proposal to the blockchain"
        this.props.openMessageBox(message)

    
        let grantAmount = this.props.web3.utils.toWei(document.getElementById('grantAmount').value);
        console.log(grantAmount)
        let description = document.getElementById('grantDescription').value
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
        try{await this.props.DAO.methods.initiateGrantFundingVote(this.props.address,grantAmount,description).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.setState({submitGrantProposal:false})
        this.loadGrantRequests();
        this.props.closeMessageBox()
    }

    submitUpgradeProposal = async()=>{
        console.log("Submitting a new upgrade proposal")
        this.setState({initiateUpgradeProposal:false})
        let message = "Transmitting a new upgrade proposal to the blockchain"
        this.props.openMessageBox(message)

    
        let smartContractToUpgrade = document.getElementById('smartContractToUpgrade').value
        let newSmartContractAddress = document.getElementById('newSmartContractAddress').value

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
        try{await this.props.Upgrader.methods.initiateUpgradeVote(newSmartContractAddress,smartContractToUpgrade).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.setState({submitUpgradeProposal:false})
        this.loadUpgradeVotes();
        this.props.closeMessageBox()
    }

    expiryPriceVote     = async() => {
        console.log("Voting on the expiry price");
        this.setState({ finalPriceModalOpen: false });
        console.log(this.state);
        let expiryPrice = parseFloat(document.getElementById('expiryPrice').value)*1000
        console.log(expiryPrice)
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.VoteMachine.methods.voteOnEndOfLifeValue(this.state.assetToVoteOnFinalPrice,expiryPrice).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.updateExpiryVotes()
        this.setState({assetDetails: this.props.assetDetails})
        this.props.closeMessageBox()
    }

    changeView = async (newView) =>{
        this.setState({"view":newView})
        if (newView === "assets"){
            this.setState({styleCSS1: "governanceBoxClicked"});
            this.setState({styleCSS2: "governanceBox"});
            this.setState({styleCSS3: "governanceBox"});
            this.setState({styleCSS4: "governanceBox"});
        }
        if (newView === "newAsset"){
            this.setState({styleCSS1: "governanceBox"});
            this.setState({styleCSS2: "governanceBoxClicked"});
            this.setState({styleCSS3: "governanceBox"});
            this.setState({styleCSS4: "governanceBox"});
        }
        if (newView === "grantVotes"){
            this.setState({styleCSS1: "governanceBox"});
            this.setState({styleCSS2: "governanceBox"});
            this.setState({styleCSS3: "governanceBoxClicked"});
            this.setState({styleCSS4: "governanceBox"});
        }
        if (newView === "upgrade"){
            this.setState({styleCSS1: "governanceBox"});
            this.setState({styleCSS2: "governanceBox"});
            this.setState({styleCSS3: "governanceBox"});
            this.setState({styleCSS4: "governanceBoxClicked"});
        }
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

    closeVoteOnGrantProposalModal= () => {
        this.setState({ voteOnGrantProposalModal: false });
    };
    openVoteOnGrantProposalModal= async(receiver) => {
        this.setState({ voteOnGrantProposalModal: true });
        this.setState({ selectedGrantVote: receiver });
        let result = await this.props.DAO.methods.getGrantVoteDetails(receiver).call()
        console.log(result)
        this.setState({selectedGrantVoteReceiver: receiver})
        this.setState({selectedGrantVoteAmount: result[3]})
        this.setState({selectedGrantVoteDescription: result[4]})
        
    }

    voteYesOnGrantPropsal = async() => {
        this.setState({ voteOnGrantProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.DAO.methods.voteGrantFundingVote(this.state.selectedGrantVote,true).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadUpgradeVotes();
        this.props.closeMessageBox()
        
    }
    voteNoOnGrantPropsal = async() => {
        this.setState({ voteOnGrantProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.DAO.methods.voteGrantFundingVote(this.state.selectedGrantVote,false).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.loadGrantRequests();
        this.props.closeMessageBox()
        
    }
    closeVoteOnGrantProposal = async(receiver) =>{
        this.setState({ voteOnGrantProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.DAO.methods.closeGrantFundingVote(receiver).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadGrantRequests();
        this.props.closeMessageBox()
    }

    //__________________________NEW_________________

    openVoteOnUpgradeProposalModal= async(newContractAddress) => {
        this.setState({ voteOnUpgradeProposalModal: true });
        this.setState({ selectedUpgradeVote: newContractAddress });
        let result = await this.props.Upgrader.methods.getUpgradeVoteDetails(newContractAddress).call()
        console.log(result)
        this.setState({selectedNewContractAddress: newContractAddress})
        this.setState({selectedContractToUpgrade: result[3]})
        
    }

    closeVoteOnUpgradeProposalModal= () => {
        console.log("Debug")
        this.setState({ voteOnUpgradeProposalModal: false });
    };

    voteYesOnUpgradePropsal = async() => {
        this.setState({ voteOnUpgradeProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.Upgrader.methods.voteUpgradeVote(this.state.selectedUpgradeVote,true).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadUpgradeVotes();
        this.props.closeMessageBox()
        
    }
    voteNoOnUpgradePropsal = async() => {
        this.setState({ voteOnUpgradeProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.Upgrader.methods.voteUpgradeVote(this.state.selectedUpgradeVote,false).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.loadUpgradeVotes();
        this.props.closeMessageBox()
        
    }
    closeVoteOnUpgradeProposal = async(newContractAddress) =>{
        this.setState({ voteOnUpgradeProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.Upgrader.methods.closeUpgradeVote(newContractAddress).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadUpgradeVotes();
        this.props.closeMessageBox()
    }

    //--------------------------OLD__________________

    openNewAssetPropsalModal= () => {
        this.setState({ initiateNewAssetProposal: true });
    }

    closeNewAssetPropsalModal= () => {
        this.setState({ initiateNewAssetProposal: false });
    };

    submitNewAssetProposal = async()=>{
        console.log("Submitting a new asset proposal")
        this.setState({initiateGrantProposal:false})
        let message = "Transmitting a new ISSUAA Asset proposal to the blockchain"
        this.props.openMessageBox(message)
        let proposedName = document.getElementById('proposedName').value
        let proposedSymbol = document.getElementById('proposedSymbol').value
        let year = new Date().getFullYear()-2000+1
        let month = new Date().getMonth()+1
        if (month<10) {month = "0".concat(month.toString())} else {month=month.toString()}
        proposedSymbol = proposedSymbol.concat("_",year.toString(),month)
    
        let proposedUpperLimit = parseInt(document.getElementById('proposedUpperLimit').value*1000).toString();
        let proposedDescription = document.getElementById('proposedDescription').value

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
        try{await this.props.DAO.methods.initiateNewAssetVote(proposedSymbol,proposedName,proposedUpperLimit,proposedDescription).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.setState({initiateNewAssetProposal:false})
        this.loadNewAssetProposals()
        this.props.closeMessageBox()
    }

    openVoteOnNewAssetProposalModal= async (symbol) => {
        this.setState({ voteOnNewAssetProposalModal: true });
        this.setState({ selectedNewAssetVote: symbol });
        let result = await this.props.DAO.methods.getNewAssetVotes(symbol).call()
        console.log(result)
        this.setState({selectedNewAssetName: result[5]})
        this.setState({selectedNewAssetUpperLimit: result[6]})
        this.setState({selectedNewAssetDescription: result[7]})
    }

    closeVoteOnNewAssetProposalModal= () => {
        this.setState({ voteOnNewAssetProposalModal: false });
    };
    voteYesOnNewAssetPropsal = async() => {
        this.setState({ voteOnNewAssetProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.DAO.methods.voteNewAssetVote(this.state.selectedNewAssetVote,true).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadNewAssetProposals();
        this.props.closeMessageBox()
        
    }
    voteNoOnNewAssetPropsal = async() => {
        this.setState({ voteOnNewAssetProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
        this.props.openMessageBox(message)
        console.log("Voting NO to new asset")
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
        try{await this.props.DAO.methods.voteNewAssetVote(this.state.selectedNewAssetVote,false).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.loadNewAssetProposals();
        this.props.closeMessageBox()
        
    }

    closeVoteOnNewAssetProposal = async(symbol) =>{
        this.setState({ voteOnNewAssetProposalModal: false })
        let message = "Transmitting to the blockchain. Waiting for confirmation"
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
        try{await this.props.DAO.methods.closeNewAssetVote(symbol).send({from: this.props.address, gasPrice: gasPrice})}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        this.loadNewAssetProposals();
        this.props.closeMessageBox()
    }

    render() {

        const tooltip1 = props => (
            <Tooltip {...props}>
            IPT owners can initiate Expiry votings and Freeze votings for the ISSUAA Assets listed below.
            </Tooltip>
        );
        const tooltip2 = props => (
            <Tooltip {...props}>
            IPT owners with a total IPT balance of [500k] or more will be entitled to propose new ISSUAA Assets to be created for subsequent minting,
            liquidity providing and trading.
            </Tooltip>
        );
        const tooltip3 = props => (
            <Tooltip {...props}>
            IPT owners may propose to receive IPTs from the DAO grant reserve as reward for exeptional value-add they contributed to the ISSUAA
            DAO.
            </Tooltip>
        );
        const tooltip4 = props => (
            <Tooltip {...props}>
            IPT holders can suggest and vote on upgrades of the existing smart contracts.
            </Tooltip>
        );
        const tooltip5 = props => (
            <Tooltip {...props}>
            Please select a 3-4 digit (letters only) symbol for the asset
            </Tooltip>
        );
        const tooltip6 = props => (
            <Tooltip {...props}>
            Please describe the underlying asset briefly and precisely. Please also provide the ISIN (if existing) of the underlying asset
            </Tooltip>
        );
        const tooltip7 = props => (
            <Tooltip {...props}>
            Please choose which upper limit shall apply for the short token of the asset. The upper limit should be defined at approx. twice the current market price of the underlying asset and rounded on full hundreds, thousands, etc., as applicable.
            </Tooltip>
        );
        const tooltip8 = props => (
            <Tooltip {...props}>
                Max 100,000 IPT
            </Tooltip>
        );


        if (!this.state.assetDetails) {
            return <div />
        }
        //var AssetOptions = ['loading']
        var assets = this.getAssets();
        if (typeof(this.props.assets) != 'undefined'){
            console.log(typeof(assets))
            console.log(assets)
            //AssetOptions = assets
        }

        let showNewAssetProposals
        if (typeof(this.state.newAssetVotesDetailsOpen) != 'undefined'){
            showNewAssetProposals = this.state.newAssetVotesDetailsOpen.map((details,index) =>
                <div key ={index} className="col-4 p-4">
                    <div key ={index} className="h-100 p-1 mb-4 col">
                        <div id="innerBox" key ={index} className="h-100 p-4 col bg-innerBox text-black">
                            
                            <div className="row">
                                <div className="col-12 mb-2"><b>Active new ISSUAA Asset proposal vote #{index+1}</b></div>
                            </div>
                            <div className="row">
                                <div className="col-4">Symbol:</div>
                                <div className="col-8">{details[0]}</div>
                            </div>
                            <div className="row">
                                <div className="col-4">Name:</div>
                                <div className="col-8">{details[1]}</div>
                            </div>
                            
                            <div className="row">
                                <div className="col-4">Vote ends:</div>
                                <div className="col-8">{this.timeStampToDateAndTime(details[4])}</div>
                            </div>
                            <div className="row">
                                <div className="col-4">Upper Limit:</div>
                                <div className="col-8">{this.props.outputNumber(details[3]/(1000),0)}</div>
                            </div>
                            <div className="row mt-3">
                                <div className="col"><b>Description of the Asset:</b></div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">{details[2]}</div>
                            </div>
                            <div className="row">
                                <div className="col-4">YES votes</div>
                                <div className="col-8">{parseInt(details[5]>0?(parseInt(details[5])*100/(parseInt(details[5])+parseInt(details[6]))).toFixed(1):0)}%</div>
                            </div>
                            <div className="row">
                                <div className="col-4">NO votes</div>
                                <div className="col-8">{parseInt(details[6]>0?(parseInt(details[6])*100/(parseInt(details[5])+parseInt(details[6]))).toFixed(1):0)}%</div>
                            </div>

                            {parseInt(details[4])*1000 > Date.now() && details[7] === false 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.openVoteOnNewAssetProposalModal(details[0])}>Vote</Button>
                                :
                                ''
                            }
                            {parseInt(details[4])*1000 <= Date.now() 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.closeVoteOnNewAssetProposal(details[0])}>Close Vote</Button>
                                :
                                ''
                            }
                                
                        </div>
                    </div>
                </div>
            )
        }

        let showDAOvotes
        if (typeof(this.state.grantVotesDetailsOpen) != 'undefined'){
            showDAOvotes = this.state.grantVotesDetailsOpen.map((details,index) =>
                <div key ={index} className="col-6 p-4">
                    <div key ={index} className="h-100 p-1 mb-4 col">
                        <div id="innerBox" key ={index} className="h-100 p-4 col bg-innerBox text-black">

                            <div className="row">
                                <div className="col-12 mb-2"><b>Active ISSUAA DAO grant proposal #{index+1}</b></div>
                            </div>
                            <div className="row mb-3">
                                <div className="col my-auto"><b>Receiver:</b></div>
                                <div className="col addressGovernance my-auto mb-2">{details[0]}</div>
                            </div>
                            
                            <div className="row">
                                <div className="col"><b>Vote ends:</b></div>
                                <div className="col">{this.timeStampToDateAndTime(details[1])}</div>
                            </div>
                            <div className="row">
                                <div className="col"><b>Requested Amount:</b></div>
                                <div className="col">{this.props.outputNumber(details[4]/(10**18),0)} IPT</div>
                            </div>
                            <div className="row mt-3">
                                <div className="col"><b>Reason for the requested DAO grant:</b></div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">{details[5]}</div>
                            </div>
                            <div className="row">
                                <div className="col">YES votes</div>
                                <div className="col">{parseInt(details[2]>0?(parseInt(details[2])*100/(parseInt(details[3])+parseInt(details[2]))).toFixed(1):0)}%</div>
                            </div>
                            <div className="row">
                                <div className="col">NO votes</div>
                                <div className="col">{parseInt(details[3]>0?(parseInt(details[3])*100/(parseInt(details[3])+parseInt(details[2]))).toFixed(1):0)}%</div>
                            </div>

                            {parseInt(details[1])*1000 > Date.now() && details[7] === false 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.openVoteOnGrantProposalModal(details[0])}>Vote</Button>
                                :
                                ''
                            }
                            {parseInt(details[1])*1000 <= Date.now() 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.closeVoteOnGrantProposal(details[0])}>Close Vote</Button>
                                :
                                ''
                            }
                                
                        </div>
                    </div>
                </div>
            )
        }
        let showUpgradevotes
        if (typeof(this.state.upgradeVotesDetailsOpen) != 'undefined'){
            showUpgradevotes = this.state.upgradeVotesDetailsOpen.map((details,index) =>
                <div key ={index} className="col-6 p-4">
                    <div key ={index} className="h-100 p-1 mb-4 col">
                        <div id="innerBox" key ={index} className="h-100 p-4 col bg-innerBox text-black">

                            <div className="row">
                                <div className="col-12 mb-2"><b>ISSUAA Code Upgrade proposal #{index+1}</b></div>
                            </div>
                            <div className="row mt-3">
                                <div className="col"><b>Contract to be upgraded:</b></div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">{details[4]}</div>
                            </div>
                            <div className="row mb-3">
                                <div className="col my-auto"><b>New implementation contract address:</b></div>
                                <div className="col addressGovernance my-auto mb-2">{details[0]}</div>
                            </div>
                            
                            <div className="row">
                                <div className="col"><b>Vote ends:</b></div>
                                <div className="col">{this.timeStampToDateAndTime(details[1])}</div>
                            </div>
                            
                            
                            <div className="row">
                                <div className="col">YES votes</div>
                                <div className="col">{parseInt(details[2]>0?(parseInt(details[2])*100/(parseInt(details[3])+parseInt(details[2]))).toFixed(1):0)}%</div>
                            </div>
                            <div className="row">
                                <div className="col">NO votes</div>
                                <div className="col">{parseInt(details[3]>0?(parseInt(details[3])*100/(parseInt(details[3])+parseInt(details[2]))).toFixed(1):0)}%</div>
                            </div>

                            {parseInt(details[1])*1000 > Date.now() && details[7] === false 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.openVoteOnUpgradeProposalModal(details[0])}>Vote</Button>
                                :
                                ''
                            }
                            {parseInt(details[1])*1000 <= Date.now() 
                                ?
                                <Button variant="fuchsia text-black w-100 mt-3" id="buttonRounded" onClick={()=>this.closeVoteOnUpgradeProposal(details[0])}>Close Vote</Button>
                                :
                                ''
                            }
                                
                        </div>
                    </div>
                </div>
            )
        }


        let assetOutput
        if (typeof(this.props.assetDetails) != 'undefined' && typeof(this.props.assets) != 'undefined'){
            console.log(this.props.assetDetails);
            assets = this.getAssets();
            console.log(assets);
            console.log(this.props.assets);
            assetOutput = assets.map((asset,index) =>
                
                    <div key ={index} className="col-4 p-4">
                        <div id="innerBox" key ={index} className="h-100 p-1 mb-4 col bg-darkpurple text-light">
                        
                            <div id="mainBoxInner" key ={index} className="h-100 p-4 pr-0 col bg-innerBox text-black">
                                <p><b>{this.state.assetDetails[asset][2]}</b></p>
                                <p>{this.state.assetDetails[asset]['description']}</p>
                                <p>Upper Limit: {(parseFloat(this.state.assetDetails[asset]['upperLimit'])/1000).toLocaleString()} USDC</p>
                                <br/>
                                <b>Your position:</b>
                                <p>{asset}: {parseFloat(this.state.assetDetails[asset]['tokenBalance1']).toFixed(6)}</p>
                                <p>short{asset}: {parseFloat(this.state.assetDetails[asset]['tokenBalance2']).toFixed(6)}</p>
                                
                            
                                {this.state.assetDetails[asset]['votesEndingTime'] > Date.now()/1000 && this.state.assetDetails[asset]['voteOpen'] && this.state.assetDetails[asset]['hasVoted'] === false
                                    ? 
                                    <div>Vote if upper limit has been breached 
                                        <div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openVoteModal(asset)}>Vote</div>
                                        <div>Vote closes: {this.timeStampToDateAndTime(this.state.assetDetails[asset]['votesEndingTime'])}</div>
                                    </div>
                                    
                                    :
                                    ""
                                }
                                {this.state.assetDetails[asset]['votesEndingTime'] < Date.now()/1000 && this.state.assetDetails[asset]['voteOpen']
                                    ? 
                                    <div>Close the voting process <div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openCloseModal(asset)}>Close voting</div></div>
                                    :
                                   "" 
                                }
                                {this.state.assetDetails[asset]['voteOpen'] !== true && this.state.assetDetails[asset]['frozen'] === false && this.state.assetDetails[asset]['expiryTime'] > Date.now()/1000  && this.props.GovernanceTokenStakeBalance >100000
                                    ? 
                                    <div>Upper limited breached? <div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openFreezeModal(asset)}>Inititiate Freeze Process</div></div> 
                                    :
                                   "" 
                                }

                                {this.state.assetDetails[asset]['expiryTime'] < Date.now()/1000 && 
                                this.state.assetDetails[asset]['frozen'] === false &&
                                this.state.assetDetails[asset]['hasVotedOnExpiry'] === false &&
                                this.state.assetDetails[asset]['expiryVoteEndingTime'] > Date.now()/1000  &&
                                this.state.assetDetails[asset]['expiryVoteOpen'] === true
                                    ? 
                                    <div><div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openFinalPriceModal(asset)}>Vote on the expiry price</div></div>
                                    :
                                   "" 
                                }

                                {this.state.assetDetails[asset]['expiryTime'] < Date.now()/1000 && 
                                this.state.assetDetails[asset]['frozen'] === false &&
                                this.state.assetDetails[asset]['expiryVoteOpen'] === false &&
                                this.state.assetDetails[asset]['endOfLifeValue'] === "0"
                                    ? 
                                    <div><div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openInitiateExpiryVoteModal(asset)}>Inititiate voting process for the expiry price</div></div>
                                    :
                                   "" 
                                }


                                {this.state.assetDetails[asset]['expiryVoteEndingTime'] < Date.now()/1000 && 
                                this.state.assetDetails[asset]['expiryVoteOpen'] === true
                                    ? 
                                    <div><div className="badge badge-fuchsia text-black" role="button" onClick={()=>this.openCloseExpiryVoteModal(asset)}>Close the voting process for the expiry price</div></div>
                                    :
                                   "" 
                                }
                            </div>    
                        </div>
                        
                    </div>
                
            );  
        } ;   

        
        
       

        return ( 
            
                <div className="container-fluid w-100">

                    <Modal show={this.state.initiateUpgradeProposal} onHide={this.closeUpgradePropsal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Propose an Upgrade to the existing smart contracts of ISSUAA:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="bg-tgrey">
                               
                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Which smart contract would you like to upgrade?&nbsp;</b>
                                    <OverlayTrigger placement="right" overlay={tooltip8}>
                                       <img className="mr-2" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                                
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='text' id='smartContractToUpgrade'></input>
                                    
                                </div>
                            </div>

                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Please insert the address of the new smart contract:&nbsp;</b>
                                </div>                                
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='text' id='newSmartContractAddress'></input>
                                </div>
                            </div>


                            
                                
                                
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.submitUpgradeProposal}>Submit</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.initiateGrantProposal} onHide={this.closeGrantPropsal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Initiate a new DAO grant proposal:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="bg-tgrey">
                               
                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>How many IPT are you requesting?&nbsp;</b>
                                    <OverlayTrigger placement="right" overlay={tooltip8}>
                                       <img className="mr-2" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                                
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='number' id='grantAmount'></input>
                                    
                                </div>
                            </div>

                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Please describe what you will do for the proposed grant, which helps the ISSUAA protocol to foster:&nbsp;</b>
                                </div>                                
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <textarea className="w-100" id='grantDescription' rows="7"></textarea>
                                </div>
                            </div>


                            
                                
                                
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.submitGrantProposal}>Submit</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.initiateNewAssetProposal} onHide={this.closeNewAssetPropsalModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Propose a new ISSUAA Asset:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="bg-tgrey">
                               
                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Name of underlying asset&nbsp;</b>
                                    <OverlayTrigger placement="right" overlay={tooltip4}>
                                       <img className="mr-2" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                                
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='text' id='proposedName'></input>
                                    
                                </div>
                            </div>

                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                <b>Symbol&nbsp;</b>
                                <OverlayTrigger classname="border" placement="right" overlay={tooltip5}>
                                        <img className="mr-2 py-auto" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='text' id='proposedSymbol'></input>
                                </div>
                            </div>  

                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Description&nbsp;</b>
                                    <OverlayTrigger placement="right" overlay={tooltip6}>
                                        <img className="mr-2 py-auto" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <textarea rows="5" className="form-control" type='text' id='proposedDescription'></textarea>
                                </div>
                            </div>  

                            <div className="row vertical_center">
                                <div className="col-12 vertical_center">
                                    <b>Upper Limit&nbsp;</b>
                                    <OverlayTrigger placement="right" overlay={tooltip7}>
                                        <img className="mr-2 py-auto" src={info} alt="Info"/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input className="form-control" type='number' id='proposedUpperLimit'></input>
                                </div>
                            </div>    
                                    
                                    
                               
                                
                                
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.submitNewAssetProposal}>Submit</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.voteOnGrantProposalModal} onHide={this.closeVoteOnGrantProposalModal}>
                        <Modal.Header closeButton />
                        <Modal.Body>
                               <div className="row p-2">Vote on the following Grant Request:</div>
                               <div className="row px-2">Receiver: {this.state.selectedGrantVote}</div>
                               <div className="row px-2">Amount: {(parseInt(this.state.selectedGrantVoteAmount)/(10**18))} IPT</div>
                               <div className="row px-2">description: {this.state.selectedGrantVoteDescription}</div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="accent" id="buttonRounded" onClick={this.voteYesOnGrantPropsal}>Yes</Button>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.voteNoOnGrantPropsal}>No</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.voteOnUpgradeProposalModal} onHide={this.closeVoteOnUpgradeProposalModal}>
                        <Modal.Header closeButton />
                        <Modal.Body>
                               <div className="row p-2">Vote on the following Grant Request:</div>
                               <div className="row px-2">Contract to be replaced: {this.state.selectedContractToUpgrade}</div>
                               <div className="row px-2">New Implmentation Address: {this.state.selectedNewContractAddress}</div>

                               
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="accent" id="buttonRounded" onClick={this.voteYesOnUpgradePropsal}>Yes</Button>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.voteNoOnUpgradePropsal}>No</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.voteOnNewAssetProposalModal} onHide={this.closeVoteOnNewAssetProposalModal}>
                        <Modal.Header closeButton />
                        <Modal.Body>
                               <div className="row p-2">Vote on the following proposed new Asset:</div>
                               <div className="row px-2">Symbol: {this.state.selectedNewAssetVote}</div>
                               <div className="row px-2">Name: {this.state.selectedNewAssetName}</div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="accent" id="buttonRounded" onClick={this.voteYesOnNewAssetPropsal}>Yes</Button>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.voteNoOnNewAssetPropsal}>No</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.initiateExpiryVoteModalOpen} onHide={this.closeInitiateExpiryVoteModal}>
                        <Modal.Header closeButton>
                           
                        </Modal.Header>
                            <Modal.Body>
                                Do you want to initiate the expiry price voting process for {this.state.assetToFreeze}?
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="accent" id="buttonRounded" onClick={this.initiateExpiryPriceVote}>Confirm</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.finalPriceModalOpen} onHide={this.closeFinalPriceModal}>
                        <Modal.Header closeButton />
                        <Modal.Body>
                               Please vote on the price at expiry of the following asset: {this.state.assetToVoteOnFinalPrice}
                               <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <label className="input-group-text" for="amountToStake">Expiry price:</label>
                                    </div>
                                    <input className="form-control" type='number' id='expiryPrice'></input>
                                </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.expiryPriceVote}>Submit</Button>
                            
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.closeExpiryVoteModalOpen} onHide={this.closeCloseExpiryVoteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Close the Expiry Price Vote on the following Asset?</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                               {this.state.assetToCloseExpiryVote}
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.initiateCloseExpiryVote}>Yes</Button>
                            <Button variant="darkAccent" id="buttonRounded" onClick={this.closeCloseExpiryVoteModal}>No</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.freezeModalOpen} onHide={this.closeFreezeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Notify that an asset has frozen:</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                                Are you sure that you want to initiate the freeze process for {this.state.assetToFreeze}?
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="accent" id="buttonRounded" onClick={this.initiateFreeze}>Confirm</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.voteModalOpen} onHide={this.closeVoteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Vote:</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                               Has  {this.state.assetToVote} breached its upper limit?
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.initiateYesVote}>Yes</Button>
                            <Button variant="warning" id="buttonRounded" onClick={this.initiateNoVote}>No</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.closeModalOpen} onHide={this.closeCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Close the Vote on the following Asset?</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                               {this.state.assetToClose}
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="fuchsia text-black" id="buttonRounded" onClick={this.initiateClose}>Yes</Button>
                            <Button variant="warning" id="buttonRounded" onClick={this.closeCloseModal}>No</Button>
                        </Modal.Footer>
                    </Modal>

                    <Zoom>
                    <div className="row w-100">
                        <div className="col"></div>
                        <div id="mainBox" className="col-10 container p-0">
                            <div id="mainBoxInner" className="w-100 m-0 p-3 rounded bg-darkpurple text-light">
                                <div className="container p-0 p-4 px-0 text-light bg-darkpurple">
                                
                                    <div className="h1 row px-0 font-weight-bold text-center pb-2 underlined-fuchsia">
                                        <div className="col-12 center-block text-center">
                                            ISSUAA Governance & Voting
                                        </div>

                                    </div>
                                    <div className="row px-0 py-3 px-3 mt-3 text-light">
                                        As decentralized autonomous organization (DAO) the ISSUAA protocol is governed exclusively via voting procedures 
                                        by the community of owners of the ISSUAA Protocol Token (IPT). 
                                        One staked IPT represents one vote in ISSUAA governance votings.
                                    </div>
                                    <div className="row px-0 py-3 px-3 mt-3 bg-nav">
                                        <div id={this.state.styleCSS1} className="col rounded bg-darkpurple text-black mr-5 p-1" onClick={()=>this.changeView('assets')} role="button">
                                            <div>
                                                <div className="row">
                                                    <div className="col pl-4">
                                                        Freeze- and Expiry votings for ISSUAA Assets &nbsp;
                                                        <OverlayTrigger placement="top" overlay={tooltip1}>
                                                            <img className="mr-2" src={info} alt="Logo"/>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <div id={this.state.styleCSS2} className="col rounded bg-darkpurple text-black mr-5 p-1" onClick={()=>this.changeView('newAsset')} role="button">
                                            <div>
                                                <div className="row">
                                                    
                                                    <div className="col pl-4">
                                                        New ISSUAA Asset proposals & votings&nbsp;
                                                        <OverlayTrigger placement="top" overlay={tooltip1}>
                                                            <img className="mr-2" src={info} alt="Logo"/>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="row bottom-right pr-4 pb-2">
                                                    <div className="col"></div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        

                                        {this.props.chain === "Ganache" || this.props.chain === "MaticTestnet"?
                                        <div id={this.state.styleCSS3} className="col rounded bg-darkpurple text-black mr-5 p-1" onClick={()=>this.changeView('grantVotes')} role="button">
                                            <div>
                                                <div className="row">
                                                    <div className="col pl-4">
                                                        ISSUAA DAO grant proposals & votings&nbsp;
                                                        <OverlayTrigger placement="top" overlay={tooltip1}>
                                                            <img className="mr-2" src={info} alt="Logo"/>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="row bottom-right pr-4 pb-2">
                                                    <div className="col"></div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div id={this.state.styleCSS3} className="col rounded bg-darkpurple text-black mr-5 p-1" onClick={()=>this.changeView('grantVotes')} role="button">
                                            <div>
                                                <div className="row">
                                                    <div className="col pl-4">
                                                        ISSUAA DAO grant proposals & votings&nbsp;
                                                        <OverlayTrigger placement="top" overlay={tooltip1}>
                                                            <img className="mr-2" src={info} alt="Logo"/>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="row bottom-right pr-4 pb-2">
                                                    <div className="col"></div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        }
                                    
                                        {this.props.chain === "Ganache" || this.props.chain === "MaticTestnet"?
                                        
                                        <div id={this.state.styleCSS4} className="col rounded bg-darkpurple text-black mr-0 p-1" onClick={()=>this.changeView('upgrade')} role="button">
                                            <div>
                                                <div className="row">
                                                    <div className="col pl-4">
                                                        Smart Contract Code Upgrade Votes&nbsp;
                                                        <OverlayTrigger placement="top" overlay={tooltip1}>
                                                            <img className="mr-2" src={info} alt="Logo"/>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="row bottom-right pr-4 pb-2">
                                                    <div className="col"></div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        
                                        :
                                        ''
                                        }

                                    </div>

                                </div>
                                <div className="container px-4 pr-4 py-2 text-light bg-darkpurple px-0">
                                    {this.state.view === "assets" ?
                                        <div className="w-100">
                                        <Zoom> 
                                            <div className="row m-0">
                                                {assetOutput} 
                                            </div>                                        
                                        </Zoom>
                                        </div>
                                    : 
                                    ''
                                    }

                                    {this.state.view === "newAsset" ?
                                        <div className="w-100">
                                        <Zoom>
                                            <div className="row m-0">
                                                {this.state.proposeNewAssetButtonVisible ?
                                                    <div className="pl-4 pr-4 ml-0 row pt-4 mr-0 w-100" id="1">
                                                        <div className="col-12 my-auto btn btn-fuchsia text-black" id="buttonRounded" onClick={()=>this.openNewAssetPropsalModal()}>You have an idea for a great new asset to add? Propose it!</div>
                                                        
                                                    </div>
                                                    :
                                                    ''
                                                }

                                            </div>
                                            <div className="pl-0 ml-0 row p-0 mr-0 pr-0" id="3">
                                                <div className="row ml-0 mr-0 w-100 my-auto text-black py-4">                                                    
                                                    {showNewAssetProposals}
                                                </div>
                                            </div>
                                            

                                        </Zoom>    
                                        </div>
                                    : 
                                    ''
                                    }
                                    
                                    {this.state.view === "grantVotes" ?
                                        <div className="w-100">
                                        <Zoom>
                                            <div className="row m-0">
                                                {this.state.requestGrantButtonVisible ?
                                                    <div className="pl-4 pr-4 ml-0 row pt-4 mr-0 w-100" id="1">
                                                        <div className="col-12 my-auto btn btn-fuchsia text-black" id="buttonRounded" onClick={()=>this.openGrantPropsal()}>Are you planning on doing something that helps the ISSUAA protocol? Request a DAO grant!</div>
                                                        
                                                    </div>
                                                    :
                                                    ''
                                                }

                                            </div>
                                            <div className="pl-0 ml-0 row p-0 mr-0 pr-0" id="3">
                                                <div className="row ml-0 mr-0 w-100 my-auto text-black py-4">
                                                    
                                                    {showDAOvotes}
                                                </div>
                                            </div>
                                        </Zoom>    
                                        </div>

                                    :
                                        ''
                                    }

                                    {this.state.view === "upgrade" ?

                                        <div className="w-100">
                                        <Zoom>
                                            <div className="row m-0">
                                                {this.state.proposeUgradeButtonVisible ?
                                                    <div className="pl-4 pr-4 ml-0 row pt-4 mr-0 w-100" id="1">
                                                        <div className="col-12 my-auto btn btn-fuchsia text-black" id="buttonRounded" onClick={()=>this.openUpgradePropsal()}>Propose an upgrade to the existing smart contracts!</div>
                                                        
                                                    </div>
                                                    :
                                                    ''
                                                }

                                            </div>
                                            <div className="pl-0 ml-0 row p-0 mr-0 pr-0" id="3">
                                                <div className="row ml-0 mr-0 w-100 my-auto text-black py-4">
                                                    
                                                    {showUpgradevotes}
                                                </div>
                                            </div>
                                        </Zoom>    
                                        </div>

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
 
export default Governance;