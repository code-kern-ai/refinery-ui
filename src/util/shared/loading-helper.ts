const DEFAULT_SIZE = 'sm'
const DEFAULT_COLOR = 'yellow'

export function prepareSize(size: string | undefined): string {
  const finalSize = size ?? DEFAULT_SIZE
  switch (finalSize) {
    case 'xs':
      return 'h-4 w-4'
    case 'sm':
      return 'h-6 w-6'
    case 'md':
      return 'h-8 w-8 '
    case 'lg':
      return 'h-10 w-10'
    case 'xl':
      return 'h-12 w-12'
    case 'custom-sm':
      return 'h-5 w-5'
  }
}

export function prepareColorClasses(color: string | undefined): string {
  const finalColor = color ?? DEFAULT_COLOR
  return `bg-${finalColor}-200 fill-${finalColor}-900 text-${finalColor}-700`
}
