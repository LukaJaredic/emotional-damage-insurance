import PolicyHolderForm from '@/features/policy-holders/components/form/policy-holder-form'
import type { PolicyHolder } from '@/types/policy-holder'

function Scrap() {
  const ph: PolicyHolder = {
    id: '1',
    type: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    governmentId: '1234567890123',
    phone: '+1234567890',
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Policy holder form</h1>
        <p className="text-muted-foreground text-sm">
          Temporary playground for creating policy holders.
        </p>
      </div>
      <PolicyHolderForm policyHolder={ph} />
    </div>
  )
}

export default Scrap
