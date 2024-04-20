const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const {format} = require('date-fns')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const isValidStatus = status => {
  const validStatuses = ['TO DO', 'IN PROGRESS', 'DONE']
  return validStatuses.includes(status)
}

const isValidPriority = priority => {
  const validPriorities = ['HIGH', 'MEDIUM', 'LOW']
  return validPriorities.includes(priority)
}

const isValidCategory = category => {
  const validCategories = ['WORK', 'HOME', 'LEARNING']
  return validCategories.includes(category)
}

const isValidDate = date => {
  return !isNaN(new Date(date).getTime())
}

const formatDate = date => {
  return format(new Date(date), 'yyyy-MM-dd')
}

app.get('/todos/', async (request, response) => {
  let getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 1=1`

  const {search_q, priority, status, category} = request.query

  if (priority) {
    if (!isValidPriority(priority)) {
      return response.status(400).send('Invalid Todo Priority')
    }
    getTodosQuery += ` AND priority = '${priority}'`
  }

  if (status) {
    if (!isValidStatus(status)) {
      return response.status(400).send('Invalid Todo Status')
    }
    getTodosQuery += ` AND status = '${status}'`
  }

  if (category) {
    if (!isValidCategory(category)) {
      return response.status(400).send('Invalid Todo Category')
    }
    getTodosQuery += ` AND category = '${category}'`
  }

  if (search_q) {
    getTodosQuery += ` AND todo LIKE '%${search_q}%'`
  }

  const todos = await database.all(getTodosQuery)
  response.send(todos)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`

  const todo = await database.get(getTodoQuery)
  if (todo) {
    response.send(todo)
  } else {
    response.status(404).send('Todo not found')
  }
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  if (!isValidDate(date)) {
    return response.status(400).send('Invalid Due Date')
  }

  const formattedDate = formatDate(date)

  const getAgendaQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${formattedDate}';`

  const agenda = await database.all(getAgendaQuery)
  response.send(agenda)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, category, priority, status, dueDate} = request.body

  if (!isValidPriority(priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }

  if (!isValidStatus(status)) {
    return response.status(400).send('Invalid Todo Status')
  }

  if (!isValidCategory(category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  if (!isValidDate(dueDate)) {
    return response.status(400).send('Invalid Due Date')
  }

  const formattedDate = formatDate(dueDate)

  const postTodoQuery = `
    INSERT INTO
      todo (id, todo, category, priority, status, due_date)
    VALUES
      (${id}, '${todo}', '${category}', '${priority}', '${status}', '${formattedDate}');`

  await database.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateColumn = ''

  if (requestBody.status && !isValidStatus(requestBody.status)) {
    return response.status(400).send('Invalid Todo Status')
  }

  if (requestBody.priority && !isValidPriority(requestBody.priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }

  if (requestBody.category && !isValidCategory(requestBody.category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  if (requestBody.dueDate && !isValidDate(requestBody.dueDate)) {
    return response.status(400).send('Invalid Due Date')
  }

  let updateTodoQuery = `UPDATE todo SET`

  if (requestBody.todo !== undefined) {
    updateColumn = 'Todo'
    updateTodoQuery += ` todo='${requestBody.todo}'`
  }

  if (requestBody.priority !== undefined) {
    updateColumn = 'Priority'
    updateTodoQuery += ` priority='${requestBody.priority}'`
  }

  if (requestBody.status !== undefined) {
    updateColumn = 'Status'
    updateTodoQuery += ` status='${requestBody.status}'`
  }

  if (requestBody.category !== undefined) {
    updateColumn = 'Category'
    updateTodoQuery += ` category='${requestBody.category}'`
  }

  if (requestBody.dueDate !== undefined) {
    updateColumn = 'Due Date'
    const formattedDate = formatDate(requestBody.dueDate)
    updateTodoQuery += ` due_date='${formattedDate}'`
  }

  updateTodoQuery += ` WHERE id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`

  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
