
import {Component} from 'react';
import {ToggleButtonGroup, ButtonGroup, ToggleButton, Button} from "react-bootstrap";
import logo from '../img/ISSUAA_Logo-b_grey2D2D2D_outlines.png';
import logo_alpha from '../img/ISSUAA_Logo-b_grey2D2D2D_outlines.png';

class Navbar extends Component{


  
  constructor(props) {
    super(props);
    this.state = {  
      account: '',
      loading: true,
      
    }
  }

  render(){
    return (
        <div className="container-fluid">
            <nav className="navbar navbar-expand-xl navbar-dark bg-nav">
                <a className="navbar-brand logoText" id="logoText" href="#" onClick={() =>this.props.changeView('mainpage')}>
                  <span className ="logoText">defiKIOSK</span>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">   
                            <a className="nav-link" href="#" onClick={() =>this.props.changeView('portfolio')}>Portfolio</a>
                        </li>


                        <li className="nav-item">   
                            <a className="nav-link" href="https://issuaa.gitbook.io/issuaa/" target="_blank">Docs</a>
                        </li>
                        <li className="nav-item">   
                            <a className="nav-link" href="https://medium.com/@issuaa" target="_blank">Blog</a>
                        </li>
                        
                    </ul>
                    
                    <Button size="sm" variant="accent" className="text-black mr-3" onClick={() =>this.props.changeChain()}>{this.props.chainName}</Button>  
                    <Button size="sm" variant="light" className="text-black" onClick={() =>this.props.showAccount()}>{this.props.addressShort}</Button>                   
                </div>
            </nav>
            <div className="row" style={{height: 20}}></div>    
        </div>
    )
  } 
}

export default Navbar;
