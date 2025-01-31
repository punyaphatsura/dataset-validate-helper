import * as React from 'react';

import { cn } from '@/lib/utils';

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      // type={type}
      className={cn(
        'flex w-full rounded-md border border-input bg-transparent px-3 py-4 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-lg',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
TextArea.displayName = 'TextArea';

export { TextArea };
