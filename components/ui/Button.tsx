import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullwidth?: boolean;
}

const Button = ({
                    variant = 'primary',
                    size = 'md',
                    fullwidth = false,
                    className = '',
                    children,
                    ...props
                }: ButtonProps) => {

    const baseClass = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const fullwidthClass = fullwidth ? 'btn--fullwidth' : '';

    const combinedClasses = [
        baseClass,
        variantClass,
        sizeClass,
        fullwidthClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;