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
                    <div>
                        <p className='btn' onClick={(e) => {
                            this.props.history.push('/visualization')
                            this.setState({ isNavPanelOpen: false })
                        }}>Tracker</p>
                    </div>
                    <div>
                        <p className='btn' onClick={(e) => {
                            this.props.history.push('/colors')
                            this.setState({ isNavPanelOpen: false })
                        }}>Colors</p>
                        <p className='btn' onClick={(e) => {
                            this.props.history.push('/payment')
                            this.setState({ isNavPanelOpen: false })
                        }}>Subscription</p>
                        <p className='btn' onClick={() => {
                            handleGoogleLogout();
                            this.setState({ isNavPanelOpen: false })
                        }}>Logout</p>
                    </div>
                </div>
            </SidePanel>
        </div>
    }
}

export default withRouter(Navbar);
