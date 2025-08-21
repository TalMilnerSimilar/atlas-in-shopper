import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'ghost',
  ...props
}) => {
  const baseClasses = `
    px-4 py-2 text-xs font-medium font-dm-sans leading-4 rounded-[18px]
    transition-all duration-150
  `;

  const variantClasses = {
    ghost: `
      text-primary-blue bg-white
      shadow-[0_0_0_1px_#E6E9EC_inset]
      hover:shadow-[0_0_0_1px_#195AFE_inset] hover:bg-primary-blue-light-hover
      active:shadow-[0_0_0_1px_#195AFE_inset] active:bg-primary-blue-light-active
      disabled:text-text-disabled disabled:shadow-[0_0_0_1px_#E6E9EC_inset] disabled:bg-transparent disabled:cursor-not-allowed
    `,
    primary: `
      text-white bg-primary-blue
      hover:bg-primary-blue-hover
      active:bg-primary-blue
      disabled:bg-gray-400 disabled:cursor-not-allowed
    `,
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className || ''}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
