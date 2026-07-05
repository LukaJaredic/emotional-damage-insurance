import { Navigate, useParams } from 'react-router'

import { paths } from '@/config'
import PolicyDetail from '@/features/policies/components/detail/policy-detail'

function PolicyDetailPage() {
  const { policyId } = useParams<{ policyId: string }>()

  if (!policyId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <PolicyDetail policyId={policyId} />
}

export default PolicyDetailPage
