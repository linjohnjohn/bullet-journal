import React from 'react';
import { withRouter } from 'react-router-dom';
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
                    }}>{user.displayName.length > 0 ? user.displayName.charAt(0) : 'A'}</Avatar> :
                    <button className="btn" onClick={handleGoogleLogin}>Google Login</button>
                }
            </div>

            <SidePanel isOpen={isNavPanelOpen} onClose={() => {
                this.setState({ isNavPanelOpen: false });
            }}>
                <div className="nav-panel">
                    <p className='btn' onClick={(e) => {
                        this.props.history.push('/settings')
                        this.setState({ isNavPanelOpen: false })
                    }}>Settings</p>
                    <p className='btn' onClick={() => {
                        handleGoogleLogout();
                    }}>Logout</p>
                </div>
            </SidePanel>
        </div>
    }
}

export default withRouter(Navbar);
