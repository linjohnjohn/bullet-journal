import React from 'react';
import './Errors.css'

class Errors extends React.Component {
    state = {
        errors: []
    }

    componentDidMount = () => {
        document.addEventListener('custom-error', (event) => {
            const { errors } = this.state;
            const { message, type } = event.detail;
            const key = Date.now()
            this.setState({ 
                errors: [...errors, { message, type, key }]
            });
            setTimeout(() => {
                let { errors } = this.state;
                errors = errors.filter(e => e.key !== key);
                this.setState({
                    errors
                });
            }, 5000);
        });
    }

    render() {
        const { errors } = this.state;
        return <>
        <div className='error-log'>
            {errors.map(e => {
                const { message = 'Something went wrong', type = 'yellow', key } = e;
                return <div className={`error-item centered-message ${type}`} key={key}>
                    {message}
                </div>
            })}
        </div>
        <div>
            {this.props.children}
        </div>
        </>
    }
}

export default Errors;