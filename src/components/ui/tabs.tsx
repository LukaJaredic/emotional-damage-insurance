import { useState, type ComponentProps, type ReactNode } from 'react'

import {
  Tabs as TabsPrimitive,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/shadcn/tabs'
import { cn } from '@/lib/utils'

export type TabItem = {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

type TabsProps = Omit<
  ComponentProps<typeof TabsPrimitive>,
  'children' | 'defaultValue' | 'value'
> & {
  items: readonly TabItem[]
  defaultValue: string
  storageKey?: string
  ariaLabel: string
  listVariant?: ComponentProps<typeof TabsList>['variant']
  tabsListClassName?: string
  tabsContentClassName?: string
}

function getFallbackValue(items: readonly TabItem[], defaultValue: string) {
  const defaultItem = items.find(
    (item) => item.value === defaultValue && !item.disabled,
  )

  return defaultItem?.value ?? items.find((item) => !item.disabled)?.value ?? ''
}

function getStoredValue(
  items: readonly TabItem[],
  defaultValue: string,
  storageKey?: string,
) {
  const fallbackValue = getFallbackValue(items, defaultValue)

  if (!storageKey) {
    return fallbackValue
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey)
    const storedItem = items.find(
      (item) => item.value === storedValue && !item.disabled,
    )

    return storedItem?.value ?? fallbackValue
  } catch {
    return fallbackValue
  }
}

/**
 * Renders a Tabs component with the provided tab items and configuration.
 *
 * @param items - The list of tab items to display.
 * @param defaultValue - The default value of the selected tab.
 * @param storageKey - The key to use for storing the selected tab in localStorage - if no key is provided, the selected tab will not be stored.
 * @param ariaLabel - The aria-label for the tabs list.
 * @param listVariant - The variant of the tabs list.
 * @param tabsListClassName - Additional class names for the tabs list.
 * @param tabsContentClassName - Additional class names for the tabs content.
 * @param className - Additional class names for the tabs component.
 * @param onValueChange - Callback function when the selected tab value changes.
 * @returns The rendered Tabs component.
 */
function Tabs({
  items,
  defaultValue,
  storageKey,
  ariaLabel,
  listVariant,
  tabsListClassName,
  tabsContentClassName,
  className,
  onValueChange,
  ...props
}: TabsProps) {
  const [value, setValue] = useState(() =>
    getStoredValue(items, defaultValue, storageKey),
  )
  const fallbackValue = getFallbackValue(items, defaultValue)
  const selectedValue = items.some(
    (item) => item.value === value && !item.disabled,
  )
    ? value
    : fallbackValue

  function handleValueChange(nextValue: string) {
    setValue(nextValue)

    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, nextValue)
      } catch {
        // Storage may be blocked; tab selection should still work for this render.
      }
    }

    onValueChange?.(nextValue)
  }

  return (
    <TabsPrimitive
      {...props}
      value={selectedValue}
      onValueChange={handleValueChange}
      className={cn('min-w-0', className)}
    >
      <TabsList
        aria-label={ariaLabel}
        variant={listVariant}
        className={cn(
          'max-w-full shrink-0 justify-start overflow-x-auto overflow-y-hidden',
          tabsListClassName,
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="shrink-0"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className={cn('min-w-0', tabsContentClassName)}
        >
          {item.content}
        </TabsContent>
      ))}
    </TabsPrimitive>
  )
}

export default Tabs
