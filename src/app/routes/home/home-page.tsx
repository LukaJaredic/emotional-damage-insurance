import Table, { type TableColumn } from '@/components/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { User } from '@/types/user'

const users: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    roles: ['admin'],
  },
  {
    id: '2',
    firstName: 'Mia',
    lastName: 'Turner',
    email: 'mia.turner@example.com',
    roles: ['employee'],
  },
  {
    id: '3',
    firstName: 'Alex',
    lastName: 'Foster',
    email: 'alex.foster@example.com',
    roles: ['employee', 'customer'],
  },
  {
    id: '4',
    firstName: 'Sara',
    lastName: 'Mills',
    email: 'sara.mills@example.com',
    roles: ['customer'],
  },
  {
    id: '5',
    firstName: 'Liam',
    lastName: 'Bennett',
    email: 'liam.bennett@example.com',
    roles: ['employee'],
  },
  {
    id: '6',
    firstName: 'Emma',
    lastName: 'Coleman',
    email: 'emma.coleman@example.com',
    roles: ['admin', 'employee'],
  },
  {
    id: '7',
    firstName: 'Noah',
    lastName: 'Hayes',
    email: 'noah.hayes@example.com',
    roles: ['customer'],
  },
  {
    id: '8',
    firstName: 'Olivia',
    lastName: 'Reed',
    email: 'olivia.reed@example.com',
    roles: ['employee'],
  },
  {
    id: '9',
    firstName: 'Ethan',
    lastName: 'Ward',
    email: 'ethan.ward@example.com',
    roles: ['customer'],
  },
  {
    id: '10',
    firstName: 'Ava',
    lastName: 'Price',
    email: 'ava.price@example.com',
    roles: ['employee', 'customer'],
  },
  {
    id: '11',
    firstName: 'Mason',
    lastName: 'Brooks',
    email: 'mason.brooks@example.com',
    roles: ['employee'],
  },
  {
    id: '12',
    firstName: 'Sophia',
    lastName: 'Russell',
    email: 'sophia.russell@example.com',
    roles: ['admin'],
  },
  {
    id: '13',
    firstName: 'Lucas',
    lastName: 'Griffin',
    email: 'lucas.griffin@example.com',
    roles: ['customer'],
  },
  {
    id: '14',
    firstName: 'Isabella',
    lastName: 'Perry',
    email: 'isabella.perry@example.com',
    roles: ['employee'],
  },
  {
    id: '15',
    firstName: 'Logan',
    lastName: 'Watson',
    email: 'logan.watson@example.com',
    roles: ['customer'],
  },
  {
    id: '16',
    firstName: 'Mia',
    lastName: 'Hughes',
    email: 'mia.hughes@example.com',
    roles: ['employee', 'customer'],
  },
  {
    id: '17',
    firstName: 'James',
    lastName: 'Long',
    email: 'james.long@example.com',
    roles: ['employee'],
  },
  {
    id: '18',
    firstName: 'Charlotte',
    lastName: 'Flores',
    email: 'charlotte.flores@example.com',
    roles: ['admin'],
  },
  {
    id: '19',
    firstName: 'Benjamin',
    lastName: 'Washington',
    email: 'benjamin.washington@example.com',
    roles: ['customer'],
  },
  {
    id: '20',
    firstName: 'Amelia',
    lastName: 'Butler',
    email: 'amelia.butler@example.com',
    roles: ['employee'],
  },
  {
    id: '21',
    firstName: 'Elijah',
    lastName: 'Simmons',
    email: 'elijah.simmons@example.com',
    roles: ['customer'],
  },
  {
    id: '22',
    firstName: 'Harper',
    lastName: 'Foster',
    email: 'harper.foster@example.com',
    roles: ['employee', 'customer'],
  },
  {
    id: '23',
    firstName: 'Henry',
    lastName: 'Gonzalez',
    email: 'henry.gonzalez@example.com',
    roles: ['employee'],
  },
  {
    id: '24',
    firstName: 'Evelyn',
    lastName: 'Bryant',
    email: 'evelyn.bryant@example.com',
    roles: ['admin', 'employee'],
  },
]

const columns: TableColumn<User>[] = [
  {
    dataIndex: 'id',
    title: 'ID',
  },
  {
    dataIndex: 'firstName',
    title: 'Name',
    render: (row) => `${row.firstName} ${row.lastName}`,
  },
  {
    dataIndex: 'firstName',
    title: 'Preferred Display',
    render: (row) => `${row.lastName}, ${row.firstName} (${row.id})`,
  },
  {
    dataIndex: 'email',
    title: 'Email',
  },
  {
    dataIndex: 'email',
    title: 'Contact Route',
    render: (row) =>
      `primary:${row.email}; backup:${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}@ops.insurance-admin.internal`,
  },
  {
    dataIndex: 'roles',
    title: 'Roles',
    render: (row) => row.roles.join(', '),
  },
  {
    dataIndex: 'roles',
    title: 'Coverage Scope',
    render: (row) =>
      row.roles.includes('admin')
        ? 'Full administration access across underwriting, claims, billing, and reporting'
        : row.roles.includes('employee')
          ? 'Operational access for assigned policy, claims, and customer workflows'
          : 'Self-service access limited to customer-facing policy and claims areas',
  },
  {
    dataIndex: 'lastName',
    title: 'Assigned Region',
    render: (row) =>
      `${row.lastName} regional service desk covering Northern Adriatic, Central Europe, and remote broker partners`,
  },
]

function HomePage() {
  return (
    <Card className="h-[28rem]">
      <CardHeader>
        <CardTitle>Users Table</CardTitle>
        <CardDescription>
          Example of the shared virtualized table component.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-5.5rem)]">
        <Table rows={users} columns={columns} />
      </CardContent>
    </Card>
  )
}

export default HomePage
