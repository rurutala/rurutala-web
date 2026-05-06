export function AppLink({ href, navigate, children, ...props }) {
  const handleClick = (event) => {
    props.onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

    if (isModifiedClick || href.startsWith('#') || href.startsWith('http')) {
      return
    }

    event.preventDefault()
    navigate(href)
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  )
}
