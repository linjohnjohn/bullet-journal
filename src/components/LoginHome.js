import React from 'react';
import { withRouter } from 'react-router-dom';
import { IoIosCheckmark } from 'react-icons/io'
import { FaFacebookSquare } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

import './LoginHome.css';

const LoginHome = ({ handleFacebookLogin, handleGoogleLogin }) => {
    return <div className='notebook'>
        <div className="notebook-container centered-message d-flex flex-column justify-content-around align-item-center">
            <div className={`login-intro-container`}>
                <p className="h2">Never fuss over drawing templates or carrying a physical notebook again!</p>
                <div className="d-flex align-items-center justify-content-center">
                    <IoIosCheckmark className="icon" />
                    <p className="h4">Bye bye drawing templates!</p>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                    <IoIosCheckmark className="icon" />
                    <p className="h4">All you need is your phone!</p>
                </div>
            </div>
            <div className={`login-button-container`}>
                {/* <p className="h3">Sign in Hassle Free!</p> */}
                <button className="btn google-btn" onClick={handleGoogleLogin}><FcGoogle className="login-icon" />Sign in with Google</button>
                <button className="btn facebook-btn" onClick={handleFacebookLogin}><FaFacebookSquare className="login-icon" />Sign in with Facebook</button>
            </div>
        </div>
    </div>
}

export default withRouter(LoginHome);
