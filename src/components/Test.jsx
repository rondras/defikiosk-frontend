import React, { Component } from 'react';
import Zoom from 'react-reveal/Zoom';
//import { Modal, Button } from "react-bootstrap";




class Test extends Component {
    
    constructor(props){
        super(props)
        this.state = { 
            
        }
        
    }
    async componentDidMount() {
        this.setState({
            assets: ['wait'],
            USDTBalance: this.props.USDTBalance,
            //INTAddress: this.props.GovernanceToken_Address,
        });
    };

    




    mintUSD = async() => {
        let message = "Requesting 100k Mock USD"
        this.props.openMessageBox(message)
        try{await this.props.USDT.methods.faucet().send({from: this.props.address});}
        catch(e){
            console.log(e['message'])
            message = e['message']
            this.props.openMessageBox(message)
            await this.props.sleep(5000)
            this.props.closeMessageBox();
            return
        }
        await this.props.loadUSDBalance();
        this.props.closeMessageBox()
        return ("Already approved")
    }


    
    



    render() { 
        console.log(this.state)
        
        return ( 
            <Zoom>
            <div className="row w-100">
                <div className="container-fluid m-3">
                    <div className="row">
                        <div className="col"></div>
                        <div className="col-4 container bg-accent text-black p-2 rounded">
                            <div className="w-100 bg-light text-black p-3 rounded border border-dark">
                                {this.props.chain === "MaticTestnet" ?
                                <div className="p-2">

                                    <div className="h1">Welcome to ISSUAA ALPHA testing</div>
                                    First, to pay the gas fees on the testnet, you will need some testnet MATIC. Please check the faucet below which will provide you with some for free. 
                                    <br></br>
                                    <div><a className="btn btn-fuchsia mt-2" href="https://faucet.matic.network/" target="_blank">Faucet</a></div>
                                    
                                    
                                    <br></br>
                                </div>
                                :
                                <div className="p-2">

                                    <div className="h1">Welcome to ISSUAA ALPHA testing</div>
                                    First, to pay the gas fees on the testnet, you will need some testnet ether. Please check the faucet below which will provide you with some for free. 
                                    <br></br>
                                    <div><a className="btn btn-fuchsia mt-2" href="https://faucet.ropsten.be/" target="_blank">Faucet</a></div>
                                    
                                    
                                    <br></br>
                                </div>
                                }

                                <div className="p-2">   
                                    Second, for testing, we are not using real USD coins, but a Mock-USD token.
                                    You can get some Mock-USD here for testing purposes by minting them here.
                                    <br></br>
                                </div>
                                <div className="btn btn-fuchsia ml-2" onClick={this.mintUSD}>Get Test USD</div>
                            </div>
                        </div>
                        <div className="col"></div>
                    </div>
                </div>
            </div>
            </Zoom>
        );
    }
}
 
export default Test;