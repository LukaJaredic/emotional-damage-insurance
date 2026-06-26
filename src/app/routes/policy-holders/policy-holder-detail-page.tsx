import { Navigate, useParams } from 'react-router'

import { paths } from '@/config'
import PolicyHolderDetail from '@/features/policy-holders/components/detail/policy-holder-detail'

export function PolicyHolderDetailPage() {
  const { policyHolderId } = useParams<{ policyHolderId: string }>()

  if (!policyHolderId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <PolicyHolderDetail policyHolderId={policyHolderId} />
}

export default PolicyHolderDetailPage
