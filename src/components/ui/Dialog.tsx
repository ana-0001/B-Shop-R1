/** src/components/ui/dialog.tsx — نافذة المودال (بنفس هوية erp-modal في التصميم) فوق Radix UI */
import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal

export const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn('erp-modal-overlay', className)} {...props} />
))
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose = false, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="erp-modal-overlay" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'erp-modal-dialog fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-modal space-y-md outline-none',
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className="erp-btn absolute end-3 top-3 py-xs px-sm text-xs"
          aria-label="Close dialog"
        >
          <X className="w-3.5 h-3.5" />
          Esc
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between border-b border-border pb-sm gap-sm', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
DialogHeader.displayName = 'DialogHeader'

export const DialogFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-xs border-t border-border pt-sm', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-extrabold text-bg-f', className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-xs text-muted-f', className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = 'DialogDescription'
