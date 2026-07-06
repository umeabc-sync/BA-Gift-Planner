// Helper to parse binding value and modifiers into configuration options
function parseBinding(binding) {
  const value = binding.value
  let content = ''
  let position = 'top'
  let maxWidth = ''
  let customClass = ''

  if (typeof value === 'object' && value !== null) {
    content = value.content || ''
    position = value.position || 'top'
    maxWidth = value.maxWidth || ''
    customClass = value.class || ''
  } else {
    content = value || ''
  }

  // Modifiers take precedence (e.g. v-tooltip.bottom)
  if (binding.modifiers) {
    if (binding.modifiers.bottom) position = 'bottom'
    else if (binding.modifiers.left) position = 'left'
    else if (binding.modifiers.right) position = 'right'
    else if (binding.modifiers.top) position = 'top'
  }

  return { content, position, maxWidth, customClass }
}

// Tooltip manager singleton
class TooltipManager {
  constructor() {
    this.tooltips = new Set()
    this.currentTooltip = null
    this.currentElement = null
    this.hideTimer = null
    this.globalListenersAdded = false
  }

  addTooltip(tooltip) {
    this.tooltips.add(tooltip)
    this.ensureGlobalListeners()
  }

  removeTooltip(tooltip) {
    this.tooltips.delete(tooltip)
    if (this.currentTooltip === tooltip.element) {
      this.hideCurrentTooltip()
    }
    if (this.tooltips.size === 0) {
      this.removeGlobalListeners()
    }
  }

  ensureGlobalListeners() {
    if (!this.globalListenersAdded) {
      document.addEventListener('click', this.handleGlobalClick.bind(this), true)
      document.addEventListener('touchstart', this.handleGlobalTouchStart.bind(this), {
        passive: true,
        capture: true,
      })
      document.addEventListener('scroll', this.handleGlobalScroll.bind(this), {
        passive: true,
        capture: true,
      })
      document.addEventListener('resize', this.handleGlobalResize.bind(this))
      this.globalListenersAdded = true
    }
  }

  removeGlobalListeners() {
    if (this.globalListenersAdded) {
      document.removeEventListener('click', this.handleGlobalClick.bind(this), true)
      document.removeEventListener('touchstart', this.handleGlobalTouchStart.bind(this), true)
      document.removeEventListener('scroll', this.handleGlobalScroll.bind(this), true)
      document.removeEventListener('resize', this.handleGlobalResize.bind(this))
      this.globalListenersAdded = false
    }
  }

  handleGlobalClick(e) {
    if (this.currentTooltip) {
      const tooltip = this.findTooltipByElement(this.currentElement)
      if (tooltip && tooltip.element !== e.target && !tooltip.element.contains(e.target)) {
        this.hideCurrentTooltip()
      }
    }
  }

  handleGlobalTouchStart(e) {
    if (this.currentTooltip) {
      const tooltip = this.findTooltipByElement(this.currentElement)
      if (tooltip && tooltip.element !== e.target && !tooltip.element.contains(e.target)) {
        this.hideCurrentTooltip()
      }
    }
  }

  handleGlobalScroll() {
    if (this.currentTooltip && this.currentElement) {
      const tooltip = this.findTooltipByElement(this.currentElement)
      if (tooltip) {
        this.positionTooltip(tooltip.tooltipEl, tooltip.element, tooltip.config.position, tooltip.config.offset)

        // Hide if the target element is scrolled out of the viewport
        const rect = tooltip.element.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
          this.hideCurrentTooltip()
        }
        return
      }
    }
    this.hideCurrentTooltip()
  }

  handleGlobalResize() {
    this.hideCurrentTooltip()
  }

  findTooltipByElement(element) {
    for (const tooltip of this.tooltips) {
      if (tooltip.element === element) {
        return tooltip
      }
    }
    return null
  }

  showTooltip(tooltip, e) {
    if (!tooltip.config.content) return

    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    if (this.currentTooltip && this.currentTooltip !== tooltip.tooltipEl) {
      this.currentTooltip.style.opacity = '0'
      this.currentTooltip.style.display = 'none'
    }

    this.currentTooltip = tooltip.tooltipEl
    this.currentTooltip._isHiding = false // Mark as not hiding
    this.currentElement = tooltip.element

    this.positionTooltip(tooltip.tooltipEl, tooltip.element, tooltip.config.position)
    tooltip.tooltipEl.style.display = 'block'

    requestAnimationFrame(() => {
      tooltip.tooltipEl.style.opacity = '1'
    })

    // Auto-hide for touch devices
    if (e.type === 'touchstart') {
      this.hideTimer = setTimeout(() => {
        this.hideCurrentTooltip()
      }, 2000)
    }
  }

  hideCurrentTooltip() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    if (this.currentTooltip) {
      const tooltipToHide = this.currentTooltip
      tooltipToHide._isHiding = true // Mark as hiding
      tooltipToHide.style.opacity = '0'
      tooltipToHide.addEventListener(
        'transitionend',
        (e) => {
          if (e.propertyName === 'opacity' && tooltipToHide._isHiding) {
            tooltipToHide.style.display = 'none'
          }
        },
        { once: true }
      )
      this.currentTooltip = null
      this.currentElement = null
    }
  }

  positionTooltip(tooltipEl, targetEl, position = 'top') {
    const targetRect = targetEl.getBoundingClientRect()
    const scrollX = window.scrollX || document.documentElement.scrollLeft
    const scrollY = window.scrollY || document.documentElement.scrollTop

    let left = 0
    let top = 0
    let transform = ''

    switch (position) {
      case 'bottom':
        left = targetRect.left + scrollX + targetRect.width / 2
        top = targetRect.bottom + scrollY + 10
        transform = 'translate(-50%, 0)'
        break
      case 'left':
        left = targetRect.left + scrollX - 10
        top = targetRect.top + scrollY + targetRect.height / 2
        transform = 'translate(-100%, -50%)'
        break
      case 'right':
        left = targetRect.right + scrollX + 10
        top = targetRect.top + scrollY + targetRect.height / 2
        transform = 'translate(0, -50%)'
        break
      case 'top':
      default:
        left = targetRect.left + scrollX + targetRect.width / 2
        top = targetRect.top + scrollY - 10
        transform = 'translate(-50%, -100%)'
        break
    }

    tooltipEl.style.left = `${left}px`
    tooltipEl.style.top = `${top}px`
    tooltipEl.style.transform = transform
  }
}

