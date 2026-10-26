// Ambient types for the Mashura design-system UMD bundle exposed at window.MashuraUI.

import type { ReactNode, CSSProperties, ChangeEvent, MouseEvent } from 'react'

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'
type Padding = 'none' | 'sm' | 'md' | 'lg'

interface Common {
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

interface ButtonProps extends Common {
  variant?: Variant
  size?: Size
  icon?: string
  iconEnd?: string
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: (e: MouseEvent) => void
  type?: 'button' | 'submit'
}

interface IconButtonProps extends Common {
  icon: string
  label: string
  variant?: Variant
  size?: Size
  onClick?: (e: MouseEvent) => void
}

interface IconProps extends Common {
  name: string
  size?: number
}

interface BadgeProps extends Common {
  tone?: Tone
  dot?: boolean
}

interface CardProps extends Common {
  padding?: Padding
  interactive?: boolean
  selected?: boolean
  onClick?: (e: MouseEvent) => void
}

interface InputProps extends Common {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  icon?: string
  type?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  multiline?: boolean
  rows?: number
  containerStyle?: CSSProperties
  dir?: string
  disabled?: boolean
  required?: boolean
  maxLength?: number
  autoComplete?: string
  name?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
}

interface SelectProps extends Common {
  label?: string
  options: string[]
  value?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
  containerStyle?: CSSProperties
}

interface CheckboxProps extends Common {
  label?: string
  description?: string
  checked?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

interface RadioProps extends Common {
  name: string
  label: string
  description?: string
  icon?: string
  card?: boolean
  checked?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

interface SwitchProps extends Common {
  label?: string
  description?: string
  checked?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

interface TabItem {
  value: string
  label: string
  count?: number
}
interface TabsProps extends Common {
  items: TabItem[]
  value: string
  onChange?: (v: string) => void
}

interface StepperProps extends Common {
  steps: string[]
  current: number
}

interface DialogProps extends Common {
  open: boolean
  onClose?: () => void
  title?: string
  description?: string
  footer?: ReactNode
  dir?: string
}

interface ToastProps extends Common {
  tone?: Tone
  title: string
  description?: string
  onClose?: () => void
}

interface TooltipProps extends Common {
  content: ReactNode
}
interface TagProps extends Common {
  tone?: Tone
}

export interface MashuraUI {
  Button: React.FC<ButtonProps>
  IconButton: React.FC<IconButtonProps>
  Icon: React.FC<IconProps>
  Badge: React.FC<BadgeProps>
  Card: React.FC<CardProps>
  Tag: React.FC<TagProps>
  Input: React.FC<InputProps>
  Select: React.FC<SelectProps>
  Checkbox: React.FC<CheckboxProps>
  Radio: React.FC<RadioProps>
  Switch: React.FC<SwitchProps>
  Tabs: React.FC<TabsProps>
  Stepper: React.FC<StepperProps>
  Dialog: React.FC<DialogProps>
  Toast: React.FC<ToastProps>
  Tooltip: React.FC<TooltipProps>
}

declare global {
  interface Window {
    MashuraUI: MashuraUI
    MashuraDesignSystem_7a44c3: MashuraUI
  }
}

export {}
