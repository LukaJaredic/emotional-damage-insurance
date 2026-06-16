import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { renderApp, testUsers } from '@/testing/test-utils'
import type { User } from '@/types'

import type { UserFormProps } from './user-form'
import UserFormDialog from './user-form-dialog'

vi.mock('./user-form', () => ({
  default: ({ id, onStatusChange }: UserFormProps) => (
    <form
      id={id}
      onSubmit={(event) => {
        event.preventDefault()
        onStatusChange?.('success')
      }}
    />
  ),
}))

async function renderDialog(user?: User) {
  return {
    ...(await renderApp(
      <UserFormDialog user={user}>
        <button id="test-trigger">Trigger</button>
      </UserFormDialog>,
      {
        user: testUsers.admin,
      },
    )),
    user: userEvent.setup(),
  }
}

async function openDialog(user?: User) {
  const { user: userEvent } = await renderDialog(user)
  await userEvent.click(screen.getByText('Trigger'))

  return userEvent
}

describe('UserFormDialog', () => {
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
      const user = await openDialog(testUsers.customer)
      await user.click(screen.getByRole('button', { name: 'Save user' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('renders', () => {
    it('should render the title, description amd buttons when creating', async () => {
      await openDialog()

      expect(
        screen.getByRole('heading', { name: 'Create a user' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Fill in the details below to create a new user.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create user' }),
      ).toBeInTheDocument()
    })

    it("should render the user's name and description when editing", async () => {
      await openDialog(testUsers.customer)

      expect(
        screen.getByRole('heading', {
          name: `${testUsers.customer.firstName} ${testUsers.customer.lastName}`,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Update the user details and save your changes.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Save user' }),
      ).toBeInTheDocument()
    })
  })
})
