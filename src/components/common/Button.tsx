import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  children: React.ReactNode;
  isPrimary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({
  children,
  isPrimary = false,
  onClick,
  disabled = false,
  type = 'button',
  size = 'medium',
}: ButtonProps) {
  return (
    <MuiButton
      variant={isPrimary ? 'contained' : 'outlined'}
      onClick={onClick}
      disabled={disabled}
      type={type}
      size={size}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: size === 'small' ? 0.5 : size === 'large' ? 2 : 1,
        px: size === 'small' ? 1.5 : size === 'large' ? 3 : 2,
        fontSize:
          size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.8rem',
        fontWeight: isPrimary ? 600 : 400,
        borderRadius: '16px',
        minWidth:
          size === 'small' ? '80px' : size === 'large' ? '120px' : '100px',
        width: '100%',
      }}
    >
      {children}
    </MuiButton>
  );
}
