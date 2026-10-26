/* @ds-bundle: {"format":4,"namespace":"MashuraDesignSystem_7a44c3","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Stepper","sourcePath":"components/navigation/Stepper.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"0c6385fbdec2","components/core/Button.jsx":"53cb5af777cd","components/core/Card.jsx":"0e929459bbd3","components/core/Icon.jsx":"1fab9c7d4fd7","components/core/IconButton.jsx":"311f5bf0b1e4","components/core/Tag.jsx":"3fe16d229af4","components/feedback/Dialog.jsx":"574c038a6b98","components/feedback/Toast.jsx":"b51c8acbd177","components/feedback/Tooltip.jsx":"4125a6aa9c81","components/forms/Checkbox.jsx":"7dd7783d79b0","components/forms/Input.jsx":"685acbad3d3f","components/forms/Radio.jsx":"92e3cc0caefa","components/forms/Select.jsx":"805d01bafa8a","components/forms/Switch.jsx":"cd23fc7700c1","components/navigation/Stepper.jsx":"ce5a102203f1","components/navigation/Tabs.jsx":"62926a3f0822","ui_kits/booking_app/AppShell.jsx":"d5a5fb8a0bcf","ui_kits/booking_app/BookingFlow.jsx":"b6b1dd33dc9f","ui_kits/booking_app/Bookings.jsx":"0f32f64dbee1","ui_kits/marketing_site/ConsultationCatalogue.jsx":"b4163d370b31","ui_kits/marketing_site/Hero.jsx":"3a16909ce009","ui_kits/marketing_site/HowItWorks.jsx":"e4e8b6386f38","ui_kits/marketing_site/Reassurance.jsx":"ad4bc53ccc52","ui_kits/marketing_site/SiteHeader.jsx":"402a9b68750e","ui_kits/marketing_site/Wordmark.jsx":"03b3deae354f"},"inlinedExternals":[],"unexposedExports":[{"name":"mashuraIconPaths","sourcePath":"components/core/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.MashuraDesignSystem_7a44c3 = window.MashuraDesignSystem_7a44c3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  as: Tag = 'div',
  interactive = false,
  selected = false,
  padding = 'md',
  elevation = 'xs',
  style,
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  const pads = {
    none: 0,
    sm: 'var(--space-6)',
    md: 'var(--space-7)',
    lg: 'var(--space-8)'
  };
  const shadows = {
    none: 'none',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)'
  };
  const raised = interactive && hovered;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onClick: onClick,
    onMouseEnter: interactive ? () => setHovered(true) : undefined,
    onMouseLeave: interactive ? () => setHovered(false) : undefined,
    style: {
      background: selected ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
      border: selected ? 'var(--border-strong) solid var(--pine-800)' : '1px solid ' + (raised ? 'var(--border-default)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-lg)',
      padding: pads[padding] ?? pads.md,
      boxShadow: raised ? 'var(--shadow-md)' : shadows[elevation],
      cursor: interactive ? 'pointer' : undefined,
      textAlign: 'inherit',
      width: '100%',
      display: 'block',
      transition: 'box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Lucide glyph paths (24x24, outline, currentColor). Stroke defaults to 1.75 per
   the Mashura ICONOGRAPHY rules. Add glyphs here rather than inlining SVG at call sites. */
