import React from 'react';

import './Settings.css';
import UserAPI from '../models/UserAPI';
import { setColorTheme, generateHues, THEME_COLORS } from '../util/colors';


export default class Settings extends React.Component {
    state = {
        colorTheme: null
    }

    async componentDidMount() {
        let color;
        try {
            color = await UserAPI.getColorTheme();
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }

        if (color) {
            this.setState({ colorTheme: color });
        } else {
            this.setState({ colorTheme: THEME_COLORS.ROSE });
        }
    }

    render() {
        const { colorTheme } = this.state;

        const colorHueArray = Object.keys(THEME_COLORS).map((name) => {
            const hues = generateHues(name);
            return [name, ...hues]
        });

        return <div className='settings-container'>
            {colorHueArray.map(([name, hue1, hue2, hue3], i) => {
                return <div className={`color-card ${colorTheme === name ? 'selected' : ''}`} key={i} onClick={() => {
                    setColorTheme(name);
                    this.setState({ colorTheme: name })
                    UserAPI.updateColorTheme(name);
                }}>
                    <div className='color-block'>
                        <div style={{ backgroundColor: `hsl(${hue1}, 89%, 93%)` }}></div>
                        <div style={{ backgroundColor: `hsl(${hue2}, 100%, 82%)` }}></div>
                        <div style={{ backgroundColor: `hsl(${hue3}, 80%, 77%)` }}></div>
                    </div>
                    <p>{name}</p>
                </div>
            })}
        </div>
    }
}

