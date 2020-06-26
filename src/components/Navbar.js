import React from 'react';
import Avatar from '@material-ui/core/Avatar';


import SidePanel from './SidePanel';

class Navbar extends React.Component {
    state = {
        isNavPanelOpen: false,
    }

    render() {
        const { isNavPanelOpen } = this.state;
        const { user, handleGoogleLogin, handleGoogleLogout } = this.props;

        return <div className="navbar">
            <h3>Mr. Bullet</h3>
            <div className="right-nav-section">
                {user ?
                    <Avatar className='icon' onClick={() => {
                        this.setState({ isNavPanelOpen: true });
                    }}>{user.displayName.charAt(0)}</Avatar> :
                    <button className="btn" onClick={handleGoogleLogin}>Google Login</button>
                }
            </div>

            <SidePanel isOpen={isNavPanelOpen} onClose={() => {
                this.setState({ isNavPanelOpen: false });
            }}>
                <div className="nav-panel">
                    <p className='btn'>Settings</p>
                    <p className='btn' onClick={() => {
                        handleGoogleLogout();
                        this.setState({ isNavPanelOpen: false })
                    }}>Logout</p>
                </div>
            </SidePanel>
        </div>
    }
}

export default Navbar;