const mashuraIconPaths = {
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="m12 5 7 7-7 7"/><path d="M5 12h14"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'
};
function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  color,
  mirror = false,
  style,
  ...rest
}) {
  const d = mashuraIconPaths[name];
  if (!d) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color || 'currentColor',
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    style: {
      flex: '0 0 auto',
      display: 'block',
      transform: mirror ? 'scaleX(-1)' : undefined,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: d
    }
  }, rest));
}
Object.assign(__ds_scope, { mashuraIconPaths, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-muted)'
  },
  brand: {
    bg: 'var(--surface-brand-soft)',
    fg: 'var(--pine-700)'
  },
  accent: {
    bg: 'var(--surface-accent-soft)',
    fg: 'var(--saffron-700)'
  },
  success: {
    bg: 'var(--status-success-bg)',
    fg: 'var(--status-success-fg)'
  },
  warning: {
    bg: 'var(--status-warning-bg)',
    fg: 'var(--status-warning-fg)'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    fg: 'var(--status-danger-fg)'
  },
  info: {
    bg: 'var(--status-info-bg)',
    fg: 'var(--status-info-fg)'
  },
  video: {
    bg: 'var(--mode-video-bg)',
    fg: 'var(--mode-video-fg)'
  },
  audio: {
    bg: 'var(--mode-audio-bg)',
    fg: 'var(--mode-audio-fg)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  icon,
  dot = false,
  solid = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      height: 26,
      padding: '0 var(--space-5)',
      borderRadius: 'var(--radius-pill)',
      background: solid ? t.fg : t.bg,
      color: solid ? 'var(--sand-000)' : t.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-caption)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: solid ? 'var(--sand-000)' : t.fg
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    fontSize: 'var(--size-body-sm)',
    padding: '0 var(--space-6)',
    height: 36,
    gap: 'var(--space-3)',
    icon: 16
  },
  md: {
    fontSize: 'var(--size-body)',
    padding: '0 var(--space-7)',
    height: 44,
    gap: 'var(--space-4)',
    icon: 18
  },
  lg: {
    fontSize: 'var(--size-body-lg)',
    padding: '0 var(--space-9)',
    height: 54,
    gap: 'var(--space-4)',
    icon: 20
  }
};
function variantStyle(variant, hovered, pressed) {
  switch (variant) {
    case 'accent':
      return {
        background: hovered ? 'var(--action-accent-bg-hover)' : 'var(--action-accent-bg)',
        color: 'var(--action-accent-fg)',
        border: '1px solid transparent',
        boxShadow: pressed ? 'none' : 'var(--shadow-inset-top), var(--shadow-xs)'
      };
    case 'secondary':
      return {
        background: 'var(--action-secondary-bg)',
        color: 'var(--action-secondary-fg)',
        border: '1px solid ' + (hovered ? 'var(--border-default)' : 'var(--border-subtle)'),
        boxShadow: hovered ? 'var(--shadow-sm)' : 'var(--shadow-xs)'
      };
    case 'ghost':
      return {
        background: hovered ? 'var(--action-ghost-bg-hover)' : 'transparent',
        color: 'var(--action-ghost-fg)',
        border: '1px solid transparent',
        boxShadow: 'none'
      };
    case 'danger':
      return {
        background: hovered ? '#9A3527' : 'var(--red-600)',
        color: 'var(--sand-000)',
        border: '1px solid transparent',
        boxShadow: pressed ? 'none' : 'var(--shadow-xs)'
      };
    case 'inverse':
      return {
        background: hovered ? 'var(--sand-100)' : 'var(--sand-000)',
        color: 'var(--pine-900)',
        border: '1px solid transparent',
        boxShadow: 'var(--shadow-xs)'
      };
    default:
      return {
        background: hovered ? 'var(--action-primary-bg-hover)' : 'var(--action-primary-bg)',
        color: 'var(--action-primary-fg)',
        border: '1px solid transparent',
        boxShadow: pressed ? 'none' : 'var(--shadow-inset-top), var(--shadow-xs)'
      };
  }
}
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  style,
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const off = disabled || loading;
  const v = off ? {
    background: 'var(--action-disabled-bg)',
    color: 'var(--action-disabled-fg)',
    border: '1px solid transparent',
    boxShadow: 'none'
  } : variantStyle(variant, hovered, pressed);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: off,
    onClick: off ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      fontSize: s.fontSize,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      borderRadius: 'var(--radius-md)',
      cursor: off ? 'not-allowed' : 'pointer',
      transform: pressed && !off ? 'scale(var(--press-scale))' : 'none',
      transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), transform var(--duration-instant) var(--ease-out)',
      ...v,
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader",
    size: s.icon,
    style: {
      animation: 'mashura-spin 700ms linear infinite'
    }
  }) : icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), /*#__PURE__*/React.createElement("span", null, children), iconEnd && !loading && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconEnd,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    box: 32,
    icon: 16
  },
  md: {
    box: 40,
    icon: 18
  },
  lg: {
    box: 48,
    icon: 20
  }
};
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  mirror = false,
  style,
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  let look;
  if (disabled) look = {
    background: 'transparent',
    color: 'var(--action-disabled-fg)',
    border: '1px solid transparent'
  };else if (variant === 'solid') look = {
    background: hovered ? 'var(--action-primary-bg-hover)' : 'var(--action-primary-bg)',
    color: 'var(--action-primary-fg)',
    border: '1px solid transparent'
  };else if (variant === 'outline') look = {
    background: 'var(--surface-card)',
    color: 'var(--pine-800)',
    border: '1px solid ' + (hovered ? 'var(--border-default)' : 'var(--border-subtle)')
  };else look = {
    background: hovered ? 'var(--action-ghost-bg-hover)' : 'transparent',
    color: hovered ? 'var(--pine-800)' : 'var(--text-muted)',
    border: '1px solid transparent'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: s.box,
      height: s.box,
      padding: 0,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transform: pressed && !disabled ? 'scale(var(--press-scale))' : 'none',
      transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-instant) var(--ease-out)',
      ...look,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon,
    mirror: mirror
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  selected = false,
  icon,
  onRemove,
  onClick,
  disabled = false,
  style,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  const clickable = !!onClick && !disabled;
  return /*#__PURE__*/React.createElement("span", _extends({
    role: clickable ? 'button' : undefined,
    tabIndex: clickable ? 0 : undefined,
    onClick: clickable ? onClick : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      height: 34,
      padding: '0 var(--space-6)',
      borderRadius: 'var(--radius-pill)',
      background: selected ? 'var(--pine-800)' : clickable && hovered ? 'var(--pine-050)' : 'var(--surface-card)',
      color: selected ? 'var(--sand-050)' : disabled ? 'var(--action-disabled-fg)' : 'var(--text-body)',
      border: '1px solid ' + (selected ? 'var(--pine-800)' : 'var(--border-subtle)'),
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : clickable ? 'pointer' : 'default',
      transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  }), children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    role: "button",
    "aria-label": "\u0625\u0632\u0627\u0644\u0629",
    style: {
      display: 'inline-flex',
      cursor: 'pointer',
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = false,
  title,
  description,
  children,
  footer,
  onClose,
  width = 480,
  dir,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      background: 'var(--overlay-ink)',
      animation: 'mashura-fade var(--duration-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    dir: dir,
    onClick: e => e.stopPropagation(),
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      padding: 'var(--space-9)',
      animation: 'mashura-rise var(--duration-slow) var(--ease-out)',
      ...style
    }
  }, rest), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "\u0625\u063A\u0644\u0627\u0642",
    size: "sm",
    style: {
      position: 'absolute',
      top: 'var(--space-6)',
      insetInlineEnd: 'var(--space-6)'
    },
    onClick: onClose
  }), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h3)',
      marginBottom: description ? 'var(--space-4)' : 'var(--space-7)',
      paddingInlineEnd: 'var(--space-10)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)',
      marginBottom: 'var(--space-7)'
    }
  }, description), children, footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-9)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  success: {
    icon: 'check-circle',
    fg: 'var(--status-success-fg)',
    bg: 'var(--status-success-bg)'
  },
  danger: {
    icon: 'alert-triangle',
    fg: 'var(--status-danger-fg)',
    bg: 'var(--status-danger-bg)'
  },
  warning: {
    icon: 'alert-triangle',
    fg: 'var(--status-warning-fg)',
    bg: 'var(--status-warning-bg)'
  },
  info: {
    icon: 'info',
    fg: 'var(--status-info-fg)',
    bg: 'var(--status-info-bg)'
  }
};
function Toast({
  tone = 'success',
  title,
  description,
  action,
  onClose,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-5)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      padding: 'var(--space-6)',
      minWidth: 320,
      maxWidth: 420,
      animation: 'mashura-rise var(--duration-slow) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-pill)',
      background: t.bg,
      color: t.fg
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      paddingTop: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, title), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-muted)',
      lineHeight: 1.6
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)'
    }
  }, action)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "\u0625\u063A\u0644\u0627\u0642",
    size: "sm",
    onClick: onClose,
    style: {
      marginTop: -2
    }
  }));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  label,
  children,
  placement = 'top',
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      insetInlineStart: '50%',
      transform: 'translateX(50%)',
      marginBottom: 'var(--space-4)'
    },
    bottom: {
      top: '100%',
      insetInlineStart: '50%',
      transform: 'translateX(50%)',
      marginTop: 'var(--space-4)'
    },
    start: {
      insetInlineEnd: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginInlineEnd: 'var(--space-4)'
    },
    end: {
      insetInlineStart: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginInlineStart: 'var(--space-4)'
    }
  }[placement] || {};
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    }
  }, rest), children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 40,
      ...pos,
      background: 'var(--surface-inverse-deep)',
      color: 'var(--sand-050)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--size-overline)',
      lineHeight: 1.5,
      padding: '6px var(--space-5)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      animation: 'mashura-fade var(--duration-fast) var(--ease-out)'
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const uid = id || React.useMemo(() => 'cb-' + Math.random().toString(36).slice(2, 7), []);
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      display: 'flex',
      alignItems: description ? 'flex-start' : 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: 20,
      height: 20,
      marginTop: description ? 3 : 0,
      borderRadius: 'var(--radius-sm)',
      background: disabled ? 'var(--action-disabled-bg)' : checked ? 'var(--pine-800)' : 'var(--surface-card)',
      border: '1px solid ' + (checked && !disabled ? 'var(--pine-800)' : 'var(--border-default)'),
      boxShadow: focused ? 'var(--ring-focus)' : 'none',
      transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--sand-000)",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: disabled ? 'var(--text-subtle)' : 'var(--text-body)',
      lineHeight: 1.5
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  multiline = false,
  rows = 4,
  id,
  disabled = false,
  required = false,
  style,
  containerStyle,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const uid = id || React.useMemo(() => 'in-' + Math.random().toString(36).slice(2, 7), []);
  const Field = multiline ? 'textarea' : 'input';
  const borderColor = error ? 'var(--status-danger-fg)' : focused ? 'var(--pine-800)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      width: '100%',
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-danger-fg)',
      marginInlineStart: 4
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: multiline ? 'flex-start' : 'center',
      gap: 'var(--space-4)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: (focused || error ? 'var(--border-strong)' : '1px') + ' solid ' + borderColor,
      borderRadius: 'var(--radius-md)',
      padding: multiline ? 'var(--space-5) var(--space-6)' : '0 var(--space-6)',
      minHeight: multiline ? undefined : 44,
      boxShadow: focused ? 'var(--ring-focus)' : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: "var(--text-subtle)",
    style: {
      marginTop: multiline ? 4 : 0
    }
  }), /*#__PURE__*/React.createElement(Field, _extends({
    id: uid,
    rows: multiline ? rows : undefined,
    disabled: disabled,
    required: required,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      font: 'inherit',
      fontSize: 'var(--size-body)',
      color: 'var(--text-body)',
      lineHeight: multiline ? 'var(--leading-body)' : 1.4,
      resize: multiline ? 'vertical' : undefined,
      padding: multiline ? 0 : '10px 0',
      ...style
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-subtle)',
      fontFamily: 'var(--font-mono)'
    }
  }, suffix)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontSize: 'var(--size-caption)',
      color: error ? 'var(--status-danger-fg)' : 'var(--text-subtle)'
    }
  }, error && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert-triangle",
    size: 14
  }), error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  description,
  icon,
  value,
  checked = false,
  onChange,
  name,
  disabled = false,
  card = false,
  id,
  style,
  ...rest
}) {
  const uid = id || React.useMemo(() => 'rd-' + Math.random().toString(36).slice(2, 7), []);
  const [hovered, setHovered] = React.useState(false);
  const dot = /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: disabled ? 'var(--action-disabled-bg)' : 'var(--surface-card)',
      border: (checked ? 'var(--border-strong)' : '1px') + ' solid ' + (checked && !disabled ? 'var(--pine-800)' : 'var(--border-default)'),
      transition: 'border-color var(--duration-fast) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: disabled ? 'var(--action-disabled-fg)' : 'var(--pine-800)'
    }
  }));
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'flex',
      alignItems: description || card ? 'flex-start' : 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...(card ? {
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        background: checked ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
        border: (checked ? 'var(--border-strong)' : '1px') + ' solid ' + (checked ? 'var(--pine-800)' : hovered ? 'var(--border-default)' : 'var(--border-subtle)'),
        boxShadow: hovered && !checked ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        transition: 'all var(--duration-fast) var(--ease-out)'
      } : null),
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), dot, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20,
    color: checked ? 'var(--pine-700)' : 'var(--text-subtle)',
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body)',
      fontWeight: card ? 'var(--weight-semibold)' : 'var(--weight-regular)',
      color: disabled ? 'var(--text-subtle)' : 'var(--text-title)',
      lineHeight: 1.5
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)',
      lineHeight: 1.6
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  id,
  disabled = false,
  style,
  containerStyle,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const uid = id || React.useMemo(() => 'sel-' + Math.random().toString(36).slice(2, 7), []);
  const borderColor = error ? 'var(--status-danger-fg)' : focused ? 'var(--pine-800)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      width: '100%',
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: (focused || error ? 'var(--border-strong)' : '1px') + ' solid ' + borderColor,
      borderRadius: 'var(--radius-md)',
      height: 44,
      boxShadow: focused ? 'var(--ring-focus)' : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: uid,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      height: '100%',
      font: 'inherit',
      fontSize: 'var(--size-body)',
      color: 'var(--text-body)',
      padding: '0 var(--space-6)',
      paddingInlineEnd: 'var(--space-10)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const text = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value,
      disabled: o.disabled
    }, text);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      insetInlineEnd: 'var(--space-6)',
      pointerEvents: 'none'
    }
  })), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: error ? 'var(--status-danger-fg)' : 'var(--text-subtle)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const uid = id || React.useMemo(() => 'sw-' + Math.random().toString(36).slice(2, 7), []);
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-7)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-medium)',
      color: disabled ? 'var(--text-subtle)' : 'var(--text-title)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)'
    }
  }, description)), /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      flex: '0 0 auto',
      width: 44,
      height: 26,
      borderRadius: 'var(--radius-pill)',
      background: disabled ? 'var(--action-disabled-bg)' : checked ? 'var(--pine-800)' : 'var(--sand-400)',
      boxShadow: focused ? 'var(--ring-focus)' : 'none',
      transition: 'background var(--duration-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      insetInlineStart: checked ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'var(--sand-000)',
      boxShadow: 'var(--shadow-xs)',
      transition: 'inset-inline-start var(--duration-base) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stepper({
  steps = [],
  current = 0,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 'var(--space-5)' : 'var(--space-6)',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      width: '100%',
      ...style
    }
  }, rest), steps.map((s, i) => {
    const label = typeof s === 'string' ? s : s.label;
    const done = i < current;
    const on = i === current;
    return /*#__PURE__*/React.createElement("li", {
      key: label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flex: i === steps.length - 1 ? '0 0 auto' : 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: done ? 'var(--pine-800)' : on ? 'var(--surface-accent-soft)' : 'var(--surface-sunken)',
        border: on ? 'var(--border-strong) solid var(--saffron-500)' : '1px solid transparent',
        color: done ? 'var(--sand-000)' : on ? 'var(--saffron-700)' : 'var(--text-subtle)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--size-overline)',
        fontWeight: 'var(--weight-semibold)',
        transition: 'background var(--duration-base) var(--ease-out)'
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 14,
      strokeWidth: 2.5
    }) : i + 1), !compact && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--size-body-sm)',
        whiteSpace: 'nowrap',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: on ? 'var(--text-title)' : 'var(--text-subtle)'
      }
    }, label), i < steps.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        minWidth: 'var(--space-6)',
        background: done ? 'var(--pine-400)' : 'var(--border-subtle)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline',
  fullWidth = false,
  style,
  ...rest
}) {
  const active = value ?? (items[0] && items[0].value);
  const seg = variant === 'segmented';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: seg ? 'var(--space-2)' : 'var(--space-8)',
      background: seg ? 'var(--surface-sunken)' : 'transparent',
      borderRadius: seg ? 'var(--radius-md)' : 0,
      padding: seg ? 'var(--space-2)' : 0,
      borderBottom: seg ? 'none' : '1px solid var(--border-subtle)',
      width: fullWidth ? '100%' : 'fit-content',
      ...style
    }
  }, rest), items.map(it => {
    const on = it.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": on,
      type: "button",
      onClick: () => onChange && onChange(it.value),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        flex: fullWidth ? 1 : '0 0 auto',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body-sm)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        color: on ? seg ? 'var(--pine-900)' : 'var(--pine-800)' : 'var(--text-muted)',
        background: seg ? on ? 'var(--surface-card)' : 'transparent' : 'transparent',
        borderRadius: seg ? 'var(--radius-sm)' : 0,
        boxShadow: seg && on ? 'var(--shadow-xs)' : 'none',
        padding: seg ? '9px var(--space-7)' : 'var(--space-4) 0 var(--space-5)',
        borderBottom: seg ? 'none' : 'var(--border-strong) solid ' + (on ? 'var(--pine-800)' : 'transparent'),
        marginBottom: seg ? 0 : -1,
        transition: 'color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)'
      }
    }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16
    }), it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--size-overline)',
        background: on ? 'var(--surface-brand-soft)' : 'var(--surface-sunken)',
        color: on ? 'var(--pine-700)' : 'var(--text-subtle)',
        borderRadius: 'var(--radius-pill)',
        padding: '2px 7px',
        lineHeight: 1.4
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/booking_app/AppShell.jsx
try { (() => {
const {
  Button,
  IconButton,
  Icon,
  Badge
} = window.MashuraUI;
function AppShell({
  view,
  onNav,
  children,
  user
}) {
  const nav = [{
    id: 'book',
    label: 'احجز مشورة',
    icon: 'plus'
  }, {
    id: 'bookings',
    label: 'حجوزاتي',
    icon: 'calendar',
    count: 2
  }, {
    id: 'receipts',
    label: 'الفواتير',
    icon: 'receipt'
  }, {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'bell'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '244px 1fr',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--surface-inverse)',
      padding: 'var(--space-8) var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      paddingInlineStart: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-black)',
      fontSize: 24,
      color: 'var(--sand-050)'
    }
  }, "\u0645\u0634\u0648\u0631\u0629"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      letterSpacing: '.12em',
      color: 'var(--pine-200)'
    }
  }, "MASHURA")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, nav.map(n => {
    const on = view === n.id || n.id === 'book' && ['type', 'mode', 'slot', 'pay', 'done'].includes(view);
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      type: "button",
      onClick: () => onNav(n.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'start',
        padding: '10px var(--space-5)',
        borderRadius: 'var(--radius-md)',
        background: on ? 'rgba(255,255,255,.09)' : 'transparent',
        color: on ? 'var(--sand-050)' : 'var(--pine-200)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-body-sm)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        transition: 'background var(--duration-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        background: 'rgba(255,255,255,.12)',
        borderRadius: 999,
        padding: '2px 7px'
      }
    }, n.count));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 'var(--space-7)',
      borderTop: '1px solid var(--border-inverse)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'var(--pine-600)',
      color: 'var(--sand-050)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 14
    }
  }, user.initial), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--size-body-sm)',
      color: 'var(--sand-050)'
    }
  }, user.name), /*#__PURE__*/React.createElement(IconButton, {
    icon: "log-out",
    label: "\u062E\u0631\u0648\u062C",
    size: "sm",
    style: {
      color: 'var(--pine-200)'
    }
  }))), /*#__PURE__*/React.createElement("main", {
    id: "mashura-scroll",
    style: {
      background: 'var(--surface-page)',
      overflow: 'auto'
    }
  }, children));
}
function PageHead({
  title,
  sub,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-8)',
      marginBottom: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--size-h1)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)'
    }
  }, sub)), action);
}
Object.assign(window, {
  AppShell,
  PageHead
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/booking_app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/booking_app/BookingFlow.jsx
try { (() => {
const {
  Card,
  Badge,
  Button,
  Icon,
  Radio,
  Input,
  Select,
  Checkbox,
  Stepper,
  Tag
} = window.MashuraUI;
if (typeof document !== 'undefined' && !document.getElementById('mashura-booking-responsive')) {
  const s = document.createElement('style');
  s.id = 'mashura-booking-responsive';
  s.textContent = '@media (max-width:1100px){.mashura-booking-grid{grid-template-columns:1fr !important}}';
  document.head.appendChild(s);
}
const TYPES = [{
  id: 'launch',
  title: 'تأسيس مشروع جديد',
  minutes: 45,
  price: 750,
  blurb: 'من الفكرة لخطة تنفيذ: السوق، أول عميل، والخطوة الجاية.'
}, {
  id: 'pricing',
  title: 'تسعير وربحية',
  minutes: 30,
  price: 500,
  blurb: 'تراجع أرقامك وتخرج بسعر تقدر تدافع عنه.'
}, {
  id: 'growth',
  title: 'نمو ومبيعات',
  minutes: 45,
  price: 750,
  blurb: 'قنوات البيع، دورة الإغلاق، وإيه اللي يستحق وقتك.'
}, {
  id: 'review',
  title: 'مراجعة سريعة',
  minutes: 30,
  price: 400,
  blurb: 'سؤال واحد محدد، رد واضح، من غير مقدمات.'
}];
const DAYS = [{
  d: 'الأحد',
  n: '٧',
  slots: ['١١:٠٠ ص', '٢:٠٠ م']
}, {
  d: 'الاثنين',
  n: '٨',
  slots: []
}, {
  d: 'الثلاثاء',
  n: '٩',
  slots: ['١٠:٣٠ ص', '١٢:٠٠ م', '٦:٣٠ م']
}, {
  d: 'الأربع',
  n: '١٠',
  slots: ['٩:٠٠ ص', '٦:٣٠ م']
}, {
  d: 'الخميس',
  n: '١١',
  slots: ['١١:٠٠ ص', '١:٣٠ م', '٤:٠٠ م', '٧:٠٠ م']
}];
const STEPS = ['نوع المشورة', 'فيديو أو صوت', 'الميعاد', 'الدفع'];
function SummaryRail({
  draft,
  onSubmit,
  submitting,
  canSubmit,
  cta
}) {
  const t = draft.type;
  const rows = [['نوع المشورة', t ? t.title : '—'], ['الطريقة', draft.mode ? draft.mode === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية' : '—'], ['الميعاد', draft.slot ? draft.day + ' ' + draft.slot : '—'], ['المدة', t ? t.minutes + ' دقيقة' : '—']];
  return /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      position: 'sticky',
      top: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-overline)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--saffron-700)'
    }
  }, "\u0645\u0644\u062E\u0635 \u0627\u0644\u062D\u062C\u0632"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-7)'
    }
  }, rows.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-6)',
      fontSize: 'var(--size-body-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: v === '—' ? 'var(--text-subtle)' : 'var(--text-title)',
      fontWeight: 'var(--weight-medium)',
      textAlign: 'end'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: 'var(--space-7) 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-h3)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, t ? t.price : 0, " \u062C.\u0645")), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    fullWidth: true,
    icon: "arrow-left",
    disabled: !canSubmit,
    loading: submitting,
    style: {
      marginTop: 'var(--space-8)'
    },
    onClick: onSubmit
  }, cta), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)',
      marginTop: 'var(--space-6)'
    }
  }, "\u0627\u0644\u0625\u0644\u063A\u0627\u0621 \u0642\u0628\u0644 \u0662\u0664 \u0633\u0627\u0639\u0629 \u0628\u064A\u0631\u062C\u0651\u0639 \u0627\u0644\u0645\u0628\u0644\u063A \u0643\u0627\u0645\u0644. \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0628\u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0642\u0627\u0647\u0631\u0629."));
}
function BookingFlow({
  step,
  draft,
  set,
  next,
  back,
  submitting,
  onConfirm
}) {
  const idx = ['type', 'mode', 'slot', 'pay'].indexOf(step);
  const canNext = step === 'type' ? !!draft.type : step === 'mode' ? !!draft.mode : step === 'slot' ? !!draft.slot : draft.terms;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-11) var(--space-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1060,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    current: idx,
    steps: STEPS,
    style: {
      marginBottom: 'var(--space-10)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) 320px',
      gap: 'var(--space-9)',
      alignItems: 'start'
    },
    className: "mashura-booking-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, step === 'type' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h2)'
    }
  }, "\u0625\u064A\u0647 \u0627\u0644\u0644\u064A \u0645\u062D\u062A\u0627\u062C \u0645\u0634\u0648\u0631\u0629 \u0641\u064A\u0647\u061F"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)'
    }
  }, "\u0643\u0644 \u0646\u0648\u0639 \u0644\u0647 \u0645\u062F\u0629 \u0648\u0633\u0639\u0631 \u0648\u0627\u0636\u062D\u064A\u0646."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-8)'
    }
  }, TYPES.map(t => /*#__PURE__*/React.createElement(Card, {
    key: t.id,
    interactive: true,
    selected: draft.type && draft.type.id === t.id,
    padding: "lg",
    onClick: () => set({
      type: t
    })
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--size-h3)'
    }
  }, t.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)'
    }
  }, t.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-6)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-body)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), t.minutes, " \u062F\u0642\u064A\u0642\u0629"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-semibold)'
    }
  }, t.price, " \u062C.\u0645")))))), step === 'mode' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h2)'
    }
  }, "\u062A\u062D\u0628 \u0646\u062A\u0643\u0644\u0645 \u0625\u0632\u0627\u064A\u061F"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)'
    }
  }, "\u062A\u0642\u062F\u0631 \u062A\u063A\u064A\u0651\u0631\u0647\u0627 \u0644\u062D\u062F \u0666 \u0633\u0627\u0639\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u0645\u064A\u0639\u0627\u062F."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    card: true,
    name: "mode",
    icon: "video",
    label: "\u0645\u0643\u0627\u0644\u0645\u0629 \u0641\u064A\u062F\u064A\u0648",
    description: "\u0623\u0648\u0636\u062D \u0644\u0648 \u0641\u064A\u0647 \u0634\u0627\u0634\u0629 \u0623\u0648 \u0645\u0644\u0641\u0627\u062A \u062A\u062A\u0641\u0631\u062C \u0639\u0644\u064A\u0647\u0627",
    checked: draft.mode === 'video',
    onChange: () => set({
      mode: 'video'
    })
  }), /*#__PURE__*/React.createElement(Radio, {
    card: true,
    name: "mode",
    icon: "phone",
    label: "\u0645\u0643\u0627\u0644\u0645\u0629 \u0635\u0648\u062A\u064A\u0629",
    description: "\u0623\u0633\u0631\u0639 \u0648\u0623\u062E\u0641 \u0639\u0644\u0649 \u0627\u0644\u0646\u062A",
    checked: draft.mode === 'audio',
    onChange: () => set({
      mode: 'audio'
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-9)',
      maxWidth: 'var(--width-form)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0645\u0634\u0648\u0631\u0629",
    multiline: true,
    rows: 3,
    placeholder: "\u0633\u0637\u0631\u064A\u0646 \u064A\u0648\u0641\u0651\u0631\u0648\u0627 \u0648\u0642\u062A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629",
    value: draft.topic,
    onChange: e => set({
      topic: e.target.value
    }),
    hint: "\u0627\u062E\u062A\u064A\u0627\u0631\u064A\u060C \u0628\u0633 \u0628\u064A\u0633\u0627\u0639\u062F \u0623\u062D\u0645\u062F \u064A\u062D\u0636\u0651\u0631."
  }))), step === 'slot' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h2)'
    }
  }, "\u062D\u062F\u0651\u062F \u0627\u0644\u0645\u064A\u0639\u0627\u062F \u0627\u0644\u0645\u0646\u0627\u0633\u0628"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['القاهرة (GMT+2)', 'الرياض (GMT+3)', 'دبي (GMT+4)'],
    containerStyle: {
      maxWidth: 220
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)'
    }
  }, "\u0633\u0628\u062A\u0645\u0628\u0631 \u0662\u0660\u0662\u0666")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-8)'
    }
  }, DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.d
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      paddingBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-muted)'
    }
  }, d.d), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-h3)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, d.n)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, d.slots.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)',
      textAlign: 'center',
      padding: 'var(--space-5) 0'
    }
  }, "\u0645\u0641\u064A\u0634"), d.slots.map(s => {
    const on = draft.slot === s && draft.day === d.d;
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      type: "button",
      onClick: () => set({
        slot: s,
        day: d.d
      }),
      style: {
        padding: '10px 0',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--size-body-sm)',
        background: on ? 'var(--saffron-500)' : 'var(--surface-card)',
        color: on ? 'var(--pine-950)' : 'var(--text-body)',
        border: (on ? 'var(--border-strong)' : '1px') + ' solid ' + (on ? 'var(--saffron-600)' : 'var(--border-subtle)'),
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        transition: 'all var(--duration-fast) var(--ease-out)'
      }
    }, s);
  })))))), step === 'pay' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h2)'
    }
  }, "\u0627\u062F\u0641\u0639 \u0648\u0623\u0643\u0651\u062F"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-form)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    card: true,
    name: "pm",
    icon: "credit-card",
    label: "\u0643\u0627\u0631\u062A \u0628\u0646\u0643\u064A",
    checked: draft.pm !== 'wallet',
    onChange: () => set({
      pm: 'card'
    })
  }), /*#__PURE__*/React.createElement(Radio, {
    card: true,
    name: "pm",
    icon: "phone",
    label: "\u0645\u062D\u0641\u0638\u0629 \u0645\u0648\u0628\u0627\u064A\u0644",
    checked: draft.pm === 'wallet',
    onChange: () => set({
      pm: 'wallet'
    })
  })), /*#__PURE__*/React.createElement(Input, {
    label: "\u0631\u0642\u0645 \u0627\u0644\u0643\u0627\u0631\u062A",
    placeholder: "\u0664\u0665\u0664\u0665 \u0660\u0660\u0660\u0660 \u0660\u0660\u0660\u0660 \u0660\u0660\u0660\u0660",
    icon: "credit-card"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621",
    placeholder: "\u0661\u0662/\u0662\u0668"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "CVV",
    placeholder: "\u0661\u0662\u0663"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "\u0627\u0644\u0625\u064A\u0645\u064A\u0644",
    defaultValue: "you@example.com",
    hint: "\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0648\u0627\u0644\u0644\u064A\u0646\u0643 \u0628\u064A\u0648\u0635\u0644\u0648\u0627 \u0647\u0646\u0627."
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0645\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u062C\u0632 \u0648\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0625\u0644\u063A\u0627\u0621",
    checked: !!draft.terms,
    onChange: e => set({
      terms: e.target.checked
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-9)'
    }
  }, idx > 0 && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconEnd: "chevron-right",
    onClick: back
  }, "\u0631\u062C\u0648\u0639"), step !== 'pay' && /*#__PURE__*/React.createElement(Button, {
    disabled: !canNext,
    onClick: next,
    icon: "arrow-left"
  }, "\u0643\u0645\u0651\u0644"))), /*#__PURE__*/React.createElement(SummaryRail, {
    draft: draft,
    submitting: submitting,
    canSubmit: step === 'pay' && !!draft.terms,
    cta: step === 'pay' ? 'ادفع وأكّد' : 'كمّل الخطوات',
    onSubmit: onConfirm
  }))));
}
Object.assign(window, {
  BookingFlow,
  SummaryRail,
  TYPES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/booking_app/BookingFlow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/booking_app/Bookings.jsx
try { (() => {
const {
  Card,
  Badge,
  Button,
  Icon,
  IconButton,
  Tabs,
  Dialog,
  Switch,
  Select
} = window.MashuraUI;
const UPCOMING = [{
  id: 1,
  title: 'تسعير وربحية',
  mode: 'video',
  day: 'الأربع ١٠ سبتمبر',
  time: '٦:٣٠ م',
  minutes: 30,
  price: 500,
  state: 'مؤكّد'
}, {
  id: 2,
  title: 'مراجعة سريعة',
  mode: 'audio',
  day: 'الخميس ١٨ سبتمبر',
  time: '١١:٠٠ ص',
  minutes: 30,
  price: 400,
  state: 'مؤكّد'
}];
const PAST = [{
  id: 3,
  title: 'تأسيس مشروع جديد',
  mode: 'video',
  day: 'الثلاثاء ١٢ أغسطس',
  time: '١:٣٠ م',
  minutes: 45,
  price: 750,
  state: 'خلصت'
}, {
  id: 4,
  title: 'نمو ومبيعات',
  mode: 'video',
  day: 'الأحد ٢٧ يوليو',
  time: '٧:٠٠ م',
  minutes: 45,
  price: 750,
  state: 'خلصت'
}, {
  id: 5,
  title: 'مراجعة سريعة',
  mode: 'audio',
  day: 'الخميس ١٠ يوليو',
  time: '١٠:٣٠ ص',
  minutes: 30,
  price: 400,
  state: 'ملغي'
}];
function BookingRow({
  b,
  onCancel
}) {
  const past = b.state !== 'مؤكّد';
  return /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-md)',
      background: b.mode === 'video' ? 'var(--mode-video-bg)' : 'var(--mode-audio-bg)',
      color: b.mode === 'video' ? 'var(--mode-video-fg)' : 'var(--mode-audio-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: b.mode === 'video' ? 'video' : 'phone',
    size: 21
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--size-body-lg)',
      color: 'var(--text-title)'
    }
  }, b.title), /*#__PURE__*/React.createElement(Badge, {
    tone: b.state === 'مؤكّد' ? 'success' : b.state === 'ملغي' ? 'danger' : 'neutral',
    dot: b.state === 'مؤكّد'
  }, b.state)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-7)',
      marginTop: 'var(--space-4)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 15
  }), b.day), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), b.time, " \xB7 ", b.minutes, " \u062F\u0642\u064A\u0642\u0629"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, b.price, " \u062C.\u0645"))), past ? /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: "receipt"
  }, "\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: b.mode === 'video' ? 'video' : 'phone'
  }, "\u0627\u062F\u062E\u0644 \u0627\u0644\u062C\u0644\u0633\u0629"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "\u0623\u062C\u0651\u0644"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    label: "\u0623\u0644\u063A\u0650 \u0627\u0644\u062D\u062C\u0632",
    variant: "outline",
    size: "sm",
    onClick: () => onCancel(b)
  })));
}
function BookingsView({
  onBook
}) {
  const [tab, setTab] = React.useState('next');
  const [cancel, setCancel] = React.useState(null);
  const list = tab === 'next' ? UPCOMING : PAST;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1060,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "\u062D\u062C\u0648\u0632\u0627\u062A\u064A",
    sub: "\u0643\u0644 \u062D\u062C\u0648\u0632\u0627\u062A\u0643 \u0645\u0646\u0638\u0651\u0645\u0629 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F.",
    action: /*#__PURE__*/React.createElement(Button, {
      icon: "plus",
      onClick: onBook
    }, "\u0627\u062D\u062C\u0632 \u0645\u0634\u0648\u0631\u0629")
  }), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: 'next',
      label: 'قادمة',
      count: UPCOMING.length
    }, {
      value: 'past',
      label: 'فايتة',
      count: PAST.length
    }],
    style: {
      marginBottom: 'var(--space-8)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, list.map(b => /*#__PURE__*/React.createElement(BookingRow, {
    key: b.id,
    b: b,
    onCancel: setCancel
  }))), /*#__PURE__*/React.createElement(Dialog, {
    open: !!cancel,
    dir: "rtl",
    onClose: () => setCancel(null),
    title: "\u062A\u0644\u063A\u064A \u0627\u0644\u062D\u062C\u0632\u061F",
    description: cancel ? cancel.title + ' — ' + cancel.day + ' ' + cancel.time + '. الإلغاء قبل ٢٤ ساعة بيرجّع المبلغ كامل.' : '',
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      onClick: () => setCancel(null)
    }, "\u0623\u0643\u0651\u062F \u0627\u0644\u0625\u0644\u063A\u0627\u0621"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setCancel(null)
    }, "\u0633\u064A\u0628\u0647"))
  })));
}
function ReceiptsView() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1060,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    sub: "\u0643\u0644 \u0645\u062F\u0641\u0648\u0639\u0627\u062A\u0643\u060C \u0648\u0643\u0644 \u0641\u0627\u062A\u0648\u0631\u0629 \u062A\u0642\u062F\u0631 \u062A\u0646\u0632\u0651\u0644\u0647\u0627."
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, PAST.concat(UPCOMING).map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-7)',
      padding: 'var(--space-7)',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-caption)',
      color: 'var(--text-subtle)',
      width: 92
    }
  }, "MSH-", 1200 + b.id), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-title)',
      fontWeight: 'var(--weight-medium)'
    }
  }, b.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, b.day), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)',
      width: 88,
      textAlign: 'end'
    }
  }, b.price, " \u062C.\u0645"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: "receipt"
  }, "\u0646\u0632\u0651\u0644"))))));
}
function SettingsView() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(true);
  const [c, setC] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
    sub: "\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0644\u064A \u0628\u062A\u0634\u0648\u0641 \u0628\u064A\u0647 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F."
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "\u062A\u0646\u0628\u064A\u0647 \u0648\u0627\u062A\u0633\u0627\u0628 \u0642\u0628\u0644 \u0627\u0644\u0645\u064A\u0639\u0627\u062F",
    description: "\u0631\u0633\u0627\u0644\u0629 \u0642\u0628\u0644 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0633\u0627\u0639\u0629",
    checked: a,
    onChange: e => setA(e.target.checked)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "\u062A\u0623\u0643\u064A\u062F \u0639\u0644\u0649 \u0627\u0644\u0625\u064A\u0645\u064A\u0644",
    description: "\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0648\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0627\u0644\u0644\u064A\u0646\u0643",
    checked: b,
    onChange: e => setB(e.target.checked)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "\u0645\u0648\u0627\u0639\u064A\u062F \u0623\u062D\u0645\u062F \u0627\u0644\u062C\u062F\u064A\u062F\u0629",
    description: "\u0646\u0642\u0648\u0644 \u0644\u0643 \u0623\u0648\u0644 \u0645\u0627 \u0645\u0648\u0627\u0639\u064A\u062F \u062C\u062F\u064A\u062F\u0629 \u062A\u0641\u062A\u062D",
    checked: c,
    onChange: e => setC(e.target.checked)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629",
    options: ['القاهرة (GMT+2)', 'الرياض (GMT+3)', 'دبي (GMT+4)'],
    containerStyle: {
      maxWidth: 260
    }
  }))));
}
function ConfirmationView({
  draft,
  onDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-13) var(--space-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--status-success-bg)',
      color: 'var(--status-success-fg)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 32
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--size-h1)',
      marginTop: 'var(--space-8)'
    }
  }, "\u0627\u0644\u062D\u062C\u0632 \u0627\u062A\u0623\u0643\u0651\u062F"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 'var(--space-5)'
    }
  }, "\u0628\u0639\u062A\u0646\u0627 \u0644\u0643 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0648\u0627\u0644\u0644\u064A\u0646\u0643 \u0639\u0644\u0649 \u0627\u0644\u0625\u064A\u0645\u064A\u0644 \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628."), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginTop: 'var(--space-9)',
      textAlign: 'start'
    }
  }, [['نوع المشورة', draft.type ? draft.type.title : '—'], ['الطريقة', draft.mode === 'audio' ? 'مكالمة صوتية' : 'مكالمة فيديو'], ['الميعاد', (draft.day || '') + ' ' + (draft.slot || '')], ['الإجمالي', (draft.type ? draft.type.price : 0) + ' ج.م']].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-6)',
      padding: 'var(--space-5) 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)',
      fontFamily: k === 'الإجمالي' ? 'var(--font-mono)' : undefined
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      justifyContent: 'center',
      marginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    icon: "calendar",
    onClick: onDone
  }, "\u0634\u0648\u0641 \u062D\u062C\u0648\u0632\u0627\u062A\u064A"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "receipt"
  }, "\u0646\u0632\u0651\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629"))));
}
Object.assign(window, {
  BookingsView,
  ReceiptsView,
  SettingsView,
  ConfirmationView,
  BookingRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/booking_app/Bookings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/ConsultationCatalogue.jsx
try { (() => {
const {
  Card,
  Badge,
  Tag,
  Button,
  Icon
} = window.MashuraUI;
const consultationTypes = [{
  id: 'launch',
  title: 'تأسيس مشروع جديد',
  topic: 'تأسيس',
  minutes: 45,
  price: 750,
  blurb: 'من الفكرة لخطة تنفيذ: السوق، أول عميل، والخطوة الجاية.',
  modes: ['video', 'audio']
}, {
  id: 'pricing',
  title: 'تسعير وربحية',
  topic: 'تسعير',
  minutes: 30,
  price: 500,
  blurb: 'تراجع أرقامك وتخرج بسعر تقدر تدافع عنه.',
  modes: ['video', 'audio']
}, {
  id: 'growth',
  title: 'نمو ومبيعات',
  topic: 'نمو',
  minutes: 45,
  price: 750,
  blurb: 'قنوات البيع، دورة الإغلاق، وإيه اللي يستحق وقتك.',
  modes: ['video']
}, {
  id: 'ops',
  title: 'تشغيل وفريق',
  topic: 'تشغيل',
  minutes: 45,
  price: 800,
  blurb: 'تنظيم الشغل اليومي وتوزيع الأدوار على الفريق.',
  modes: ['video', 'audio']
}, {
  id: 'review',
  title: 'مراجعة سريعة',
  topic: 'مراجعة',
  minutes: 30,
  price: 400,
  blurb: 'سؤال واحد محدد، رد واضح، من غير مقدمات.',
  modes: ['audio']
}, {
  id: 'followup',
  title: 'متابعة بعد استشارة',
  topic: 'متابعة',
  minutes: 30,
  price: 350,
  blurb: 'للعملاء اللي حجزوا قبل كده ومحتاجين نكمّل.',
  modes: ['video', 'audio']
}];
function ConsultationCatalogue({
  onBook
}) {
  const topics = ['الكل', ...new Set(consultationTypes.map(t => t.topic))];
  const [topic, setTopic] = React.useState('الكل');
  const list = topic === 'الكل' ? consultationTypes : consultationTypes.filter(t => t.topic === topic);
  return /*#__PURE__*/React.createElement("section", {
    id: "types",
    style: {
      padding: 'var(--space-13) var(--gutter-page-lg)',
      background: 'var(--surface-raised)',
      borderBlock: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-overline)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--saffron-700)'
    }
  }, "\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h1)',
      marginTop: 'var(--space-4)'
    }
  }, "\u0627\u062E\u062A\u0627\u0631 \u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0644\u064A \u064A\u0646\u0627\u0633\u0628 \u0633\u0624\u0627\u0644\u0643"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 'var(--space-5)',
      maxWidth: '52ch'
    }
  }, "\u0643\u0644 \u0646\u0648\u0639 \u0644\u0647 \u0645\u062F\u0629 \u0648\u0633\u0639\u0631 \u0648\u0627\u0636\u062D\u064A\u0646. \u0627\u0644\u062F\u0641\u0639 \u0623\u0648\u0646\u0644\u0627\u064A\u0646\u060C \u0648\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0641\u0648\u0631\u064A."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      flexWrap: 'wrap',
      margin: 'var(--space-8) 0 var(--space-8)'
    }
  }, topics.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: topic === t,
    onClick: () => setTopic(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
      gap: 'var(--space-6)'
    }
  }, list.map(t => /*#__PURE__*/React.createElement(Card, {
    key: t.id,
    interactive: true,
    padding: "lg",
    onClick: () => onBook(t),
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-6)'
    }
  }, t.modes.map(m => /*#__PURE__*/React.createElement(Badge, {
    key: m,
    tone: m,
    icon: m === 'video' ? 'video' : 'phone'
  }, m === 'video' ? 'فيديو' : 'صوت'))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--size-h3)'
    }
  }, t.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)',
      flex: 1
    }
  }, t.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'var(--space-7)',
      paddingTop: 'var(--space-6)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), t.minutes, " \u062F\u0642\u064A\u0642\u0629"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-body-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, t.price, " \u062C.\u0645"))))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconEnd: "arrow-left",
    style: {
      marginTop: 'var(--space-8)'
    }
  }, "\u0634\u0648\u0641 \u0643\u0644 \u0627\u0644\u0623\u0646\u0648\u0627\u0639")));
}
Object.assign(window, {
  ConsultationCatalogue,
  consultationTypes
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/ConsultationCatalogue.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Hero.jsx
try { (() => {
const {
  Button,
  Icon,
  Badge
} = window.MashuraUI;
function Hero({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-14) var(--gutter-page-lg) var(--space-13)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(280px,.85fr)',
      gap: 'var(--space-12)',
      alignItems: 'center'
    },
    className: "mashura-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    dot: true
  }, "\u0623\u062D\u0645\u062F \u0641\u0627\u0636\u064A \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--size-display-1)',
      fontWeight: 'var(--weight-black)',
      lineHeight: 'var(--leading-display)',
      marginTop: 'var(--space-6)'
    }
  }, "\u0627\u062D\u062C\u0632 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0628\u064A\u0632\u0646\u0633", /*#__PURE__*/React.createElement("br", null), "\u0648\u0645\u0634\u0627\u0631\u064A\u0639 \u0641\u064A \u062F\u0642\u064A\u0642\u0629"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-lg)',
      color: 'var(--text-muted)',
      maxWidth: '46ch',
      marginTop: 'var(--space-7)'
    }
  }, "\u0627\u062E\u062A\u0627\u0631 \u0641\u064A\u062F\u064A\u0648 \u0623\u0648 \u0645\u0643\u0627\u0644\u0645\u0629 \u0635\u0648\u062A\u064A\u0629\u060C \u062D\u062F\u0651\u062F \u0627\u0644\u0645\u064A\u0639\u0627\u062F \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u060C \u0648\u0627\u062F\u0641\u0639 \u0623\u0648\u0646\u0644\u0627\u064A\u0646. \u0645\u0634\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0645\u0646 \u063A\u064A\u0631 \u0644\u0641\u0651 \u0648\u062F\u0648\u0631\u0627\u0646."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "calendar",
    onClick: onBook
  }, "\u0627\u062D\u062C\u0632 \u0645\u0634\u0648\u0631\u0629"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary"
  }, "\u0634\u0648\u0641 \u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-8)',
      marginTop: 'var(--space-9)'
    }
  }, [['shield-check', 'دفع أونلاين آمن'], ['clock', 'إلغاء مجاني قبل ٢٤ ساعة'], ['receipt', 'فاتورة على الإيميل']].map(([ic, t]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 17,
    color: "var(--pine-600)"
  }), t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-md)',
      padding: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 62,
      height: 62,
      borderRadius: '50%',
      background: 'var(--pine-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 24,
      color: 'var(--pine-800)'
    }
  }, "\u0623"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--size-h3)',
      color: 'var(--text-title)'
    }
  }, "\u0623\u062D\u0645\u062F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0628\u064A\u0632\u0646\u0633 \u0648\u0645\u0634\u0627\u0631\u064A\u0639"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: 'var(--space-7) 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, [['calendar', 'أقرب ميعاد', 'الأربع ٦:٣٠ م'], ['clock', 'مدة الجلسة', '٣٠ أو ٤٥ دقيقة'], ['credit-card', 'السعر يبدأ من', '٥٠٠ ج.م']].map(([ic, k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 17
  }), k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, v)))), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    fullWidth: true,
    size: "lg",
    icon: "arrow-left",
    style: {
      marginTop: 'var(--space-8)'
    },
    onClick: onBook
  }, "\u0627\u0628\u062F\u0623 \u0627\u0644\u062D\u062C\u0632"))));
}
Object.assign(window, {
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/HowItWorks.jsx
try { (() => {
const {
  Icon,
  Button
} = window.MashuraUI;
const {
  Wordmark
} = window;
const STEPS = [{
  icon: 'briefcase',
  t: 'اختار نوع المشورة',
  d: 'كل نوع بمدته وسعره، من غير مفاوضات.'
}, {
  icon: 'video',
  t: 'فيديو أو صوت',
  d: 'اللي يناسب نتك وطريقتك.'
}, {
  icon: 'calendar',
  t: 'حدّد الميعاد',
  d: 'المواعيد المتاحة أمامك بتوقيتك.'
}, {
  icon: 'credit-card',
  t: 'ادفع وأكّد',
  d: 'التأكيد واللينك على الإيميل فورًا.'
}];
function HowItWorks({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-inverse)',
      color: 'var(--text-on-inverse)',
      padding: 'var(--space-13) var(--gutter-page-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-9)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-overline)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--saffron-400)'
    }
  }, "\u0625\u0632\u0627\u064A \u0628\u062A\u0634\u062A\u063A\u0644"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h1)',
      color: 'var(--sand-050)',
      marginTop: 'var(--space-4)'
    }
  }, "\u0623\u0631\u0628\u0639 \u062E\u0637\u0648\u0627\u062A\u060C \u0645\u0641\u064A\u0634 \u0644\u0641\u0651 \u0648\u062F\u0648\u0631\u0627\u0646")), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    icon: "calendar",
    onClick: onBook
  }, "\u0627\u062D\u062C\u0632 \u0645\u0634\u0648\u0631\u0629")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
      gap: 'var(--space-8)',
      marginTop: 'var(--space-11)'
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.t,
    style: {
      paddingTop: 'var(--space-7)',
      borderTop: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-overline)',
      color: 'var(--saffron-400)'
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 22,
    color: "var(--pine-200)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--size-h3)',
      color: 'var(--sand-050)',
      marginTop: 'var(--space-6)'
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-on-inverse-muted)',
      marginTop: 'var(--space-4)'
    }
  }, s.d))))));
}
function SiteFooter() {
  const cols = [['المنصة', ['الاستشارات', 'إزاي بتشتغل', 'الأسعار', 'حجوزاتي']], ['عن أحمد', ['نبذة', 'مجالات الخبرة', 'تجارب العملاء']], ['مساعدة', ['أسئلة شائعة', 'سياسة الإلغاء', 'كلّمنا']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-inverse-deep)',
      color: 'var(--text-on-inverse-muted)',
      padding: 'var(--space-12) var(--gutter-page-lg) var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
      gap: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wordmark, {
    inverse: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      marginTop: 'var(--space-6)',
      maxWidth: '34ch'
    }
  }, "\u0645\u0634\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0641\u064A \u0627\u0644\u0628\u064A\u0632\u0646\u0633 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639. \u062A\u062D\u062C\u0632\u060C \u062A\u062F\u0641\u0639\u060C \u0648\u062A\u062A\u0643\u0644\u0645 \u2014 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F.")), cols.map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--sand-050)'
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-6)'
    }
  }, items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--pine-200)',
      borderBottom: 'none'
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-11)',
      paddingTop: 'var(--space-7)',
      borderTop: '1px solid var(--border-inverse)',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--size-caption)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 \u0662\u0660\u0662\u0666 \u0645\u0634\u0648\u0631\u0629"), /*#__PURE__*/React.createElement("span", null, "\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0628\u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0642\u0627\u0647\u0631\u0629"))));
}
Object.assign(window, {
  HowItWorks,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/HowItWorks.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Reassurance.jsx
try { (() => {
const {
  Card,
  Icon,
  Button,
  Badge
} = window.MashuraUI;
const QUOTES = [{
  t: 'سألت سؤال واحد وخرجت بخطة تسعير كاملة. نص ساعة وفّرت عليّ شهر تجريب.',
  n: 'منة ح.',
  r: 'مؤسسة براند ملابس'
}, {
  t: 'أحمد ما لفّش. قال لي إيه اللي مش شغال وإيه البديل، وبعتلي ملخص بعد المكالمة.',
  n: 'كريم ع.',
  r: 'شريك في ورشة تصنيع'
}, {
  t: 'حجزت مكالمة صوتية من الموبايل في دقيقة، والتأكيد وصل فورًا.',
  n: 'سارة م.',
  r: 'مديرة عمليات'
}];
const FAQ = [['أقدر ألغي أو أأجّل؟', 'أي وقت قبل ٢٤ ساعة من الميعاد — الإلغاء بيرجّع المبلغ كامل، والتأجيل مجاني.'], ['بتقبلوا إيه في الدفع؟', 'كارت بنكي أو محفظة موبايل. الفاتورة توصل على الإيميل بعد التأكيد.'], ['الجلسة بتكون على إيه؟', 'لينك مكالمة يوصلك مع التأكيد. لو اخترت صوت، بنتكلم على المكالمة العادية.'], ['لو الميعاد اتحجز وأنا بدفع؟', 'بنقول لك على طول ونرجّعك لاختيار ميعاد تاني — مفيش خصم من المبلغ.']];
function Reassurance() {
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-13) var(--gutter-page-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h1)'
    }
  }, "\u0646\u0627\u0633 \u062D\u062C\u0632\u062A \u0642\u0628\u0644\u0643"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-8)'
    }
  }, QUOTES.map(q => /*#__PURE__*/React.createElement(Card, {
    key: q.n,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      color: 'var(--saffron-500)'
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement(Icon, {
    key: i,
    name: "star",
    size: 15
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body)',
      color: 'var(--text-body)',
      marginTop: 'var(--space-6)'
    }
  }, q.t), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-7)',
      fontSize: 'var(--size-body-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-title)'
    }
  }, q.n), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, q.r))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,.8fr) minmax(0,1.2fr)',
      gap: 'var(--space-12)',
      marginTop: 'var(--space-13)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-overline)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--saffron-700)'
    }
  }, "\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-h2)',
      marginTop: 'var(--space-4)'
    }
  }, "\u0627\u0644\u0644\u064A \u0628\u064A\u062A\u0633\u0623\u0644 \u0643\u062A\u064A\u0631"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-5)'
    }
  }, "\u0644\u0648 \u0633\u0624\u0627\u0644\u0643 \u0645\u0634 \u0647\u0646\u0627\u060C \u0627\u0628\u0639\u062A \u0644\u0646\u0627 \u0648\u0647\u0646\u0631\u062F \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u064A\u0648\u0645."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "message-circle",
    style: {
      marginTop: 'var(--space-7)'
    }
  }, "\u0643\u0644\u0651\u0645\u0646\u0627")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, FAQ.map(([q, a], i) => /*#__PURE__*/React.createElement(Card, {
    key: q,
    padding: "none",
    interactive: true,
    as: "div",
    onClick: () => setOpen(open === i ? -1 : i)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--size-body)',
      color: 'var(--text-title)'
    }
  }, q), /*#__PURE__*/React.createElement(Icon, {
    name: open === i ? 'x' : 'plus',
    size: 17,
    color: "var(--text-subtle)"
  })), open === i && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-5)'
    }
  }, a))))))));
}
function ClosingBand({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 var(--gutter-page-lg) var(--space-13)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto',
      background: 'var(--surface-accent-soft)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-12)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    dot: true
  }, "\u0645\u0648\u0627\u0639\u064A\u062F \u0645\u062A\u0627\u062D\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u062C\u0627\u064A"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-display-2)',
      fontWeight: 'var(--weight-black)',
      marginTop: 'var(--space-6)'
    }
  }, "\u0645\u0634\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0645\u0646 \u063A\u064A\u0631 \u0644\u0641\u0651 \u0648\u062F\u0648\u0631\u0627\u0646"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-lg)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-5)'
    }
  }, "\u0627\u062E\u062A\u0627\u0631 \u0646\u0648\u0639 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0629\u060C \u062D\u062F\u0651\u062F \u0627\u0644\u0645\u064A\u0639\u0627\u062F\u060C \u0648\u0627\u062F\u0641\u0639 \u0623\u0648\u0646\u0644\u0627\u064A\u0646."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "calendar",
    style: {
      marginTop: 'var(--space-8)'
    },
    onClick: onBook
  }, "\u0627\u062D\u062C\u0632 \u0645\u0634\u0648\u0631\u0629")));
}
Object.assign(window, {
  Reassurance,
  ClosingBand
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Reassurance.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/SiteHeader.jsx
try { (() => {
const {
  Button,
  Icon,
  IconButton
} = window.MashuraUI;
const {
  Wordmark
} = window;
function SiteHeader({
  onBook,
  onSignIn
}) {
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const el = document.getElementById('mashura-scroll') || window;
    const onScroll = () => {
      const y = el === window ? window.scrollY : el.scrollTop;
      setStuck(y > 40);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const links = ['الاستشارات', 'إزاي بتشتغل', 'عن أحمد', 'أسئلة شائعة'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: stuck ? 'var(--overlay-frost)' : 'var(--surface-page)',
      backdropFilter: stuck ? 'blur(10px)' : 'none',
      boxShadow: stuck ? 'var(--shadow-sm)' : 'none',
      borderBottom: '1px solid ' + (stuck ? 'transparent' : 'var(--border-subtle)'),
      transition: 'background var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--width-content)',
      margin: '0 auto',
      height: 72,
      padding: '0 var(--gutter-page-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-8)',
      flex: 1
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-muted)',
      borderBottom: 'none'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "globe",
    label: "English",
    size: "sm"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onSignIn
  }, "\u062D\u062C\u0648\u0632\u0627\u062A\u064A"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: "calendar",
    onClick: onBook
  }, "\u0627\u062D\u062C\u0632 \u0645\u0634\u0648\u0631\u0629"))));
}
Object.assign(window, {
  SiteHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Wordmark.jsx
try { (() => {
/* No logo file was supplied with the brand. The wordmark is set in type —
   do not substitute a drawn mark. */
function Wordmark({
  inverse = false,
  size = 26
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 8,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-black)',
      fontSize: size,
      lineHeight: 1,
      color: inverse ? 'var(--sand-050)' : 'var(--pine-900)'
    }
  }, "\u0645\u0634\u0648\u0631\u0629"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: Math.round(size * 0.4),
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      fontWeight: 'var(--weight-semibold)',
      color: inverse ? 'var(--pine-200)' : 'var(--saffron-700)'
    }
  }, "Mashura"));
}
Object.assign(window, {
  Wordmark
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Wordmark.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
