import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { paths } from '@/config'
import { testUsers } from '@/testing/test-utils'
import { userRoles } from '@/utils'

import UserCard from './user-card'

const user = testUsers.customer

function renderUserCard(action?: ReactNode) {
  return render(
    <MemoryRouter>
      <UserCard user={user} action={action} />
    </MemoryRouter>,
  )
}

describe('UserCard', () => {
  it('should render the full card as a link when action is absent', () => {
    renderUserCard()

    const link = screen.getByRole('link', {
      name: new RegExp(`${user.firstName} ${user.lastName}`, 'i'),
    })

    expect(link).toHaveAttribute('href', paths.users.detail.getHref(user.id))
    expect(link).toHaveClass('hover:bg-accent block rounded-xl border p-4')
    expect(within(link).getByText(user.email)).toBeInTheDocument()
    expect(within(link).getByText(userRoles(user.roles))).toBeInTheDocument()
  })

  it('should render action outside of the user detail link', () => {
    renderUserCard(<button type="button">Select user</button>)

    const action = screen.getByRole('button', { name: 'Select user' })
    const link = screen.getByRole('link', {
      name: new RegExp(`${user.firstName} ${user.lastName}`, 'i'),
    })

    expect(action.closest('a')).not.toBeInTheDocument()
    expect(link).not.toContainElement(action)
    expect(link).toHaveAttribute('href', paths.users.detail.getHref(user.id))
    expect(within(link).getByText(user.email)).toBeInTheDocument()
    expect(within(link).getByText(userRoles(user.roles))).toBeInTheDocument()
  })
})
