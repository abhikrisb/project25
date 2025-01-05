import React,{ReactNode} from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }:CardProps) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export default Card;