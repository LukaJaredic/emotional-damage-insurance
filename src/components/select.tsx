import {
  type GroupBase,
  type MultiValue,
  type SingleValue,
  default as ReactSelect,
} from 'react-select'

import { cn } from '@/lib/utils'

type SelectOption = {
  label: string
  value: string
}

type BaseSelectProps = {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  inputId?: string
  name?: string
  noOptionsMessage?: string
  isClearable?: boolean
  'aria-invalid'?: boolean
  'aria-label'?: string
}

type SingleSelectProps = BaseSelectProps & {
  isMultiple?: false
  value?: string
  onChange: (value: string) => void
}

type MultipleSelectProps = BaseSelectProps & {
  isMultiple: true
  value?: string[]
  onChange: (value: string[]) => void
}

type SelectProps = SingleSelectProps | MultipleSelectProps

function buildValueObject(
  value: string | string[] | undefined,
  options: SelectOption[],
) {
  if (Array.isArray(value)) {
    return options.filter((option) => value.includes(option.value))
  }

  return options.find((option) => option.value === value) ?? null
}

function buildValueString(
  value: SingleValue<SelectOption> | MultiValue<SelectOption>,
  isMultiple: boolean,
) {
  if (isMultiple) {
    return Array.isArray(value) ? value.map((option) => option.value) : []
  }

  if (!value || Array.isArray(value)) {
    return ''
  }

  return (value as SelectOption).value
}

function Select({
  options,
  value,
  onChange,
  isMultiple = false,
  placeholder,
  disabled = false,
  className,
  inputId,
  name,
  noOptionsMessage = 'No options found',
  isClearable = true,
  'aria-invalid': ariaInvalid = false,
  'aria-label': ariaLabel,
}: SelectProps) {
  const optionalProps = {
    ...(inputId ? { inputId } : {}),
    ...(name ? { name } : {}),
    ...(placeholder ? { placeholder } : {}),
  }

  const selectedValue = buildValueObject(value, options)

  function handleChange(
    nextValue: MultiValue<SelectOption> | SingleValue<SelectOption>,
  ) {
    onChange(buildValueString(nextValue, isMultiple) as never)
  }

  return (
    <ReactSelect<SelectOption, boolean, GroupBase<SelectOption>>
      {...optionalProps}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      isMulti={isMultiple}
      isDisabled={disabled}
      isClearable={isClearable}
      unstyled
      noOptionsMessage={() => noOptionsMessage}
      className={cn('w-full', className)}
      classNames={{
        control: ({ isFocused, menuIsOpen, isDisabled }) =>
          cn(
            'border-input dark:bg-input/30 min-h-9 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm',
            isFocused && 'border-ring ring-ring/50 ring-3',
            menuIsOpen && 'border-ring ring-ring/50 ring-3',
            ariaInvalid &&
              'border-destructive ring-destructive/20 ring-3 dark:border-destructive/50',
            isDisabled && 'pointer-events-none cursor-not-allowed opacity-50',
          ),
        valueContainer: () => 'gap-1 p-0',
        placeholder: () => 'text-muted-foreground m-0',
        input: () => 'text-foreground m-0 p-0',
        singleValue: () => 'text-foreground m-0',
        multiValue: () =>
          'bg-primary text-foreground rounded-sm px-1.5 py-0.5 text-xs',
        multiValueLabel: () => 'p-0 text-inherit',
        multiValueRemove: () =>
          'text-muted-foreground ml-1 rounded-xs hover:bg-transparent hover:text-foreground',
        indicatorsContainer: () => 'gap-1',
        clearIndicator: () =>
          'text-muted-foreground hover:text-foreground p-0 transition-colors',
        dropdownIndicator: () =>
          'text-muted-foreground hover:text-foreground p-0 transition-colors',
        indicatorSeparator: () => 'hidden',
        menu: () =>
          'bg-popover text-popover-foreground border-border mt-1 overflow-hidden rounded-md border shadow-md',
        menuList: () => 'p-1',
        option: ({ isFocused, isSelected, isDisabled }) =>
          cn(
            'rounded-sm px-2 py-1.5 text-sm',
            isFocused && 'bg-accent text-accent-foreground',
            isSelected && 'bg-primary text-primary-foreground',
            isDisabled && 'text-muted-foreground opacity-50',
          ),
        noOptionsMessage: () => 'text-muted-foreground px-2 py-1.5 text-sm',
      }}
    />
  )
}

export default Select
export type { SelectOption, SelectProps }
