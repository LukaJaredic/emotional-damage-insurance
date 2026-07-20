import { Audit, DefinitionTermCard, Email } from '@/components/ui'
import Phone from '@/components/ui/phone'
import { Avatar, AvatarFallback } from '@/components/ui/shadcn/avatar'
import type { PolicyHolder } from '@/types'
import { policyHolderName, policyHolderTypeLabels } from '@/utils'

type PolicyHolderBaseInfoProps = {
  policyHolder: PolicyHolder
}

function PolicyHolderBaseInfo({ policyHolder }: PolicyHolderBaseInfoProps) {
  return (
    <DefinitionTermCard
      header={
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>{getInitials(policyHolder)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-foreground truncate text-base font-semibold">
              {policyHolderName(policyHolder)}
            </p>
            <Email
              email={policyHolder.email}
              className="block truncate text-sm"
            />
          </div>
        </div>
      }
      items={[
        {
          term: 'Type',
          definition: policyHolderTypeLabels[policyHolder.type],
        },
        ...(policyHolder.type === 'individual'
          ? [
              { term: 'First name', definition: policyHolder.firstName },
              { term: 'Last name', definition: policyHolder.lastName },
              {
                term: 'Government ID',
                definition: policyHolder.governmentId,
              },
            ]
          : [
              { term: 'Business name', definition: policyHolder.businessName },
              { term: 'Tax ID', definition: policyHolder.governmentId },
            ]),
        {
          term: 'Email',
          definition: (
            <Email email={policyHolder.email} className="text-sm font-medium" />
          ),
        },
        {
          term: 'Phone',
          definition: (
            <Phone phone={policyHolder.phone} className="text-sm font-medium" />
          ),
        },
        {
          term: 'Created',
          definition: (
            <Audit
              userId={policyHolder.createdBy}
              timestamp={policyHolder.createdAt}
            />
          ),
        },
        {
          term: 'Last edited',
          definition: (
            <Audit
              userId={policyHolder.lastEditedBy}
              timestamp={policyHolder.lastEditedAt}
            />
          ),
        },
      ]}
    />
  )
}

function getInitials(policyHolder: PolicyHolder) {
  if (policyHolder.type === 'individual') {
    return `${policyHolder.firstName[0]}${policyHolder.lastName[0]}`.toUpperCase()
  }

  return policyHolder.businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default PolicyHolderBaseInfo
