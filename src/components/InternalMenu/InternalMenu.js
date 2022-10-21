import React from 'react';
import PropTypes from 'prop-types';
// Styles
import "./InternalMenu.css";
// Icons
import { FaMoon, FaSun } from 'react-icons/fa';

/*
 * TODO: Refactor Menu as a functional component
 *
 * Requirements:
 * - Create a custom hook to implement dark mode named useDarkMode
 * - Switch from setState to the useDarkMode hook
 * - Use function closures instead of this for callbacks and event handlers
 * - Menu logic and behavior should remain the same
 *
 */
class InternalMenu extends React.Component {
  state = {
    darkMode: true,
  };

  handleOnChangeMode = () => {
    this.setState(prevState => ({
      ...prevState,
      darkMode: !prevState.darkMode,
    }));
  };

  render() {
    const ModeIcon = this.state.darkMode ? FaSun : FaMoon;

    const brandLogo = this.state.darkMode
      ? `${process.env.PUBLIC_URL}/logo_white.svg`
      : `${process.env.PUBLIC_URL}/logo.svg`;

    return (
      <div className="internal-menu-container">
        
        <ul className="internal-menu-nav">
          {this.props.items.map((item, i) => (
            <li
              key={item}
              onClick={() => this.props.onSelectItem(i)}
              className={this.props.selectedItem === i ? 'selected' : null}
            >
              <h2>{item}</h2>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

InternalMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  selectedItem: PropTypes.number,
  onSelectItem: PropTypes.func,
};

export default InternalMenu;
