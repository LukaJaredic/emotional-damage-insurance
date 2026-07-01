import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { renderApp, testUsers } from '@/testing/test-utils'
import type { PolicyHolder } from '@/types'

import type { PolicyHolderFormProps } from './policy-holder-form'
import PolicyHolderFormDialog from './policy-holder-form-dialog'

const policyHolder: PolicyHolder = {
  id: 'policy-holder-id',
  type: 'individual',
  firstName: 'John',
  lastName: 'Doe',
  governmentId: '1234567890123',
  email: 'john.doe@example.com',
  phone: '+38269123456',
}

vi.mock('./policy-holder-form', () => ({
  default: ({ id, onStatusChange }: PolicyHolderFormProps) => (
    <form
      id={id}
      onSubmit={(event) => {
        event.preventDefault()
        onStatusChange?.('success')
      }}
    />
  ),
}))

async function renderDialog(policyHolder?: PolicyHolder) {
  await renderApp(
    <PolicyHolderFormDialog policyHolder={policyHolder}>
      <button id="test-trigger">Trigger</button>
    </PolicyHolderFormDialog>,
    {
      user: testUsers.admin,
    },
  )

  return { user: userEvent.setup() }
}

async function openDialog(policyHolder?: PolicyHolder) {
  const { user } = await renderDialog(policyHolder)
  await user.click(screen.getByText('Trigger'))

  return user
}

describe('PolicyHolderFormDialog', () => {
  describe('opens and closes', () => {
    it('should open on trigger click', async () => {
      await openDialog()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should close on cancel click', async () => {
      const user = await openDialog()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it("should close on form's success status", async () => {
      const user = await openDialog(policyHolder)
      await user.click(
        screen.getByRole('button', { name: 'Save policy holder' }),
      )

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('renders', () => {
    it('should render the title, description and buttons when creating', async () => {
      await openDialog()

      expect(
        screen.getByRole('heading', { name: 'Create a policy holder' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Fill in the details below to create a new policy holder.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create policy holder' }),
      ).toBeInTheDocument()
    })

    it("should render the policy holder's name and description when editing", async () => {
      await openDialog(policyHolder)

      expect(
        screen.getByRole('heading', { name: 'John Doe' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Update the policy holder details and save your changes.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Save policy holder' }),
      ).toBeInTheDocument()
    })
  })
})
