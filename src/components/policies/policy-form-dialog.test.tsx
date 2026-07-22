import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { renderApp, testUsers } from '@/testing/test-utils'

import type { PolicyFormProps } from './policy-form'
import PolicyFormDialog from './policy-form-dialog'

vi.mock('./policy-form', () => ({
  default: ({ id, onStatusChange }: PolicyFormProps) => (
    <form
      id={id}
      onSubmit={(event) => {
        event.preventDefault()
        onStatusChange?.('success')
      }}
    >
      <button type="button" onClick={() => onStatusChange?.('pending')}>
        Set pending
      </button>
    </form>
  ),
}))

async function openDialog() {
  await renderApp(
    <PolicyFormDialog>
      <button>Trigger</button>
    </PolicyFormDialog>,
    {
      user: testUsers.admin,
    },
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('Trigger'))

  return user
}

describe('PolicyFormDialog', () => {
  it('should open on trigger click', async () => {
    await openDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should render the title, description and buttons', async () => {
    await openDialog()

    expect(
      screen.getByRole('heading', { name: 'Create a policy' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Fill in the details below to create a new policy.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create policy' }),
    ).toBeInTheDocument()
  })

  it('should close on cancel click', async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("should close on form's success status", async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: 'Create policy' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should stay open while the form is pending', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Set pending' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create policy' })).toBeDisabled()
  })
})
