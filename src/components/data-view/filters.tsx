import { useRef } from 'react'
import {
  useForm,
  type FieldValues,
  type DefaultValues,
  Controller,
  type Path,
  type ControllerRenderProps,
  useWatch,
} from 'react-hook-form'

import type { SelectOption } from '../select'
import Select from '../select'
import Button from '../ui/button'
import Input from '../ui/input'
import Label from '../ui/label'

type BaseFilter<T> = {
  name: Path<T>
  label: string
  placeholder: string
}

type TextFilter<T> = BaseFilter<T> & {
  type: 'text'
}

type SelectFilter<T> = BaseFilter<T> & {
  type: 'select'
  isMultiple?: boolean
  options: SelectOption[]
}

type Filter<T> = TextFilter<T> | SelectFilter<T>

type FiltersProps<T> = {
  filters: Filter<T>[]
  defaultValues: DefaultValues<T>
  onChange: (values: T) => void
  debounceTime?: number
}

function Filters<T extends FieldValues>({
  filters,
  defaultValues,
  onChange,
  debounceTime = 300,
}: FiltersProps<T>) {
  const timerRef = useRef<number | null>(null)
  const form = useForm<T>({
    defaultValues,
  })
  const values = useWatch({ control: form.control })

  function handleChange() {
    form.handleSubmit((formValues) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        onChange(formValues)
      }, debounceTime)
    })()
  }

  return (
    <form onChange={handleChange} className="relative z-10">
      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <Controller
            key={filter.name}
            name={filter.name}
            control={form.control}
            render={({ field }) => {
              switch (filter.type) {
                case 'text':
                  return (
                    <TextFilter
                      {...field}
                      label={filter.label}
                      placeholder={filter.placeholder}
                    />
                  )
                case 'select':
                  return (
                    <SelectFilter
                      {...field}
                      onChange={(value) => {
                        field.onChange(value)
                        handleChange()
                      }}
                      label={filter.label}
                      placeholder={filter.placeholder}
                      options={filter.options}
                      isMultiple={filter.isMultiple}
                    />
                  )
              }
            }}
          />
        ))}

        <Button
          type="button"
          onClick={() => {
            form.reset(buildEmptyFilters(filters))
            handleChange()
          }}
          variant={'outline'}
          className="mt-4.5"
          disabled={areFiltersEmpty(values)}
        >
          Clear filters
        </Button>
      </div>
    </form>
  )
}

type TextFilterProps<T extends FieldValues> = ControllerRenderProps<T> & {
  label: string
  placeholder: string
}

function TextFilter<T extends FieldValues>({
  label,
  placeholder,
  ...props
}: TextFilterProps<T>) {
  return (
    <div className="flex w-50 flex-col space-y-1">
      <Label>{label}</Label>
      <Input placeholder={placeholder} {...props} />
    </div>
  )
}

type SelectFilterProps<T extends FieldValues> = ControllerRenderProps<T> & {
  label: string
  placeholder: string
  options: SelectOption[]
  isMultiple?: boolean | undefined
}

function SelectFilter<T extends FieldValues>({
  label,
  placeholder,
  options,
  isMultiple,
  ...props
}: SelectFilterProps<T>) {
  return (
    <div className="flex w-50 flex-col space-y-1">
      <Label>{label}</Label>
      <Select
        placeholder={placeholder}
        options={options}
        isMultiple={!!isMultiple}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  )
}

function buildEmptyFilters<T extends FieldValues>(filters: Filter<T>[]): T {
  const emptyValues: Partial<T> = {}

  filters.forEach((filter) => {
    switch (filter.type) {
      case 'text':
        emptyValues[filter.name] = '' as T[Path<T>]
        break
      case 'select':
        emptyValues[filter.name] = (filter.isMultiple ? [] : null) as T[Path<T>]
        break
    }
  })

  return emptyValues as T
}

function areFiltersEmpty<T extends FieldValues>(values: T): boolean {
  return Object.values(values).every((value) => {
    if (Array.isArray(value)) {
      return value.length === 0
    }

    if (typeof value === 'string') {
      return value === ''
    }

    return !value
  })
}

export default Filters
export { Filters, type Filter }
