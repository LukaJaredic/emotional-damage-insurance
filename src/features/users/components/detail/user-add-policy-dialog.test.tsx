import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { renderApp, testUsers } from '@/testing/test-utils'

import UserAddPolicyDialog from './user-add-policy-dialog'
import type { UserAddPolicyFormProps } from './user-add-policy-form'

vi.mock('./user-add-policy-form', () => ({
  default: ({ id, user, onStatusChange }: UserAddPolicyFormProps) => (
    <form
      id={id}
      aria-label="Mock add policy form"
      onSubmit={(event) => {
        event.preventDefault()
        onStatusChange?.('success')
      }}
    >
      <div>Viewed user: {user.id}</div>
      <button type="button" onClick={() => onStatusChange?.('pending')}>
        Set pending
      </button>
    </form>
  ),
}))

async function openDialog() {
  await renderApp(
    <UserAddPolicyDialog user={testUsers.customer}>
      <button>Trigger</button>
    </UserAddPolicyDialog>,
    { user: testUsers.admin },
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Trigger' }))

  return user
}

describe('UserAddPolicyDialog', () => {
  it('should open from trigger and render title, description, buttons, and form user', async () => {
    await openDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Add policy to user' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Choose an available policy to connect to this user.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add policy' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Viewed user: ${testUsers.customer.id}`),
    ).toBeInTheDocument()
  })

  it('should close on cancel click', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("should close on form's success status", async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Add policy' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should prevent close and disable footer actions while pending', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Set pending' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add policy' })).toBeDisabled()
  })
})
