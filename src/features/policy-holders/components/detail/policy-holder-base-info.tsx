import { DefinitionTermCard, Email } from '@/components/ui'
import Phone from '@/components/ui/phone'
import { Avatar, AvatarFallback } from '@/components/ui/shadcn/avatar'
import type { PolicyHolder } from '@/types'
import {
  name,
  typeLabels,
} from '@features/policy-holders/utils/policy-holder-labels'

type PolicyHolderBaseInfoProps = {
  policyHolder: PolicyHolder
}

function PolicyHolderBaseInfo({ policyHolder }: PolicyHolderBaseInfoProps) {
  const policyHolderName = name(policyHolder)

  return (
    <DefinitionTermCard
      header={
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>{getInitials(policyHolder)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-foreground text-base font-semibold">
              {policyHolderName}
            </p>
            <Email email={policyHolder.email} className="text-sm" />
          </div>
        </div>
      }
      items={[
        { term: 'Type', definition: typeLabels[policyHolder.type] },
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
