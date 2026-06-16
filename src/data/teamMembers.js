export const USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    roleId: 'admin',
    name: 'Admin',
    email: 'admin@azziandosta.com',
    role: 'Admin',
    access: 'active',
  },
  {
    id: '2',
    username: 'designer',
    password: 'designer',
    roleId: 'designer',
    name: 'Designer',
    email: 'designer@azziandosta.com',
    role: 'Designer',
    access: 'active',
  },
  {
    id: '3',
    username: 'showroom',
    password: 'showroom',
    roleId: 'showroom',
    name: 'Showroom',
    email: 'showroom@azziandosta.com',
    role: 'Showroom',
    access: 'active',
  },
]

export function authenticateUser(username, password) {
  const normalizedUsername = username.trim().toLowerCase()
  return (
    USERS.find(
      (user) =>
        user.username === normalizedUsername && user.password === password,
    ) ?? null
  )
}

export const teamMembers = USERS.map(({ password, username, roleId, ...member }) => member)
