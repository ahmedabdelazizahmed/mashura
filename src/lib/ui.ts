// Typed re-exports of the design-system UMD bundle (window.MashuraUI).
// The bundle loads via a classic <script> in index.html; module scripts run after,
// so window.MashuraUI is always ready when this file resolves.

import type { MashuraUI } from '@/types/mashura-ui'

const ui = window.MashuraUI as MashuraUI
if (!ui) {
  throw new Error(
    'MashuraUI bundle not loaded. Check that index.html loads _ds_bundle.js before src/main.tsx.'
  )
}

export const Button = ui.Button
export const IconButton = ui.IconButton
export const Icon = ui.Icon
export const Badge = ui.Badge
export const Card = ui.Card
export const Tag = ui.Tag
export const Input = ui.Input
export const Select = ui.Select
export const Checkbox = ui.Checkbox
export const Radio = ui.Radio
export const Switch = ui.Switch
export const Tabs = ui.Tabs
export const Stepper = ui.Stepper
export const Dialog = ui.Dialog
export const Toast = ui.Toast
export const Tooltip = ui.Tooltip
