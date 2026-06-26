import type { ReactNode } from 'react'

type DefinitionTermCardItem = {
  term: string
  definition: ReactNode
}

type DefinitionTermCardProps = {
  header: ReactNode
  items: DefinitionTermCardItem[]
}

function DefinitionTermCard({ header, items }: DefinitionTermCardProps) {
  return (
    <section className="bg-card basis-1/3 rounded-xl border p-6 shadow-sm">
      {header}

      <dl className="mt-6 flex flex-col gap-4 pt-6">
        {items.map((item) => (
          <DefinitionListItem
            key={item.term}
            term={item.term}
            description={item.definition}
          />
        ))}
      </dl>
    </section>
  )
}

function DefinitionListItem({
  term,
  description,
}: {
  term: string
  description: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 text-sm not-last:border-b">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="text-right font-medium">{description}</dd>
    </div>
  )
}

export default DefinitionTermCard
