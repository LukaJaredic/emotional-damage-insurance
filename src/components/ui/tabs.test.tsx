import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Tabs, { type TabItem } from './tabs'

const items: TabItem[] = [
  {
    value: 'now-playing',
    label: 'Now playing',
    content: 'Movies currently in theaters',
  },
  {
    value: 'coming-soon',
    label: 'Coming soon',
    content: 'Upcoming movie releases',
  },
]

function renderTabs(storageKey = 'movie-tabs') {
  return render(
    <Tabs
      items={items}
      defaultValue="now-playing"
      storageKey={storageKey}
      ariaLabel="Movies"
    />,
  )
}

describe('Tabs', () => {
  it('should render the default tab and switch content', async () => {
    const user = userEvent.setup()
    renderTabs()

    expect(screen.getByRole('tablist', { name: 'Movies' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Now playing' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Movies currently in theaters')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Coming soon' }))

    expect(screen.getByRole('tab', { name: 'Coming soon' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Upcoming movie releases')).toBeInTheDocument()
    expect(
      screen.queryByText('Movies currently in theaters'),
    ).not.toBeInTheDocument()
  })

  it('should restore the selected tab after remounting', async () => {
    const user = userEvent.setup()
    const view = renderTabs()

    await user.click(screen.getByRole('tab', { name: 'Coming soon' }))
    view.unmount()
    renderTabs()

    expect(screen.getByRole('tab', { name: 'Coming soon' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(window.localStorage.getItem('movie-tabs')).toBe('coming-soon')
  })

  it('should fall back to the default tab for an invalid stored value', () => {
    window.localStorage.setItem('movie-tabs', 'removed-tab')

    renderTabs()

    expect(screen.getByRole('tab', { name: 'Now playing' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('should keep selections isolated by storage key', async () => {
    const user = userEvent.setup()
    const view = renderTabs('first-tabs')

    await user.click(screen.getByRole('tab', { name: 'Coming soon' }))
    view.unmount()
    renderTabs('second-tabs')

    expect(screen.getByRole('tab', { name: 'Now playing' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(window.localStorage.getItem('first-tabs')).toBe('coming-soon')
    expect(window.localStorage.getItem('second-tabs')).toBeNull()
  })

  it('should not persist selection without a storage key', async () => {
    const user = userEvent.setup()
    const view = render(
      <Tabs items={items} defaultValue="now-playing" ariaLabel="Movies" />,
    )

    await user.click(screen.getByRole('tab', { name: 'Coming soon' }))

    expect(window.localStorage).toHaveLength(0)

    view.unmount()
    render(<Tabs items={items} defaultValue="now-playing" ariaLabel="Movies" />)

    expect(screen.getByRole('tab', { name: 'Now playing' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
