import {Component} from 'react';
import {useState} from 'react';
import {USDT_Address, USDT_ABI, assetFactory_Address} from '../config';
import github from '../img/github_white.png';
import discord from '../img/discord_white.png';
import twitter from '../img/twitter_white.png';
import github2 from '../img/github_green.png';
import discord2 from '../img/discord_green.png';
import twitter2 from '../img/twitter_green.png';
import telegram from '../img/telegram_white.png';
import telegram2 from '../img/telegram_green.png';

class Footer extends Component{







  
  constructor(props) {
    super(props);
    this.state = {  
      account: '',
      loading: true,
    }
  }

  changePagePortfolio = () => {
      console.log("Changing view to portfolio")
  }

  render(){
    return (
      <div className="container-fluid">
          <nav className="navbar navbar-expand-xl fixed-bottom navbar-dark bg-nav w-100">
            <div className="flexbox w-100 m-0">
              <div className="row w-100 justify-content-center m-0">
                <div className="col-3 text-left copyright">
                  &copy; 2022 defiKIOSK
                </div>
                <div className="col-6 justify-content-center text-center">
                  <a href="https://t.me/issuaa_main" target="_blank"><img src={telegram} alt="discord" height="30" onMouseOver={e => e.currentTarget.src = telegram2} onMouseOut={e => e.currentTarget.src = telegram}/></a>
                  &nbsp;&nbsp;&nbsp;
                  <a href="https://discord.gg/ttu8vEQM6G" target="_blank"><img src={discord} alt="discord" height="30" onMouseOver={e => e.currentTarget.src = discord2} onMouseOut={e => e.currentTarget.src = discord}/></a>
                  &nbsp;&nbsp;&nbsp;
                  <a href="https://github.com/issuaa/issuaa-contracts" target="_blank"><img src={github} alt="github" height="30" onMouseOver={e => e.currentTarget.src = github2} onMouseOut={e => e.currentTarget.src = github}/></a>
                  &nbsp;&nbsp;&nbsp;
                  <a href="https://twitter.com/issuaa2" target="_blank"><img src={twitter} alt="twitter" height="30" onMouseOver={e => e.currentTarget.src = twitter2} onMouseOut={e => e.currentTarget.src = twitter}/></a>
                </div>
                <div className="col-3"></div>
              </div>
              



              
            </div>
            
          </nav>
      </div>
    )
  } 
}

export default Footer;
