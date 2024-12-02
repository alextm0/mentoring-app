const getUsers = (req, res) => {
  res.json([{ id: 1, name: 'John Doe' }])
}

const createUser = (req, res) => {
  const { name } = req.body
  res.status(201).json({ message: `User ${name} created successfully` })
}

export { getUsers, createUser }