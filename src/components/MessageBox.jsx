import Slide from 'react-reveal/Slide';
import {Component} from 'react';


class MessageBox extends Component{







  
  constructor(props) {
    super(props);
    this.state = {  
      
    }
  }

  render(){
    return (
        <Slide left><div className="fixed-bottom">
           <div className="row">
                <div className="col"></div>
                <div className="col-3 alert alert-dark bg-darkpurple text-light">
                  <div className="row">
                    <div className="col">
                      <div className="spinner-border m-3" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                    <div className="col my-auto">
                      {this.props.content}
                    </div>
                  </div>
                </div>
            </div>
        </div>
        </Slide>
    )
  } 
}

export default MessageBox;
