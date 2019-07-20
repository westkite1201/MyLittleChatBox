import React, { Component } from 'react'
import style from './SideBar.module.css'
import { Link,NavLink  } from 'react-router-dom';
class SideBar extends Component {

    state = {
        openNav : true,
        open : true,
    }

     openNav =() => {
        document.getElementById("mySidebar").style.width = "200px";
        document.getElementById("main").style.marginLeft = "200px";
        this.setState({
            openNav : !this.state.openNav
        })
      }
      
     closeNav = () =>{
        document.getElementById("mySidebar").style.width = "0";
        document.getElementById("main").style.marginLeft= "0";
        this.setState({
            openNav : !this.state.openNav
        })
      }

      shouldComponentUpdate(nextProps, nextState){
          if( nextProps.open !== this.state.open ){
            this.setState({
                open : nextProps.open
            })
            return true;
          }
          return true;
      }

    render() {
        const { openNav,open  } = this.state; 
        const { match, 
            routes, 
            openSideBar } = this.props;
        const activeStyle = {
            color: 'white',
            fontSize: '1rem'
        };
        const openStyle = {
//color: 'bac',
            fontSize: '1rem',
            marginLeft : '200px',
        
        };
        const closeStyle = {
            //color: 'white',
            marginLeft : '0px',
            fontSize: '2rem'
        };

        const sideBarOpenStyle = {
            //color: 'white',
            width : '0px',
           // fontSize: '2rem'
        };
        const sideBarCloseStyle = {
            //color: 'white',
            width : '200px',
            //fontSize: '2rem'
        };



        console.log(routes)        
        const link = routes.map(( prop, key ) => {
            if( prop.sideView ){
                console.log('hello')
                return (
                <NavLink to={prop.path} 
                        activeStyle = {activeStyle}
                        key = {key} >
                    {prop.sidebarName}
                </NavLink>
                )
            }
        })

        return (
            <div>
                <div id="mySidebar" className={style.sidenav} style = { open ? sideBarCloseStyle : sideBarOpenStyle}>
                    <a href="javascript:void(0)" 
                        className= {style.closebtn}
                        //onClick={this.closeNav}>&times;</a>
                        onClick={openSideBar}>&times;</a>
                    {link}

                </div>
                <div id="main" className = {style.main}>
                {!openNav ? 
                     (
                         <div></div>
                     )
                     :
                     ( 
                    <span style={{ fontSize: '30px',cursor: 'pointer', position :'absolute', zIndex: 100, color: '#111' }} 
                          //onClick= {this.openNav}>&#9776;</span>
                          onClick= {openSideBar}
                        >&#9776;</span>
                    ) 
                }
                </div>
            </div>
        )
    }
}
export default SideBar