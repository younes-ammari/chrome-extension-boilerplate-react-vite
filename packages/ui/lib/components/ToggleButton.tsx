import { exampleThemeStorage } from '@extension/storage';
import { useStorage } from '@extension/shared';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

type ToggleButtonProps = ComponentPropsWithoutRef<'button'>;

export const ToggleButton = ({ className, ...props }: ToggleButtonProps) => {
  const theme = useStorage(exampleThemeStorage);

  const toggleTheme = () => {
    exampleThemeStorage.toggle();
  };

  return (
    <button
      className={cn(
        className,
        'px-4 py-4 rounded shadow hover:scale-105',
        theme === 'light' ? 'bg-white text-black' : 'bg-black text-white',
        theme === 'light' ? 'border-black' : 'border-white',
        'border-2 font-bold',
      )}
      onClick={toggleTheme}
      {...props}>
      {/* {children} */}
      {theme !== 'dark' ? '🌙' : '☀️'}
    </button>
  );
};