// Create singleton instance
const tooltipManager = new TooltipManager()

export default {
  mounted(el, binding) {
    const config = parseBinding(binding)
    const tooltipEl = document.createElement('div')
    const argClass = binding.arg || ''
    const configClass = config.customClass || ''
    tooltipEl.className = `tooltip ${argClass} ${configClass} tooltip-${config.position}`.trim()
    tooltipEl.innerHTML = config.content
    tooltipEl.style.cssText = `
      position: absolute;
      display: none;
      z-index: 2000;
      pointer-events: none;
      max-width: ${config.maxWidth || '300px'};
      word-wrap: break-word;
      white-space: normal;
      opacity: 0;
    `
    document.body.appendChild(tooltipEl)

    const tooltip = {
      element: el,
      tooltipEl,
      binding,
      config,
    }

    // Store tooltip reference
    el._tooltip = tooltip

    const showTooltip = (e) => {
      tooltipManager.showTooltip(tooltip, e)
    }

    const hideTooltip = () => {
      tooltipManager.hideCurrentTooltip()
    }

    const handleTouchEnd = () => {
      setTimeout(() => {
        if (tooltipManager.currentTooltip === tooltipEl) {
          tooltipManager.hideCurrentTooltip()
        }
      }, 100)
    }

    // Only add local event listeners
    el.addEventListener('mouseenter', showTooltip)
    el.addEventListener('mouseleave', hideTooltip)
    el.addEventListener('touchstart', showTooltip, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Store event handlers for cleanup
    tooltip.showTooltip = showTooltip
    tooltip.hideTooltip = hideTooltip
    tooltip.handleTouchEnd = handleTouchEnd

    // Register tooltip with manager
    tooltipManager.addTooltip(tooltip)
  },

  updated(el, binding) {
    if (el._tooltip) {
      const config = parseBinding(binding)
      el._tooltip.config = config
      el._tooltip.tooltipEl.innerHTML = config.content
      el._tooltip.binding = binding

      const argClass = binding.arg || ''
      const configClass = config.customClass || ''
      el._tooltip.tooltipEl.className = `tooltip ${argClass} ${configClass} tooltip-${config.position}`.trim()

      if (config.maxWidth) {
        el._tooltip.tooltipEl.style.maxWidth = config.maxWidth
      } else {
        el._tooltip.tooltipEl.style.maxWidth = '300px'
      }

      if (tooltipManager.currentTooltip === el._tooltip.tooltipEl && el._tooltip.tooltipEl.style.display === 'block') {
        tooltipManager.positionTooltip(el._tooltip.tooltipEl, el, config.position)
      }
    }
  },

  unmounted(el) {
    if (el._tooltip) {
      const tooltip = el._tooltip

      // Remove local event listeners
      el.removeEventListener('mouseenter', tooltip.showTooltip)
      el.removeEventListener('mouseleave', tooltip.hideTooltip)
      el.removeEventListener('touchstart', tooltip.showTooltip)
      el.removeEventListener('touchend', tooltip.handleTouchEnd)

      // Remove tooltip from DOM
      if (tooltip.tooltipEl.parentNode) {
        document.body.removeChild(tooltip.tooltipEl)
      }

      // Unregister from manager
      tooltipManager.removeTooltip(tooltip)

      delete el._tooltip
    }
  },
}
