import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Card.module.css';

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  rounded = 'medium',
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[padding],
    styles[shadow],
    styles[rounded],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  shadow: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  rounded: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
};

export default Card;