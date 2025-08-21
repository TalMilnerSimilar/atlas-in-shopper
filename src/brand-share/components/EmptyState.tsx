import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: string;
  hoverIllustration?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration = '/illustrations/my-products-empty-illustration.svg',
  hoverIllustration = '/illustrations/my-products-empty-illustration-hover.svg',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="relative group mb-6">
        <img
          src={illustration}
          alt={title}
          className="w-32 h-32 group-hover:opacity-0 transition-opacity duration-200"
        />
        <img
          src={hoverIllustration}
          alt={title}
          className="w-32 h-32 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
      
      <h3 className="text-[20px] leading-[28px] font-medium text-[#092540] font-dm-sans mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-[16px] leading-[22px] font-normal text-[#3a5166] font-dm-sans mb-6 text-center max-w-md">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
