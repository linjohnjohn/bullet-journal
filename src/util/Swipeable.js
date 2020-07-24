import React from 'react';

export default class Swipeable extends React.Component {
    handleTouchStart = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        this.xDown = evt.touches[0].clientX;
    }

    handleTouchMove = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if ( ! this.xDown) {
            return;
        }
        var xUp = evt.touches[0].clientX;
        this.xDiff = xUp - this.xDown;

        if (this.xDiff >= 150) {
            this.props.onRight(evt);
        } else if (this.xDiff > 0) {
            this.props.onRightTransition(this.xDiff);
        }
    }

    render() {
        return <div onTouchStart={this.handleTouchStart} onTouchMove={this.handleTouchMove} onTouchEnd={this.props.onResetTransition}>
            {this.props.children}
        </div>
    }
}